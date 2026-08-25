<script lang="ts" setup>
	import { NButton, NButtonGroup, NProgress, NTag } from 'naive-ui';
	import type { LicenseProfile, ScoredLicense } from '@/types/license';

	const props = defineProps<{
		item: ScoredLicense;
		expandedId: string | null;
		copiedId: string | null;
		selectedLang: string;
		expandedText: string;
	}>();

	const emit = defineEmits<{
		'toggle-expand': [id: string];
		copy: [license: LicenseProfile];
		download: [license: LicenseProfile];
		'update:selectedLang': [lang: string];
	}>();

	// ── 展示辅助函数 ─────────────────────────────────────────────────────
	const copyleftLabels: Record<number, string> = {
		0: '完全自由',
		1: '保留署名',
		2: '弱 Copyleft (文件级)',
		3: '强 Copyleft (项目级)',
		4: '网络 Copyleft (AGPL)'
	};
	const simplicityLabels: Record<number, string> = { 0: '简短', 1: '适中', 2: '完整' };

	function scoreColor(score: number): string {
		if (score >= 90) return '#22c55e';
		if (score >= 75) return '#34d399';
		if (score >= 60) return '#eab308';
		if (score >= 40) return '#f97316';
		return '#ef4444';
	}

	function scoreLabel(score: number): string {
		if (score >= 90) return '强烈推荐';
		if (score >= 75) return '推荐';
		if (score >= 60) return '可以考虑';
		if (score >= 40) return '不太匹配';
		return '不推荐';
	}

	function scoreStatus(score: number): 'success' | 'warning' | 'error' {
		if (score >= 75) return 'success';
		if (score >= 60) return 'warning';
		return 'error';
	}
</script>

<template>
	<div
		:class="
			props.expandedId === props.item.license.id ? 'border-blue-300 shadow-md' : 'border-gray-200 hover:border-gray-300'
		"
		class="bg-white rounded-xl border transition"
	>
		<div class="p-4">
			<div class="flex items-start justify-between gap-4">
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2 flex-wrap mb-1">
						<span class="text-base font-bold text-gray-900">{{ props.item.license.name }}</span>
						<code class="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">{{
							props.item.license.spdxId
						}}</code>
						<n-tag :bordered="false" :type="scoreStatus(props.item.score)" size="small">
							{{ scoreLabel(props.item.score) }}
						</n-tag>
					</div>

					<p class="text-sm text-gray-500 mb-2">{{ props.item.license.summary }}</p>

					<div class="flex flex-wrap gap-1 mb-2">
						<n-tag v-for="tag in props.item.license.tags" :key="tag" :bordered="false" size="tiny">
							{{ tag }}
						</n-tag>
					</div>

					<div v-if="props.item.highlights.length" class="flex flex-wrap gap-1 mb-2">
						<n-tag v-for="h in props.item.highlights" :key="h" :bordered="false" size="tiny" type="info">
							✓ {{ h }}
						</n-tag>
					</div>

					<div class="flex flex-wrap items-center gap-3 text-xs text-gray-400">
						<span>Copyleft: {{ copyleftLabels[props.item.license.copyleft] }}</span>
						<span>复杂度: {{ simplicityLabels[props.item.license.simplicity] }}</span>
						<span v-if="props.item.license.patent" class="text-green-500 font-medium">含专利条款</span>
						<span v-if="props.item.license.osiApproved" class="text-blue-400">OSI 认证</span>
						<span v-if="props.item.license.domestic" class="text-red-400 font-medium">🇨🇳 国产</span>
						<a :href="props.item.license.url" class="text-blue-400 hover:text-blue-600 underline" target="_blank"
							>SPDX</a
						>
					</div>
				</div>

				<div class="shrink-0 flex flex-col items-center gap-1">
					<div :style="{ color: scoreColor(props.item.score) }" class="text-2xl font-bold">
						{{ props.item.score }}
					</div>
					<n-progress
						:color="scoreColor(props.item.score)"
						:percentage="props.item.score"
						:show-indicator="false"
						class="w-16"
					/>
					<span class="text-[10px] text-gray-400">适配度</span>
				</div>
			</div>

			<div class="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
				<n-button
					:type="props.expandedId === props.item.license.id ? 'primary' : 'default'"
					size="small"
					@click="emit('toggle-expand', props.item.license.id)"
				>
					{{ props.expandedId === props.item.license.id ? '收起全文' : '查看全文' }}
				</n-button>
				<n-button
					:type="props.copiedId === props.item.license.id ? 'success' : 'default'"
					size="small"
					@click="emit('copy', props.item.license)"
				>
					{{ props.copiedId === props.item.license.id ? '已复制 ✓' : '复制全文' }}
				</n-button>
				<n-button size="small" @click="emit('download', props.item.license)"> 下载 .txt </n-button>
			</div>
		</div>

		<!-- 展开：许可证全文 -->
		<div v-if="props.expandedId === props.item.license.id" class="border-t border-gray-100 p-4 bg-gray-50 rounded-b-xl">
			<div class="flex items-center justify-between mb-3 flex-wrap gap-2">
				<span class="text-xs font-medium text-gray-500">{{ props.item.license.name }} — 完整协议文本</span>
				<div class="flex items-center gap-2">
					<n-button-group v-if="props.item.license.languages.length > 1" size="tiny">
						<n-button
							v-for="lang in props.item.license.languages"
							:key="lang.code"
							:type="props.selectedLang === lang.code ? 'primary' : 'default'"
							@click="emit('update:selectedLang', lang.code)"
						>
							{{ lang.label }}
						</n-button>
					</n-button-group>
					<span class="text-[10px] text-gray-400">{{ props.expandedText.length.toLocaleString() }} 字符</span>
				</div>
			</div>
			<pre
				class="text-xs font-mono text-gray-700 whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-lg p-4 leading-relaxed cursor-pointer transition hover:border-blue-200 hover:bg-blue-50/20"
				@click="emit('copy', props.item.license)"
				>{{ props.expandedText }}</pre>
		</div>
	</div>
</template>
