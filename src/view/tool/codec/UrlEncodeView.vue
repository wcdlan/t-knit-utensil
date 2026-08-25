<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { useDebounceFn } from '@/utils/debounce';
	import { copyToClipboard } from '@/utils/clipboard';
	import ModeSelect from '@/fragment/tool/codec/url-encode/ModeSelect.vue';
	import InputPanel from '@/fragment/tool/codec/url-encode/InputPanel.vue';
	import OutputPanel from '@/fragment/tool/codec/url-encode/OutputPanel.vue';
	import ActionBar from '@/fragment/tool/codec/url-encode/ActionBar.vue';
	import AboutPanel from '@/fragment/tool/codec/url-encode/AboutPanel.vue';

	const input = ref('');
	const output = ref('');
	const mode = ref<'encode' | 'decode'>('encode');

	function process() {
		if (!input.value) {
			output.value = '';
			return;
		}
		try {
			if (mode.value === 'encode') {
				output.value = encodeURIComponent(input.value);
			} else {
				output.value = decodeURIComponent(input.value);
			}
		} catch {
			output.value = '转换失败，请检查输入内容';
		}
	}

	const debouncedProcess = useDebounceFn(process, 500);
	watch([input, mode], debouncedProcess);

	function copy() {
		if (!output.value) return;
		copyToClipboard(output.value);
	}
</script>

<template>
	<div class="space-y-6">
		<ModeSelect :mode="mode" @update:mode="(v) => (mode = v)" />
		<InputPanel v-model:model-value="input" :mode="mode" />
		<ActionBar @process="process" />
		<OutputPanel :output="output" @copy="copy" />
		<AboutPanel />
	</div>
</template>
