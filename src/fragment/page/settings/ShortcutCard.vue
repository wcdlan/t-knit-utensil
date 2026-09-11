<script lang="ts" setup>
	import { computed, nextTick, ref, watch } from 'vue';
	import { NButton, NCard, NInput, NSwitch, NTag } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { formatBinding, isMacPlatform, shouldUseCommand } from '@/utils/shortcut';
	import type { ShortcutConfig, ShortcutFeature } from '@/types/site';

	const props = defineProps<{
		shortcut: ShortcutConfig;
	}>();

	const emit = defineEmits<{
		'update:shortcut': [value: ShortcutConfig];
	}>();

	const isMac = isMacPlatform();
	/** 正在录制新按键的功能 id（null 表示未在录制） */
	const recordingId = ref<string | null>(null);
	const captureInput = ref<InstanceType<typeof NInput> | null>(null);

	/** 当前生效的全部快捷键展示文本 */
	const summaryText = computed(() =>
		props.shortcut.features
			.map((f) => `${f.label}：${formatFeatureKeys(f)}`)
			.filter((s) => s)
			.join('；')
	);

	function formatFeatureKeys(feature: ShortcutFeature): string {
		if (feature.keys.length === 0) return '未设置';
		return feature.keys.map((k) => formatBinding(props.shortcut, k)).join('、');
	}

	// 进入录制状态后自动聚焦捕获输入框
	watch(recordingId, async (id) => {
		if (id) {
			await nextTick();
			captureInput.value?.focus();
		}
	});

	function startRecording(featureId: string) {
		recordingId.value = featureId;
	}

	/** 捕获按键：排除修饰键本身与 Esc，其余作为触发键加入对应功能 */
	function handleCaptureKey(e: KeyboardEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (e.key === 'Escape') {
			recordingId.value = null;
			return;
		}
		// 仅接受单字符键或空格，避免把 Ctrl / Shift / Alt / Meta 单独录为触发键
		const isModifier = ['Control', 'Shift', 'Alt', 'Meta'].includes(e.key);
		if (isModifier || e.key.length !== 1) return;
		const features = props.shortcut.features.map((f) =>
			f.id === recordingId.value && !f.keys.includes(e.key) ? { ...f, keys: [...f.keys, e.key] } : f
		);
		emit('update:shortcut', { ...props.shortcut, features });
		recordingId.value = null;
	}

	/** 删除某个功能的指定触发键（保留至少一个） */
	function removeKey(featureId: string, key: string) {
		const features = props.shortcut.features.map((f) =>
			f.id === featureId ? { ...f, keys: f.keys.filter((k) => k !== key) } : f
		);
		emit('update:shortcut', { ...props.shortcut, features });
	}
</script>

<template>
	<!-- 快捷键设置卡片：功能列表形式，每个功能可绑定多个快捷键 -->
	<n-card size="small" title="快捷键设置">
		<div class="space-y-5">
			<!-- 启用开关 -->
			<div class="flex items-center justify-between gap-4">
				<div>
					<div class="text-sm font-medium text-slate-700">启用全局快捷键</div>
					<div class="mt-0.5 text-xs text-slate-400">任意页面按下快捷键即可呼出对应功能</div>
				</div>
				<n-switch
					:value="props.shortcut.enabled"
					@update:value="(v: boolean) => emit('update:shortcut', { ...props.shortcut, enabled: v })"
				/>
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

			<!-- 功能快捷键列表：每个功能一行，支持多个快捷键 -->
			<div>
				<div class="mb-2 text-xs font-semibold text-slate-500">功能快捷键</div>
				<div class="space-y-2">
					<div
						v-for="feature in props.shortcut.features"
						:key="feature.id"
						class="rounded-lg border border-slate-200 bg-slate-50/50 p-3"
					>
						<!-- 功能名 -->
						<div class="mb-2 flex items-center gap-2">
							<span class="text-sm font-medium text-slate-700">{{ feature.label }}</span>
							<span class="font-mono text-[10px] text-slate-400">{{ feature.id }}</span>
						</div>

						<!-- 已绑定的快捷键列表（kbd 键帽样式） -->
						<div class="flex flex-wrap items-center gap-2">
							<span
								v-for="key in feature.keys"
								:key="key"
								class="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-2 py-1 font-mono text-xs text-blue-700"
							>
								{{ shouldUseCommand(props.shortcut) ? '⌘' : 'Ctrl' }}
								<span class="text-slate-400">+</span>
								{{ key === ' ' ? 'Space' : key.toUpperCase() }}
								<!-- 删除单个快捷键 -->
								<button
									v-if="feature.keys.length > 1"
									class="ml-0.5 flex h-4 w-4 cursor-pointer items-center justify-center rounded text-slate-400 transition hover:bg-red-50 hover:text-red-500"
									type="button"
									@click.stop="removeKey(feature.id, key)"
								>
									<TkuIcon :name="icons.close" :size="12" />
								</button>
							</span>

							<!-- 录制态：捕获输入框；平时为「添加」按钮 -->
							<n-input
								v-if="recordingId === feature.id"
								ref="captureInput"
								:input-props="{ class: 'font-mono text-xs' }"
								:placeholder="'按下新按键...（Esc 取消）'"
								class="!w-44"
								readonly
								@keydown="handleCaptureKey"
							/>
							<n-button v-else secondary size="tiny" @click="startRecording(feature.id)">
								<span class="flex items-center gap-1">
									<TkuIcon :name="icons.plus" :size="14" />
									<span>添加快捷键</span>
								</span>
							</n-button>
						</div>
					</div>
				</div>
			</div>

			<!-- 预览提示 -->
			<div
				class="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 text-xs text-blue-700"
			>
				<TkuIcon :name="icons.lightbulb" :size="14" />
				<span v-if="props.shortcut.enabled && summaryText"
					>当前：<strong>{{ summaryText }}</strong
					>，保存后生效</span
				>
				<span v-else>全局快捷键已关闭或未配置任何功能</span>
			</div>
		</div>
	</n-card>
</template>
