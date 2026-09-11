<script lang="ts" setup>
	import { computed, nextTick, ref, watch } from 'vue';
	import { NCard, NInput, NSwitch, NTag } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { formatShortcut, isMacPlatform, shouldUseCommand } from '@/utils/shortcut';
	import type { ShortcutConfig } from '@/types/site';

	const props = defineProps<{
		shortcut: ShortcutConfig;
	}>();

	const emit = defineEmits<{
		'update:shortcut': [value: ShortcutConfig];
	}>();

	const isMac = isMacPlatform();
	/** 录制状态：为 true 时等待用户按下新按键 */
	const recording = ref(false);
	const captureInput = ref<InstanceType<typeof NInput> | null>(null);

	/** 当前生效快捷键展示文本 */
	const currentText = computed(() => formatShortcut(props.shortcut));

	// 进入录制状态后自动聚焦捕获输入框
	watch(recording, async (on) => {
		if (on) {
			await nextTick();
			captureInput.value?.focus();
		}
	});

	function startRecording() {
		recording.value = true;
	}

	/** 捕获按键：排除修饰键本身与 Esc，其余作为触发键 */
	function handleCaptureKey(e: KeyboardEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (e.key === 'Escape') {
			recording.value = false;
			return;
		}
		// 仅接受单字符键或空格，避免把 Ctrl / Shift / Alt / Meta 单独录为触发键
		const isModifier = ['Control', 'Shift', 'Alt', 'Meta'].includes(e.key);
		if (isModifier || e.key.length !== 1) return;
		emit('update:shortcut', { ...props.shortcut, key: e.key });
		recording.value = false;
	}

	function resetToDefault() {
		emit('update:shortcut', { ...props.shortcut, key: '/' });
	}
</script>

<template>
	<!-- 快捷键设置卡片：全局搜索呼出快捷键的开关 / 按键录制 / Mac 修饰键替换 -->
	<n-card size="small" title="快捷键设置">
		<div class="space-y-5">
			<!-- 启用开关 -->
			<div class="flex items-center justify-between gap-4">
				<div>
					<div class="text-sm font-medium text-slate-700">启用全局快捷键</div>
					<div class="mt-0.5 text-xs text-slate-400">任意页面按下快捷键即可呼出工具搜索</div>
				</div>
				<n-switch
					:value="props.shortcut.enabled"
					@update:value="(v: boolean) => emit('update:shortcut', { ...props.shortcut, enabled: v })"
				/>
			</div>

			<!-- 当前快捷键与录制 -->
			<div class="flex flex-wrap items-center gap-4">
				<div class="min-w-[16rem]">
					<div class="text-sm font-medium text-slate-700">呼出快捷键</div>
					<div class="mt-0.5 text-xs text-slate-400">点击「录制」后按下新按键（仅单个字符键）</div>
				</div>
				<div class="flex items-center gap-2">
					<!-- 录制态：捕获输入的输入框；平时展示当前快捷键 -->
					<n-input
						v-if="recording"
						ref="captureInput"
						:input-props="{ class: 'font-mono text-xs' }"
						:placeholder="'按下新按键...（Esc 取消）'"
						class="!w-44"
						readonly
						@keydown="handleCaptureKey"
					/>
					<template v-else>
						<span
							class="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-sm text-slate-700"
						>
							{{ shouldUseCommand(props.shortcut) ? '⌘' : 'Ctrl' }}
							<span class="text-slate-400">+</span>
							{{ props.shortcut.key === ' ' ? 'Space' : props.shortcut.key.toUpperCase() }}
						</span>
					</template>
					<!-- 录制按钮 -->
					<n-tag v-if="!recording" :bordered="false" size="small" type="info" @click="startRecording"> 录制 </n-tag>
					<n-tag
						v-if="!recording && props.shortcut.key !== '/'"
						:bordered="false"
						size="small"
						type="warning"
						@click="resetToDefault"
					>
						恢复默认
					</n-tag>
				</div>
			</div>

			<!-- Mac 修饰键替换 -->
			<div class="flex items-center justify-between gap-4">
				<div>
					<div class="flex items-center gap-1.5 text-sm font-medium text-slate-700">
						<span>Mac 上用 Command 替换 Ctrl</span>
						<!-- 平台标识：当前系统是否应用该设置 -->
						<n-tag v-if="isMac" :bordered="false" size="tiny" type="success">当前系统生效</n-tag>
						<n-tag v-else :bordered="false" size="tiny" type="default">仅 macOS 生效</n-tag>
					</div>
					<div class="mt-0.5 text-xs text-slate-400">
						开启后 macOS 上使用
						<kbd class="rounded border border-slate-200 bg-slate-50 px-1 font-mono text-[10px]">⌘</kbd> 代替
						<kbd class="rounded border border-slate-200 bg-slate-50 px-1 font-mono text-[10px]">⌃</kbd>，Windows / Linux
						不受影响
					</div>
				</div>
				<n-switch
					:value="props.shortcut.useCommandOnMac"
					@update:value="(v: boolean) => emit('update:shortcut', { ...props.shortcut, useCommandOnMac: v })"
				/>
			</div>

			<!-- 预览提示 -->
			<div
				class="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 text-xs text-blue-700"
			>
				<TkuIcon :name="icons.lightbulb" :size="14" />
				<span v-if="props.shortcut.enabled"
					>当前快捷键：<strong>{{ currentText }}</strong
					>，保存后在任意页面呼出工具搜索</span
				>
				<span v-else>全局快捷键已关闭</span>
			</div>
		</div>
	</n-card>
</template>
