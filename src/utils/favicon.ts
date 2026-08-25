// Favicon 生成相关工具函数

/** 将多个 PNG buffer 编码为 ICO 文件格式的 ArrayBuffer */
export function encodeICO(pngBuffers: ArrayBuffer[]): ArrayBuffer {
	const count = pngBuffers.length;
	const headerSize = 6;
	const entrySize = 16;
	const dirSize = headerSize + count * entrySize;

	const offsets: number[] = [];
	let offset = dirSize;
	for (const buf of pngBuffers) {
		offsets.push(offset);
		offset += buf.byteLength;
	}

	const buffer = new ArrayBuffer(offset);
	const dv = new DataView(buffer);

	dv.setUint16(0, 0, true);
	dv.setUint16(2, 1, true);
	dv.setUint16(4, count, true);

	for (let i = 0; i < count; i++) {
		const base = headerSize + i * entrySize;
		const size = Math.min(pngBuffers[i].byteLength, 256);
		dv.setUint8(base, Math.min(size, 256));
		dv.setUint8(base + 1, Math.min(size, 256));
		dv.setUint8(base + 2, 0);
		dv.setUint8(base + 3, 0);
		dv.setUint16(base + 4, 1, true);
		dv.setUint16(base + 6, 32, true);
		dv.setUint32(base + 8, pngBuffers[i].byteLength, true);
		dv.setUint32(base + 12, offsets[i], true);
	}

	const uint8 = new Uint8Array(buffer);
	for (let i = 0; i < count; i++) {
		uint8.set(new Uint8Array(pngBuffers[i]), offsets[i]);
	}

	return buffer;
}

/** 将 data URL 转为 ArrayBuffer */
export async function dataUrlToArrayBuffer(dataUrl: string): Promise<ArrayBuffer> {
	const res = await fetch(dataUrl);
	return res.arrayBuffer();
}
