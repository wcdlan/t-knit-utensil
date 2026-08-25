<script lang="ts" setup>
	import { reactive, ref } from 'vue';
	import { defaultObfuscatorOptions, obfuscationPresets } from '@/data/jsObfuscatorOptions';
	import { obfuscateCode } from '@/utils/jsObfuscator';
	import { copyToClipboard } from '@/utils/clipboard';
	import { downloadTextFile } from '@/utils/download';
	import type { ObfuscationPresetKey, ObfuscatorOptions } from '@/types/jsObfuscator';
	import PresetSelect from '@/fragment/tool/common/js-obfuscator/PresetSelect.vue';
	import OptionPanel from '@/fragment/tool/common/js-obfuscator/OptionPanel.vue';
	import InputPanel from '@/fragment/tool/common/js-obfuscator/InputPanel.vue';
	import ActionBar from '@/fragment/tool/common/js-obfuscator/ActionBar.vue';
	import OutputPanel from '@/fragment/tool/common/js-obfuscator/OutputPanel.vue';
	import AboutPanel from '@/fragment/tool/common/js-obfuscator/AboutPanel.vue';

	const input = ref('');
	const output = ref('');
	const error = ref('');
	const loading = ref(false);
	const durationMs = ref<number | null>(null);
	const presetKey = ref<ObfuscationPresetKey>('low-obfuscation');

	/** 混淆选项（默认基于低混淆预设） */
	const options = reactive<ObfuscatorOptions>({
		...defaultObfuscatorOptions,
		...(obfuscationPresets.find((p) => p.key === 'low-obfuscation')?.overrides ?? {})
	} as ObfuscatorOptions);

	/** 切换预设：以默认选项为底应用预设覆盖项 */
	function applyPreset(key: ObfuscationPresetKey) {
		presetKey.value = key;
		const preset = obfuscationPresets.find((p) => p.key === key);
		for (const k of Object.keys(options)) {
			delete options[k];
		}
		const merged = { ...defaultObfuscatorOptions, ...(preset?.overrides ?? {}) } as ObfuscatorOptions;
		Object.assign(options, merged);
	}

	/** 更新单个选项 */
	function updateOption(key: string, value: string | number | boolean | string[]) {
		(options as Record<string, string | number | boolean | string[]>)[key] = value;
	}

	/** 执行混淆 */
	async function obfuscate() {
		if (!input.value.trim()) {
			error.value = '请输入需要混淆的 JavaScript 代码';
			return;
		}
		error.value = '';
		loading.value = true;
		try {
			const result = await obfuscateCode(input.value, { ...options });
			output.value = result.code;
			durationMs.value = result.durationMs;
		} catch (e) {
			output.value = '';
			durationMs.value = null;
			error.value = '混淆失败: ' + (e as Error).message;
		} finally {
			loading.value = false;
		}
	}

	function copyOutput() {
		if (output.value) copyToClipboard(output.value, '混淆结果已复制');
	}

	function downloadOutput() {
		if (!output.value) return;
		const name =
			input.value
				.trim()
				.split('\n')[0]
				.slice(0, 24)
				.replace(/[^\w\u4e00-\u9fa5-]/g, '_') || 'obfuscated';
		downloadTextFile(output.value, name + '.js');
	}
</script>

<template>
	<div class="flex min-h-0 flex-1 flex-col space-y-4">
		<!-- PresetSelect：混淆强度预设选择（默认低混淆） -->
		<PresetSelect :preset-key="presetKey" @update:preset-key="applyPreset" />

		<!-- 编辑区：左侧输入 / 中间按钮 / 右侧输出 -->
		<div class="grid grid-cols-1 items-stretch gap-4 lg:h-[400px] lg:grid-cols-[1fr_auto_1fr]">
			<!-- InputPanel：JS 源代码输入 -->
			<InputPanel v-model:model-value="input" />
			<!-- ActionBar：混淆操作按钮 -->
			<ActionBar :disabled="!input.trim()" :loading="loading" @obfuscate="obfuscate" />
			<!-- OutputPanel：混淆结果输出区（只读 + 复制 / 下载按钮） -->
			<OutputPanel :duration-ms="durationMs" :output="output" @copy="copyOutput" @download="downloadOutput" />
		</div>

		<!-- 错误提示条 -->
		<div v-if="error" :class="'border-red-200 bg-red-50 text-red-600'" class="p-3 rounded-lg border text-sm">
			{{ error }}
		</div>

		<!-- OptionPanel：全部混淆选项配置（切换预设后可按需微调） -->
		<OptionPanel :options="options" @update:option="updateOption" />

		<!-- AboutPanel：工具简介与使用说明 -->
		<AboutPanel />
	</div>
</template>
