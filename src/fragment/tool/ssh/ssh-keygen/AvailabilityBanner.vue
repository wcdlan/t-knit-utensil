<script lang="ts" setup>
	import { NAlert, NButton } from 'naive-ui';
	import type { SshCheckState } from '@/types/ssh';

	defineProps<{
		checkState: SshCheckState;
		serverVersion: string;
	}>();

	const emit = defineEmits<{
		retry: [];
	}>();
</script>

<template>
	<n-alert v-if="checkState === 'checking'" class="text-sm" type="info"> 正在检测系统 ssh-keygen 可用性... </n-alert>
	<n-alert v-else-if="checkState === 'available'" class="text-sm" type="success">
		系统已安装 ssh-keygen（OpenSSH {{ serverVersion }}），密钥在本机服务端生成，不会上传外部网络。
	</n-alert>
	<n-alert v-else class="text-sm" type="error">
		<div class="flex items-center justify-between gap-3">
			<span>未检测到系统 ssh-keygen，无法生成密钥。请安装 openssh-client 后重试（macOS / Windows 一般自带）。</span>
			<n-button secondary size="small" @click="emit('retry')">重试检测</n-button>
		</div>
	</n-alert>
</template>
