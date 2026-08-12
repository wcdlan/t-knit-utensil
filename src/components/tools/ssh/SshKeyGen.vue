<script lang="ts" setup>
	import { ref } from 'vue';
	import JSZip from 'jszip';
	import { NAlert, NButton, NButtonGroup, NInput } from 'naive-ui';
	import { generateKeyPair, KEY_TYPES, type KeyType } from '@/utils/ssh';
	import { copyToClipboard } from '@/utils/clipboard';
	import { downloadBlob, downloadTextFile } from '@/utils/download';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/components/common/TkuIcon.vue';

	const keyType = ref<KeyType>('rsa-2048');
	const passphrase = ref('');
	const passphraseConfirm = ref('');
	const comment = ref('');
	const privateKey = ref('');
	const publicKey = ref('');
	const generating = ref(false);
	const error = ref('');
	const passphraseMismatch = ref(false);

	const keyTypes = Object.entries(KEY_TYPES).map(([id, meta]) => ({
		id: id as KeyType,
		label: meta.label
	}));

	async function generate() {
		if (passphrase.value && passphrase.value !== passphraseConfirm.value) {
			passphraseMismatch.value = true;
			return;
		}
		passphraseMismatch.value = false;
		generating.value = true;
		error.value = '';
		try {
			const result = await generateKeyPair(keyType.value, passphrase.value || undefined, comment.value || undefined);
			privateKey.value = result.privateKeyPem;
			publicKey.value = result.publicKeySsh;
		} catch (e) {
			error.value = '密钥生成失败: ' + (e instanceof Error ? e.message : '未知错误');
		} finally {
			generating.value = false;
		}
	}

	function copyPrivate() {
		copyToClipboard(privateKey.value);
	}

	function copyPublic() {
		copyToClipboard(publicKey.value);
	}

	function downloadPrivate() {
		const ext = keyType.value.startsWith('ecdsa') ? 'ecdsa' : 'rsa';
		downloadTextFile(privateKey.value, `id_${ext}`);
	}

	function downloadPublic() {
		const ext = keyType.value.startsWith('ecdsa') ? 'ecdsa' : 'rsa';
		downloadTextFile(publicKey.value, `id_${ext}.pub`);
	}

	function sanitizeFilename(name: string): string {
		return name.replace(/[^a-zA-Z0-9一-鿿._@-]/g, '_').slice(0, 64) || 'key';
	}

	async function downloadZip() {
		const ext = keyType.value.startsWith('ecdsa') ? 'ecdsa' : 'rsa';
		const baseName = comment.value.trim() ? sanitizeFilename(comment.value.trim()) : `id_${ext}`;

		const zip = new JSZip();
		zip.file(baseName, privateKey.value);
		zip.file(`${baseName}.pub`, publicKey.value);

		const blob = await zip.generateAsync({ type: 'blob' });
		downloadBlob(blob, `${baseName}.zip`);
	}
</script>

<template>
	<div class="space-y-6">
		<!-- Key type selector -->
		<div class="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
			<span class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">密钥类型</span>
			<n-button-group>
				<n-button
					v-for="kt in keyTypes"
					:key="kt.id"
					:type="keyType === kt.id ? 'primary' : 'default'"
					@click="keyType = kt.id"
				>
					{{ kt.label }}
				</n-button>
			</n-button-group>
		</div>

		<!-- Comment -->
		<div>
			<label class="block text-xs font-semibold text-slate-500 mb-1">注释 (可选)</label>
			<n-input v-model:value="comment" class="max-w-[360px]" placeholder="user@host" />
		</div>

		<!-- Passphrase -->
		<div class="flex flex-wrap gap-4">
			<div>
				<label class="block text-xs font-semibold text-slate-500 mb-1">私钥密码 (可选)</label>
				<n-input
					v-model:value="passphrase"
					class="w-52"
					placeholder="留空则不加密"
					show-password-toggle
					type="password"
				/>
			</div>
			<div v-if="passphrase">
				<label class="block text-xs font-semibold text-slate-500 mb-1">确认密码</label>
				<n-input
					v-model:value="passphraseConfirm"
					:status="passphraseMismatch ? 'error' : undefined"
					class="w-52"
					placeholder="再次输入密码"
					show-password-toggle
					type="password"
				/>
				<p v-if="passphraseMismatch" class="text-xs text-red-500 mt-1">两次输入的密码不一致</p>
			</div>
		</div>

		<!-- Generate button -->
		<div class="flex gap-2">
			<n-button :loading="generating" type="primary" @click="generate">
				<span v-if="!generating" class="flex items-center gap-1.5">
					<TkuIcon :name="icons.key" :size="16" />
					<span>生成密钥对</span>
				</span>
				<span v-else>生成中...</span>
			</n-button>
			<n-button :disabled="!privateKey" secondary @click="downloadZip">
				<span class="flex items-center gap-1.5">
					<TkuIcon :name="icons.package" :size="16" />
					<span>下载 ZIP</span>
				</span>
			</n-button>
		</div>

		<!-- Error -->
		<n-alert v-if="error" class="text-sm" type="error"> {{ error }} </n-alert>

		<!-- Private key output -->
		<div>
			<div class="flex items-center justify-between mb-2">
				<span class="text-xs font-semibold text-slate-500">私钥</span>
				<div class="flex gap-2">
					<n-button secondary size="small" @click="copyPrivate"> 复制 </n-button>
					<n-button secondary size="small" @click="downloadPrivate"> 下载 </n-button>
				</div>
			</div>
			<n-input
				:autosize="{ minRows: 6 }"
				:class="{ shimmer: generating }"
				:value="privateKey"
				placeholder="点击「生成密钥对」生成私钥"
				readonly
				type="textarea"
			/>
		</div>

		<!-- Public key output -->
		<div>
			<div class="flex items-center justify-between mb-2">
				<span class="text-xs font-semibold text-slate-500">公钥</span>
				<div class="flex gap-2">
					<n-button secondary size="small" @click="copyPublic"> 复制 </n-button>
					<n-button secondary size="small" @click="downloadPublic"> 下载 </n-button>
				</div>
			</div>
			<n-input
				:autosize="{ minRows: 3 }"
				:class="{ shimmer: generating }"
				:value="publicKey"
				placeholder="点击「生成密钥对」生成公钥"
				readonly
				type="textarea"
			/>
		</div>
	</div>
</template>
