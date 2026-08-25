<script lang="ts" setup>
	import { NInput } from 'naive-ui';

	const props = defineProps<{
		passphrase: string;
		passphraseConfirm: string;
		mismatch: boolean;
	}>();

	const emit = defineEmits<{
		'update:passphrase': [value: string];
		'update:passphraseConfirm': [value: string];
	}>();
</script>

<template>
	<div class="flex flex-wrap gap-4">
		<div>
			<label class="mb-1 block text-xs font-semibold text-slate-500">私钥密码 (可选)</label>
			<n-input
				:value="props.passphrase"
				class="w-52 max-w-full"
				placeholder="留空则不加密"
				show-password-toggle
				type="password"
				@update:value="(v: string) => emit('update:passphrase', v)"
			/>
		</div>
		<div v-if="props.passphrase">
			<label class="mb-1 block text-xs font-semibold text-slate-500">确认密码</label>
			<n-input
				:status="props.mismatch ? 'error' : undefined"
				:value="props.passphraseConfirm"
				class="w-52 max-w-full"
				placeholder="再次输入密码"
				show-password-toggle
				type="password"
				@update:value="(v: string) => emit('update:passphraseConfirm', v)"
			/>
			<p v-if="props.mismatch" class="mt-1 text-xs text-red-500">两次输入的密码不一致</p>
		</div>
	</div>
</template>
