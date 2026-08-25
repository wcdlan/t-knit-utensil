<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { useDebounceFn } from '@/utils/debounce';
	import { copyToClipboard } from '@/utils/clipboard';
	import { decodeBase64, encodeBase64 } from '@/utils/base64';
	import ModeSelect from '@/fragment/tool/codec/base64/ModeSelect.vue';
	import InputPanel from '@/fragment/tool/codec/base64/InputPanel.vue';
	import OutputPanel from '@/fragment/tool/codec/base64/OutputPanel.vue';
	import ActionBar from '@/fragment/tool/codec/base64/ActionBar.vue';
	import AboutPanel from '@/fragment/tool/codec/base64/AboutPanel.vue';

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
				output.value = encodeBase64(input.value);
			} else {
				output.value = decodeBase64(input.value);
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

	function swap() {
		input.value = output.value;
		mode.value = mode.value === 'encode' ? 'decode' : 'encode';
		process();
	}
</script>

<template>
	<div class="space-y-6">
		<ModeSelect :mode="mode" @update:mode="(v) => (mode = v)" />
		<InputPanel v-model:model-value="input" :mode="mode" />
		<ActionBar :output="output" @process="process" @swap="swap" />
		<OutputPanel :output="output" @copy="copy" />
		<AboutPanel />
	</div>
</template>
