<script lang="ts" setup>
import { ref } from 'vue'
import JSZip from 'jszip'
import { generateKeyPair, KEY_TYPES, type KeyType } from '@/utils/ssh'

const keyType = ref<KeyType>('rsa-2048')
const passphrase = ref('')
const passphraseConfirm = ref('')
const comment = ref('')
const privateKey = ref('')
const publicKey = ref('')
const generating = ref(false)
const error = ref('')
const passphraseMismatch = ref(false)

const keyTypes = Object.entries(KEY_TYPES).map(([id, meta]) => ({
  id: id as KeyType,
  label: meta.label,
}))

async function generate() {
  if (passphrase.value && passphrase.value !== passphraseConfirm.value) {
    passphraseMismatch.value = true
    return
  }
  passphraseMismatch.value = false
  generating.value = true
  error.value = ''
  try {
    const result = await generateKeyPair(
      keyType.value,
      passphrase.value || undefined,
      comment.value || undefined,
    )
    privateKey.value = result.privateKeyPem
    publicKey.value = result.publicKeySsh
  } catch (e) {
    error.value = '密钥生成失败: ' + (e instanceof Error ? e.message : '未知错误')
  } finally {
    generating.value = false
  }
}

function copyPrivate() {
  navigator.clipboard.writeText(privateKey.value)
}

function copyPublic() {
  navigator.clipboard.writeText(publicKey.value)
}

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function downloadPrivate() {
  const ext = keyType.value.startsWith('ecdsa') ? 'ecdsa' : 'rsa'
  download(`id_${ext}`, privateKey.value)
}

function downloadPublic() {
  const ext = keyType.value.startsWith('ecdsa') ? 'ecdsa' : 'rsa'
  download(`id_${ext}.pub`, publicKey.value)
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9一-鿿._@-]/g, '_').slice(0, 64) || 'key'
}

async function downloadZip() {
  const ext = keyType.value.startsWith('ecdsa') ? 'ecdsa' : 'rsa'
  const baseName = comment.value.trim() ? sanitizeFilename(comment.value.trim()) : `id_${ext}`

  const zip = new JSZip()
  zip.file(baseName, privateKey.value)
  zip.file(`${baseName}.pub`, publicKey.value)

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${baseName}.zip`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Key type selector -->
    <div>
      <label class="block text-xs font-semibold text-gray-500 mb-2">密钥类型</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="kt in keyTypes"
          :key="kt.id"
          :class="[
            'px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer border',
            keyType === kt.id
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
          ]"
          @click="keyType = kt.id"
        >
          {{ kt.label }}
        </button>
      </div>
    </div>

    <!-- Comment -->
    <div>
      <label class="block text-xs font-semibold text-gray-500 mb-1">注释 (可选)</label>
      <input
        v-model="comment"
        class="w-full max-w-[360px] p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        placeholder="user@host"
        type="text"
      />
    </div>

    <!-- Passphrase -->
    <div class="flex flex-wrap gap-4">
      <div>
        <label class="block text-xs font-semibold text-gray-500 mb-1">私钥密码 (可选)</label>
        <input
          v-model="passphrase"
          class="w-52 p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="留空则不加密"
          type="password"
        />
      </div>
      <div v-if="passphrase">
        <label class="block text-xs font-semibold text-gray-500 mb-1">确认密码</label>
        <input
          v-model="passphraseConfirm"
          :class="[
            'w-52 p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none',
            passphraseMismatch ? 'border-red-400 ring-2 ring-red-300' : 'border-gray-200',
          ]"
          placeholder="再次输入密码"
          type="password"
        />
        <p v-if="passphraseMismatch" class="text-xs text-red-500 mt-1">两次输入的密码不一致</p>
      </div>
    </div>

    <!-- Generate button -->
    <div class="flex gap-2">
      <button
        :disabled="generating"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        @click="generate"
      >
        {{ generating ? '生成中...' : '生成密钥对' }}
      </button>
      <button
        :disabled="!privateKey"
        class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        @click="downloadZip"
      >
        下载 ZIP
      </button>
    </div>

    <!-- Error -->
    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

    <!-- Private key output -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="text-xs font-semibold text-gray-500">私钥</label>
        <div class="flex gap-2">
          <button
            class="px-3 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-50 transition cursor-pointer"
            @click="copyPrivate"
          >
            复制
          </button>
          <button
            class="px-3 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-50 transition cursor-pointer"
            @click="downloadPrivate"
          >
            下载
          </button>
        </div>
      </div>
      <textarea
        :value="privateKey"
        class="w-full h-120 p-3 border border-gray-200 rounded-lg text-xs font-mono bg-gray-50 resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        placeholder="点击「生成密钥对」生成私钥"
        readonly
      />
    </div>

    <!-- Public key output -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="text-xs font-semibold text-gray-500">公钥</label>
        <div class="flex gap-2">
          <button
            class="px-3 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-50 transition cursor-pointer"
            @click="copyPublic"
          >
            复制
          </button>
          <button
            class="px-3 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-50 transition cursor-pointer"
            @click="downloadPublic"
          >
            下载
          </button>
        </div>
      </div>
      <textarea
        :value="publicKey"
        class="w-full h-20 p-3 border border-gray-200 rounded-lg text-xs font-mono bg-gray-50 resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        placeholder="点击「生成密钥对」生成公钥"
        readonly
      />
    </div>
  </div>
</template>
