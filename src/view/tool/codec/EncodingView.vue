<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { copyToClipboard } from '@/utils/clipboard';
	import { convertEncoding, SUPPORTED_ENCODINGS } from '@/utils/encoding';
	import { useDebounceFn } from '@/utils/debounce';
	import type { EncodingResult } from '@/types/encoding';
	import EncodingSelect from '@/fragment/tool/codec/encoding/EncodingSelect.vue';
	import InputPanel from '@/fragment/tool/codec/encoding/InputPanel.vue';
	import ResultGrid from '@/fragment/tool/codec/encoding/ResultGrid.vue';
	import AboutPanel from '@/fragment/tool/codec/encoding/AboutPanel.vue';

	const input = ref('');
	const sourceEncoding = ref('utf8');
	const results = ref<EncodingResult[]>([]);

	function process() {
		const text = input.value.trim();
		results.value = SUPPORTED_ENCODINGS.map((enc) => {
			if (!text) {
				return { encoding: enc.value, label: enc.label, text: '' };
			}
			try {
				return {
					encoding: enc.value,
					label: enc.label,
					text: convertEncoding(text, sourceEncoding.value, enc.value)
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

	const debouncedProcess = useDebounceFn(process, 500);
	watch([input, sourceEncoding], debouncedProcess);

	// 初始即生成全部编码卡片，结果网格默认展示
	process();

	function copyResult(text: string) {
		if (!text) return;
		copyToClipboard(text);
	}
</script>

<template>
	<div class="space-y-6">
		<!-- EncodingSelect：源编码格式选择下拉框（如 utf8 / gbk / big5） -->
		<EncodingSelect v-model:model-value="sourceEncoding" />
		<!-- InputPanel：待转换文本输入框 -->
		<InputPanel v-model:model-value="input" />
		<!-- ResultGrid：按目标编码逐一转换的结果卡片网格（点击复制） -->
		<ResultGrid :results="results" :source-encoding="sourceEncoding" @copy="copyResult" />
		<!-- AboutPanel：工具简介与使用说明 -->
		<AboutPanel />
	</div>
</template>
