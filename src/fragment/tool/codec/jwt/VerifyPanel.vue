<script lang="ts" setup>
	import { NButton, NInput } from 'naive-ui';
	import type { JwtVerifyResult } from '@/types/jwt';

	const props = defineProps<{
		secret: string;
		result: JwtVerifyResult | null;
		verifying: boolean;
	}>();

	const emit = defineEmits<{
		'update:secret': [value: string];
		verify: [];
	}>();
</script>

<template>
	<div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
		<span class="mb-3 block text-xs font-semibold tracking-wider text-slate-500 uppercase">签名校验</span>
		<div class="flex flex-wrap items-end gap-3">
			<div class="min-w-[16rem] flex-1">
				<label class="mb-1 block text-xs font-semibold text-slate-500">HMAC 密钥（Secret）</label>
				<n-input
					:input-props="{ class: 'font-mono' }"
					:value="props.secret"
					placeholder="输入用于签名校验的密钥"
					show-password-on="click"
					type="password"
					@update:value="(v: string) => emit('update:secret', v)"
				/>
			</div>
			<!-- 校验签名：用密钥重算签名并与 token 中的签名比对 -->
			<n-button :disabled="!props.secret" :loading="props.verifying" type="primary" @click="emit('verify')">
				校验签名
			</n-button>
		</div>
		<!-- 校验结果反馈条：结果区始终渲染，未校验时显示占位提示 -->
		<div
			v-if="props.result"
			:class="
				props.result.valid ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'
			"
			class="mt-3 rounded-lg border px-3 py-2 text-xs font-medium"
		>
			{{ props.result.message }}
		</div>
		<div v-else class="mt-3 rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-400">
			输入密钥后可校验该 token 的签名是否有效
		</div>
	</div>
</template>
