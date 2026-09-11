<script lang="ts" setup>
	import { NButton, NTag } from 'naive-ui';
	import type { JwtDecoded } from '@/types/jwt';

	const props = defineProps<{
		decoded: JwtDecoded;
	}>();

	const emit = defineEmits<{
		copy: [text: string];
	}>();

	/** 三段内容按颜色区分展示：Header 红 / Payload 紫 / Signature 蓝 */
	const segments = [
		{ key: 'header', label: 'Header', desc: '算法与类型', color: 'text-red-600' },
		{ key: 'payload', label: 'Payload', desc: '声明数据', color: 'text-purple-600' },
		{ key: 'signature', label: 'Signature', desc: '签名校验值', color: 'text-blue-600' }
	] as const;

	function segmentValue(key: 'header' | 'payload' | 'signature') {
		if (key === 'header') return props.decoded.headerSegment;
		if (key === 'payload') return props.decoded.payloadSegment;
		return props.decoded.signatureSegment;
	}

	/** 将 Header / Payload 对象格式化为缩进 JSON 文本 */
	function prettyJson(value: unknown) {
		return JSON.stringify(value, null, 2);
	}
</script>

<template>
	<div class="space-y-4">
		<!-- 彩色分段总览：直观展示三段 Base64URL 内容 -->
		<div class="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
			<div class="mb-2 flex items-center justify-between">
				<label class="text-xs font-semibold text-slate-500">Token 分段</label>
				<n-button secondary size="tiny" @click="emit('copy', props.decoded.raw)">复制完整 Token</n-button>
			</div>
			<div class="cursor-pointer break-all font-mono text-xs leading-relaxed" @click="emit('copy', props.decoded.raw)">
				<span class="text-red-600">{{ props.decoded.headerSegment }}</span>
				<span class="text-slate-400">.</span>
				<span class="text-purple-600">{{ props.decoded.payloadSegment }}</span>
				<span class="text-slate-400">.</span>
				<span class="text-blue-600">{{ props.decoded.signatureSegment }}</span>
			</div>
		</div>

		<!-- Header / Payload 解码内容 -->
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<div v-for="seg in segments.slice(0, 2)" :key="seg.key" class="flex flex-col">
				<div class="mb-2 flex items-center justify-between">
					<div class="flex items-center gap-2">
						<span :class="seg.color" class="text-xs font-semibold">{{ seg.label }}</span>
						<span class="text-[10px] text-slate-400">{{ seg.desc }}</span>
						<n-tag v-if="seg.key === 'header'" :bordered="false" size="tiny" type="error">
							{{ props.decoded.header.alg }}
						</n-tag>
					</div>
					<n-button
						secondary
						size="tiny"
						@click="emit('copy', prettyJson(seg.key === 'header' ? props.decoded.header : props.decoded.payload))"
					>
						复制
					</n-button>
				</div>
				<pre
					class="min-h-[8rem] cursor-pointer overflow-x-auto rounded-lg border border-slate-200 bg-white p-3 font-mono text-xs leading-relaxed text-slate-700 transition hover:bg-blue-50/40"
					@click="emit('copy', prettyJson(seg.key === 'header' ? props.decoded.header : props.decoded.payload))"
					>{{ prettyJson(seg.key === 'header' ? props.decoded.header : props.decoded.payload) }}</pre>
			</div>
		</div>

		<!-- Signature 段原文 -->
		<div>
			<div class="mb-2 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<span class="text-xs font-semibold text-blue-600">Signature</span>
					<span class="text-[10px] text-slate-400">Base64URL 原文（需密钥才能校验）</span>
				</div>
				<n-button secondary size="tiny" @click="emit('copy', segmentValue('signature'))">复制</n-button>
			</div>
			<div
				class="cursor-pointer break-all rounded-lg border border-slate-200 bg-white p-3 font-mono text-xs text-slate-700 transition hover:bg-blue-50/40"
				@click="emit('copy', segmentValue('signature'))"
			>
				{{ segmentValue('signature') || '(空 — 该 token 未签名)' }}
			</div>
		</div>
	</div>
</template>
