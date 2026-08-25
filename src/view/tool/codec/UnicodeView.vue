<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { useDebounceFn } from '@/utils/debounce';
	import { copyToClipboard } from '@/utils/clipboard';
	import type { UnicodeMode } from '@/types/unicode';
	import ModeSelect from '@/fragment/tool/codec/unicode/ModeSelect.vue';
	import InputPanel from '@/fragment/tool/codec/unicode/InputPanel.vue';
	import OutputPanel from '@/fragment/tool/codec/unicode/OutputPanel.vue';
	import ActionBar from '@/fragment/tool/codec/unicode/ActionBar.vue';
	import AboutPanel from '@/fragment/tool/codec/unicode/AboutPanel.vue';

	const input = ref('');
	const output = ref('');
	const mode = ref<UnicodeMode>('to-unicode');

	function process() {
		if (!input.value) {
			output.value = '';
			return;
		}
		try {
			if (mode.value === 'to-unicode') {
				output.value = input.value
					.split('')
					.map((c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'))
					.join('');
			} else {
				output.value = input.value.replace(/\\u[\da-f]{4}/gi, (match) =>
					String.fromCharCode(parseInt(match.replace('\\u', ''), 16))
				);
			}
		} catch {
			output.value = '转换失败';
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
