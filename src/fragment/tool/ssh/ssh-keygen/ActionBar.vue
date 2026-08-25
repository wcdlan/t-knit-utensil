<script lang="ts" setup>
	import { NButton } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import type { SshCheckState } from '@/types/ssh';

	defineProps<{
		checkState: SshCheckState;
		generating: boolean;
		hasPrivateKey: boolean;
	}>();

	const emit = defineEmits<{
		generate: [];
		downloadZip: [];
	}>();
</script>

<template>
	<div class="flex gap-2">
		<n-button :disabled="checkState !== 'available'" :loading="generating" type="primary" @click="emit('generate')">
			<span v-if="!generating" class="flex items-center gap-1.5">
				<TkuIcon :name="icons.key" :size="16" />
				<span>生成密钥对</span>
			</span>
			<span v-else>生成中...</span>
		</n-button>
		<n-button :disabled="!hasPrivateKey" secondary @click="emit('downloadZip')">
			<span class="flex items-center gap-1.5">
				<TkuIcon :name="icons.package" :size="16" />
				<span>下载 ZIP</span>
			</span>
		</n-button>
		<p class="self-center text-xs text-slate-400">
			密钥由服务器系统 ssh-keygen 生成，私钥仅存于请求内存，读回后即销毁。
		</p>
	</div>
</template>
