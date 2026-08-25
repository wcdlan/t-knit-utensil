<script lang="ts" setup>
	import { onMounted, ref } from 'vue';
	import JSZip from 'jszip';
	import { NAlert } from 'naive-ui';
	import { checkSshKeygen, generateKeyPair } from '@/utils/ssh';
	import { copyToClipboard } from '@/utils/clipboard';
	import { downloadBlob, downloadTextFile } from '@/utils/download';
	import type { KeyType, SshCheckState } from '@/types/ssh';
	import AvailabilityBanner from '@/fragment/tool/ssh/ssh-keygen/AvailabilityBanner.vue';
	import KeyTypeSelect from '@/fragment/tool/ssh/ssh-keygen/KeyTypeSelect.vue';
	import CommentInput from '@/fragment/tool/ssh/ssh-keygen/CommentInput.vue';
	import PassphraseInput from '@/fragment/tool/ssh/ssh-keygen/PassphraseInput.vue';
	import ActionBar from '@/fragment/tool/ssh/ssh-keygen/ActionBar.vue';
	import PrivateKeyOutput from '@/fragment/tool/ssh/ssh-keygen/PrivateKeyOutput.vue';
	import PublicKeyOutput from '@/fragment/tool/ssh/ssh-keygen/PublicKeyOutput.vue';
	import AboutPanel from '@/fragment/tool/ssh/ssh-keygen/AboutPanel.vue';

	const keyType = ref<KeyType>('rsa-2048');
	const passphrase = ref('');
	const passphraseConfirm = ref('');
	const comment = ref('');
	const privateKey = ref('');
	const publicKey = ref('');
	const generating = ref(false);
	const error = ref('');
	const passphraseMismatch = ref(false);
	const checkState = ref<SshCheckState>('checking');
	const serverVersion = ref('');

	async function checkAvailability() {
		checkState.value = 'checking';
		const result = await checkSshKeygen();
		checkState.value = result.available ? 'available' : 'unavailable';
		serverVersion.value = result.version ?? '';
	}

	onMounted(checkAvailability);

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
		<AvailabilityBanner :check-state="checkState" :server-version="serverVersion" @retry="checkAvailability" />

		<KeyTypeSelect :key-type="keyType" @update:key-type="(v: KeyType) => (keyType = v)" />

		<CommentInput v-model:model-value="comment" />

		<PassphraseInput
			v-model:passphrase="passphrase"
			v-model:passphrase-confirm="passphraseConfirm"
			:mismatch="passphraseMismatch"
		/>

		<ActionBar
			:check-state="checkState"
			:generating="generating"
			:has-private-key="!!privateKey"
			@generate="generate"
			@download-zip="downloadZip"
		/>

		<n-alert v-if="error" class="text-sm" type="error"> {{ error }} </n-alert>

		<PrivateKeyOutput :generating="generating" :value="privateKey" @copy="copyPrivate" @download="downloadPrivate" />

		<PublicKeyOutput :generating="generating" :value="publicKey" @copy="copyPublic" @download="downloadPublic" />

		<AboutPanel />
	</div>
</template>
