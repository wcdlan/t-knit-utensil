<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { NButton, NInput, NSelect } from 'naive-ui';
	import { copyToClipboard } from '@/utils/clipboard';
	import { convertEncoding, SUPPORTED_ENCODINGS } from '@/utils/encoding';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/components/common/TkuIcon.vue';

	const input = ref('');
	const sourceEncoding = ref('utf8');
	const results = ref<{ encoding: string; label: string; text: string }[]>([]);

	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	function process() {
		if (!input.value.trim()) {
			results.value = [];
			return;
		}
		results.value = SUPPORTED_ENCODINGS.map((enc) => {
			try {
				return {
					encoding: enc.value,
					label: enc.label,
					text: convertEncoding(input.value, sourceEncoding.value, enc.value)
				};
			} catch {
				return {
					encoding: enc.value,
					label: enc.label,
					text: '转换失败'
				};
			}
		});
	}

	function debouncedProcess() {
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(process, 1000);
	}

	watch([input, sourceEncoding], () => {
		debouncedProcess();
	});

	function copyResult(text: string) {
		copyToClipboard(text);
	}
</script>

<template>
	<div class="space-y-6">
		<!-- Encoding selector -->
		<div class="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
			<div class="flex items-center gap-3 flex-wrap">
				<span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">输入编码</span>
				<n-select
					v-model:value="sourceEncoding"
					:options="SUPPORTED_ENCODINGS"
					class="!w-[190px] !max-w-full"
					placeholder="选择输入文本的原始编码"
					size="small"
				/>
			</div>
		</div>

		<!-- Input section -->
		<div>
			<div class="flex items-center justify-between mb-2">
				<label class="text-xs font-semibold text-slate-500">输入文本</label>
				<span class="text-[10px] text-slate-400">{{ input.length }} 字符</span>
			</div>
			<n-input
				v-model:value="input"
				:autosize="{ minRows: 6, maxRows: 16 }"
				placeholder="输入要测试的文本，结果将自动更新..."
				type="textarea"
			/>
		</div>

		<!-- Results grid -->
		<div v-if="results.length > 0" class="space-y-3">
			<div class="flex items-center gap-2">
				<label class="text-xs font-semibold text-slate-500">转换结果</label>
				<span class="text-[10px] text-slate-400">共 {{ results.length }} 种编码</span>
			</div>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
				<div
					v-for="result in results"
					:key="result.encoding"
					class="bg-slate-50/80 rounded-lg border border-slate-100 p-3 space-y-2"
				>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-1.5">
							<span class="text-xs font-semibold text-slate-700">{{ result.label }}</span>
							<span
								v-if="result.encoding === sourceEncoding"
								class="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium"
							>
								原始
							</span>
						</div>
						<div class="flex items-center gap-1.5">
							<span class="text-[10px] text-slate-400">{{ result.text.length }} 字符</span>
							<n-button secondary size="tiny" @click="copyResult(result.text)">复制</n-button>
						</div>
					</div>
					<div
						class="text-sm font-mono text-slate-600 bg-white rounded border border-slate-100 p-2 min-h-[2rem] max-h-[6rem] overflow-y-auto whitespace-pre-wrap break-all"
					>
						{{ result.text || '(空)' }}
					</div>
				</div>
			</div>
		</div>

		<!-- Empty state -->
		<div v-if="!input && results.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
			<div class="mb-3 text-slate-300">
				<TkuIcon :name="icons.textFormat" :size="36" />
			</div>
			<p class="text-slate-400 text-sm">输入文本即可自动查看所有编码下的显示效果</p>
		</div>
	</div>
</template>
