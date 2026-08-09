// SSH key generation & formatting utilities using Web Crypto API

export type KeyType = 'rsa-2048' | 'rsa-3072' | 'rsa-4096' | 'ecdsa-p256' | 'ecdsa-p384' | 'ecdsa-p521'

export interface KeyPairResult {
    privateKeyPem: string
    publicKeySsh: string
}

interface KeyTypeMeta {
    label: string
    sshAlgorithm: string
    curveOid?: number[] // for ECDSA, the curve OID used in SSH wire format
}

export const KEY_TYPES: Record<KeyType, KeyTypeMeta> = {
    'rsa-2048': {label: 'RSA 2048', sshAlgorithm: 'ssh-rsa'},
    'rsa-3072': {label: 'RSA 3072', sshAlgorithm: 'ssh-rsa'},
    'rsa-4096': {label: 'RSA 4096', sshAlgorithm: 'ssh-rsa'},
    'ecdsa-p256': {label: 'ECDSA P-256', sshAlgorithm: 'ecdsa-sha2-nistp256', curveOid: [1, 2, 840, 10045, 3, 1, 7]},
    'ecdsa-p384': {label: 'ECDSA P-384', sshAlgorithm: 'ecdsa-sha2-nistp384', curveOid: [1, 3, 132, 0, 34]},
    'ecdsa-p521': {label: 'ECDSA P-521', sshAlgorithm: 'ecdsa-sha2-nistp521', curveOid: [1, 3, 132, 0, 35]},
}

// ---- ASN.1 DER helpers ----

function derLength(len: number): Uint8Array {
    if (len < 0x80) return new Uint8Array([len])
    const bytes: number[] = []
    let v = len
    while (v > 0) {
        bytes.unshift(v & 0xff);
        v >>>= 8
    }
    return new Uint8Array([0x80 | bytes.length, ...bytes])
}

function derTag(tag: number, content: Uint8Array): Uint8Array {
    const len = derLength(content.length)
    const out = new Uint8Array(1 + len.length + content.length)
    out[0] = tag
    out.set(len, 1)
    out.set(content, 1 + len.length)
    return out
}

function derSequence(content: Uint8Array): Uint8Array {
    return derTag(0x30, content)
}

function derOctetString(content: Uint8Array): Uint8Array {
    return derTag(0x04, content)
}

function derInteger(bytes: Uint8Array): Uint8Array {
    let b = bytes
    while (b.length > 1 && b[0] === 0) b = b.slice(1)
    if (b.length === 0) b = new Uint8Array([0])
    if (b[0] & 0x80) b = concatArrays(new Uint8Array([0x00]), b)
    return derTag(0x02, b)
}

function derNull(): Uint8Array {
    return new Uint8Array([0x05, 0x00])
}

// ---- Binary helpers ----

function concatArrays(...arrays: Uint8Array[]): Uint8Array {
    const totalLen = arrays.reduce((s, a) => s + a.length, 0)
    const result = new Uint8Array(totalLen)
    let offset = 0
    for (const a of arrays) {
        result.set(a, offset)
        offset += a.length
    }
    return result
}

function writeUint32BE(v: number): Uint8Array {
    const buf = new Uint8Array(4)
    buf[0] = (v >>> 24) & 0xff
    buf[1] = (v >>> 16) & 0xff
    buf[2] = (v >>> 8) & 0xff
    buf[3] = v & 0xff
    return buf
}

function sshString(data: Uint8Array): Uint8Array {
    return concatArrays(writeUint32BE(data.length), data)
}

function sshMpint(bytes: Uint8Array): Uint8Array {
    // Remove leading zeros
    let b = bytes
    while (b.length > 1 && b[0] === 0) b = b.slice(1)
    // If high bit is set, prepend zero byte
    if (b[0] & 0x80) b = concatArrays(new Uint8Array([0x00]), b)
    return sshString(b)
}

function base64urlToBytes(str: string): Uint8Array {
    // Convert base64url to base64 then decode
    let b64 = str.replace(/-/g, '+').replace(/_/g, '/')
    while (b64.length % 4) b64 += '='
    const raw = atob(b64)
    return new Uint8Array([...raw].map((c) => c.charCodeAt(0)))
}

function bytesToBase64(bytes: Uint8Array): string {
    const raw = String.fromCharCode(...bytes)
    let b64 = btoa(raw)
    // Split into 64-char lines
    const lines: string[] = []
    for (let i = 0; i < b64.length; i += 64) {
        lines.push(b64.slice(i, i + 64))
    }
    return lines.join('\n')
}

// ---- JWK to OpenSSH public key ----

function rsaJwkToSsh(nB64u: string, eB64u: string, comment?: string): string {
    const n = base64urlToBytes(nB64u)
    const e = base64urlToBytes(eB64u)
    const body = concatArrays(
        sshString(new TextEncoder().encode('ssh-rsa')),
        sshMpint(e),
        sshMpint(n),
    )
    const key = bytesToBase64(body)
    return `ssh-rsa ${key.replace(/\n/g, '')}${comment ? ' ' + comment : ''}`
}

function ecdsaJwkToSsh(curveOid: number[], xB64u: string, yB64u: string, comment?: string): string {
    const x = base64urlToBytes(xB64u)
    const y = base64urlToBytes(yB64u)
    // EC point: 0x04 || x || y (uncompressed)
    const point = concatArrays(new Uint8Array([0x04]), x, y)
    const meta = KEY_TYPES[`ecdsa-${getCrvFromOid(curveOid)}` as KeyType]
    const body = concatArrays(
        sshString(new TextEncoder().encode(meta.sshAlgorithm)),
        sshString(new TextEncoder().encode(meta.sshAlgorithm.split('-').slice(2).join('-'))), // curve name
        sshString(point),
    )
    const key = bytesToBase64(body)
    return `${meta.sshAlgorithm} ${key.replace(/\n/g, '')}${comment ? ' ' + comment : ''}`
}

function getCrvFromOid(oid: number[]): string {
    const oidStr = oid.join('.')
    if (oidStr === '1.2.840.10045.3.1.7') return 'p256'
    if (oidStr === '1.3.132.0.34') return 'p384'
    if (oidStr === '1.3.132.0.35') return 'p521'
    return 'p256'
}

function getOidFromCrv(crv: string): number[] {
    switch (crv) {
        case 'P-256':
            return [1, 2, 840, 10045, 3, 1, 7]
        case 'P-384':
            return [1, 3, 132, 0, 34]
        case 'P-521':
            return [1, 3, 132, 0, 35]
        default:
            return [1, 2, 840, 10045, 3, 1, 7]
    }
}

function jwkToOpenSshPublicKey(jwk: JsonWebKey, curveOid?: number[], comment?: string): string {
    if (jwk.kty === 'RSA') {
        return rsaJwkToSsh(jwk.n!, jwk.e!, comment)
    } else if (jwk.kty === 'EC') {
        return ecdsaJwkToSsh(curveOid || getOidFromCrv(jwk.crv!), jwk.x!, jwk.y!, comment)
    }
    throw new Error('Unsupported key type: ' + jwk.kty)
}

// ---- PEM formatting ----

function derToPem(der: Uint8Array, header: string): string {
    const b64 = bytesToBase64(der)
    return `-----BEGIN ${header}-----\n${b64}\n-----END ${header}-----`
}

// ---- PKCS8 encrypted private key ----

const PBES2_OID = [1, 2, 840, 113549, 1, 5, 13]
const PBKDF2_OID = [1, 2, 840, 113549, 1, 5, 12]
const AES256_CBC_OID = [2, 16, 840, 1, 101, 3, 4, 1, 42]
const HMAC_SHA256_OID = [1, 2, 840, 113549, 2, 9]

async function encryptPrivateKey(pkcs8Der: ArrayBuffer, passphrase: string): Promise<ArrayBuffer> {
    // PBKDF2 params
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const iterations = 100000
    const iv = crypto.getRandomValues(new Uint8Array(16))

    // Derive key from passphrase
    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
        'raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey'],
    )
    const aesKey = await crypto.subtle.deriveKey(
        {name: 'PBKDF2', salt, iterations, hash: 'SHA-256'},
        keyMaterial,
        {name: 'AES-CBC', length: 256},
        false,
        ['encrypt'],
    )

    // Encrypt PKCS#8 DER
    const encrypted = await crypto.subtle.encrypt(
        {name: 'AES-CBC', iv},
        aesKey,
        pkcs8Der,
    )

    // Build EncryptedPrivateKeyInfo ASN.1 structure
    // encryptionAlgorithm = PBES2 with PBKDF2+HMAC-SHA256 + AES-256-CBC
    const algoId = buildPbes2AlgoId(salt, iterations, iv)
    const epki = derSequence(concatArrays(
        algoId,
        derOctetString(new Uint8Array(encrypted)),
    ))

    return epki.buffer as ArrayBuffer
}

function uintToBytes(v: number): Uint8Array {
    if (v === 0) return new Uint8Array([0])
    const bytes: number[] = []
    let remaining = v
    while (remaining > 0) {
        bytes.unshift(remaining & 0xff)
        remaining >>>= 8
    }
    return new Uint8Array(bytes)
}

function buildPbes2AlgoId(salt: Uint8Array, iterations: number, iv: Uint8Array): Uint8Array {
    // PBKDF2-params
    const pbkdf2Params = derSequence(concatArrays(
        derOctetString(salt),
        derInteger(uintToBytes(iterations)),
        // keyLength INTEGER 32 (optional, but included for compatibility)
        derInteger(new Uint8Array([32])),
        // prf AlgorithmIdentifier: HMAC-SHA256
        derSequence(concatArrays(
            encodeOidFull(HMAC_SHA256_OID),
            derNull(),
        )),
    ))

    // PBKDF2 AlgorithmIdentifier
    const pbkdf2AlgoId = derSequence(concatArrays(
        encodeOidFull(PBKDF2_OID),
        pbkdf2Params,
    ))

    // AES-256-CBC AlgorithmIdentifier with IV parameter
    const aesAlgoId = derSequence(concatArrays(
        encodeOidFull(AES256_CBC_OID),
        derOctetString(iv),
    ))

    // PBES2-params
    const pbes2Params = derSequence(concatArrays(pbkdf2AlgoId, aesAlgoId))

    // PBES2 AlgorithmIdentifier
    return derSequence(concatArrays(
        encodeOidFull(PBES2_OID),
        pbes2Params,
    ))
}

function encodeOidFull(oid: number[]): Uint8Array {
    const parts: number[] = [40 * oid[0] + oid[1]]
    for (let i = 2; i < oid.length; i++) {
        const v = oid[i]
        if (v < 0x80) {
            parts.push(v)
        } else {
            const stack: number[] = [v & 0x7f]
            let remaining = v >>> 7
            while (remaining > 0) {
                stack.unshift((remaining & 0x7f) | 0x80)
                remaining >>>= 7
            }
            parts.push(...stack)
        }
    }
    return concatArrays(new Uint8Array([0x06]), derLength(parts.length), new Uint8Array(parts))
}

// ---- Main API ----

export async function generateKeyPair(
    keyType: KeyType,
    passphrase?: string,
    comment?: string,
): Promise<KeyPairResult> {
    const meta = KEY_TYPES[keyType]
    let algorithm: RsaHashedKeyGenParams | EcKeyGenParams

    if (keyType.startsWith('rsa')) {
        const modulusLength = parseInt(keyType.split('-')[1])
        algorithm = {
            name: 'RSASSA-PKCS1-v1_5',
            modulusLength,
            publicExponent: new Uint8Array([1, 0, 1]), // 65537
            hash: 'SHA-256',
        }
    } else {
        // ECDSA
        const curveMap: Record<string, string> = {'ecdsa-p256': 'P-256', 'ecdsa-p384': 'P-384', 'ecdsa-p521': 'P-521'}
        algorithm = {
            name: 'ECDSA',
            namedCurve: curveMap[keyType],
        }
    }

    const keyPair = await crypto.subtle.generateKey(
        algorithm,
        true, // extractable
        ['sign', 'verify'],
    )

    // Export private key as PKCS#8
    const pkcs8Der = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey)

    let privateKeyPem: string
    if (passphrase) {
        const encrypted = await encryptPrivateKey(pkcs8Der, passphrase)
        privateKeyPem = derToPem(new Uint8Array(encrypted), 'ENCRYPTED PRIVATE KEY')
    } else {
        privateKeyPem = derToPem(new Uint8Array(pkcs8Der), 'PRIVATE KEY')
    }

    // Export public key as JWK, convert to OpenSSH format
    const jwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey)
    const publicKeySsh = jwkToOpenSshPublicKey(jwk, meta.curveOid, comment)

    return {privateKeyPem, publicKeySsh}
}
