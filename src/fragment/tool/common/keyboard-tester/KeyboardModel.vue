<script lang="ts" setup>
	import type { KeyboardKey, KeyboardLayoutDefinition } from '@/types/keyboard';

	const props = defineProps<{
		layout: KeyboardLayoutDefinition;
		/** 当前按下的物理键位集合 */
		pressed: string[];
		/** 本次测试中命中过的键位集合（浅色标记） */
		tested: string[];
	}>();

	/** 键帽宽度：以 1u 为基准按布局定义换算 */
	function keyWidth(key: KeyboardKey): string {
		return `calc(var(--tku-key-unit) * ${key.width ?? 1})`;
	}

	/** 键帽样式：按下高亮 > 已测试浅色 > 默认 */
	function keyClass(key: KeyboardKey): string {
		if (props.pressed.includes(key.code)) {
			return 'bg-blue-500 border-blue-600 text-white shadow-inner scale-95';
		}
		if (props.tested.includes(key.code)) {
			return 'bg-blue-50 border-blue-200 text-blue-700';
		}
		if (key.modifier) {
			return 'bg-slate-100 border-slate-200 text-slate-500';
		}
		return 'bg-white border-slate-200 text-slate-600';
	}

	// 高度与字号均按 1u 比例换算，整体随键帽单位等比缩放（--tku-key-unit 由根节点按视口宽度流式给定）
	/** 主键盘区键帽高度 */
	const MAIN_KEY_HEIGHT = 'calc(var(--tku-key-unit) * 1)';
	/** 功能键 / 编辑键 / 小键盘键帽高度（略矮） */
	const SUB_KEY_HEIGHT = 'calc(var(--tku-key-unit) * 0.82)';
	/** 主键帽字号 */
	const MAIN_FONT_SIZE = 'calc(var(--tku-key-unit) * 0.32)';
	/** 功能键 / 编辑键 / 小键盘字号 */
	const SUB_FONT_SIZE = 'calc(var(--tku-key-unit) * 0.28)';
	/** 方向键字号（箭头需更大才清晰） */
	const ARROW_FONT_SIZE = 'calc(var(--tku-key-unit) * 0.38)';
	/** 副标签（数字键 Shift 字符 / Mac 功能说明）字号 */
	const SUB_LABEL_FONT_SIZE = 'calc(var(--tku-key-unit) * 0.22)';
</script>

<template>
	<!-- 键盘模型：完整还原各物理区块，按 pressed 高亮当前按键；整体居中并随视口放大 -->
	<div class="overflow-x-auto pb-1">
		<!-- mx-auto + w-max：容器够宽时居中，不够宽时自动左对齐并可横向滚动（避免居中裁掉左端） -->
		<div
			class="mx-auto flex w-max flex-col gap-[calc(var(--tku-key-unit)*0.15)]"
			style="--tku-key-unit: clamp(1.65rem, 2.6vw, 3.6rem)"
		>
			<!-- 功能键行 -->
			<div class="flex gap-[calc(var(--tku-key-unit)*0.15)]">
				<div
					v-for="key in props.layout.functionRow.keys"
					:key="key.code"
					:class="key.spacer ? 'invisible' : keyClass(key) + ' border'"
					:style="{ width: keyWidth(key), height: SUB_KEY_HEIGHT, fontSize: SUB_FONT_SIZE }"
					class="flex flex-col items-center justify-center rounded-md leading-none transition-all duration-75"
				>
					<span class="font-medium">{{ key.label }}</span>
					<span v-if="key.subLabel" :style="{ fontSize: SUB_LABEL_FONT_SIZE }" class="text-slate-400">
						{{ key.subLabel }}
					</span>
				</div>
			</div>

			<!-- 主键盘区 + 右侧功能区 -->
			<div class="flex gap-[calc(var(--tku-key-unit)*0.5)]">
				<!-- 主键盘区 -->
				<div class="flex flex-col gap-[calc(var(--tku-key-unit)*0.15)]">
					<div
						v-for="(row, rowIndex) in props.layout.mainRows"
						:key="'main-' + rowIndex"
						class="flex gap-[calc(var(--tku-key-unit)*0.15)]"
					>
						<div
							v-for="key in row.keys"
							:key="key.code"
							:class="key.spacer ? 'invisible' : keyClass(key) + ' border'"
							:style="{ width: keyWidth(key), height: MAIN_KEY_HEIGHT, fontSize: MAIN_FONT_SIZE }"
							class="flex flex-col items-center justify-center rounded-md leading-none transition-all duration-75"
						>
							<span class="font-medium">{{ key.label }}</span>
							<span v-if="key.subLabel" :style="{ fontSize: SUB_LABEL_FONT_SIZE }" class="text-slate-400">
								{{ key.subLabel }}
							</span>
						</div>
					</div>
				</div>

				<!-- 编辑键区 + 方向键区 -->
				<div class="flex flex-col justify-between gap-[calc(var(--tku-key-unit)*0.15)]">
					<div class="flex flex-col gap-[calc(var(--tku-key-unit)*0.15)]">
						<div
							v-for="(row, rowIndex) in props.layout.navRows"
							:key="'nav-' + rowIndex"
							class="flex gap-[calc(var(--tku-key-unit)*0.15)]"
						>
							<div
								v-for="key in row.keys"
								:key="key.code"
								:class="key.spacer ? 'invisible' : keyClass(key) + ' border'"
								:style="{ width: keyWidth(key), height: SUB_KEY_HEIGHT, fontSize: SUB_FONT_SIZE }"
								class="flex items-center justify-center rounded-md font-medium leading-none transition-all duration-75"
							>
								{{ key.label }}
							</div>
						</div>
					</div>
					<!-- 方向键（倒 T 形） -->
					<div class="flex flex-col gap-[calc(var(--tku-key-unit)*0.15)]">
						<div
							v-for="(row, rowIndex) in props.layout.arrowRows"
							:key="'arrow-' + rowIndex"
							class="flex gap-[calc(var(--tku-key-unit)*0.15)]"
						>
							<div
								v-for="key in row.keys"
								:key="key.code"
								:class="key.spacer ? 'invisible' : keyClass(key) + ' border'"
								:style="{ width: keyWidth(key), height: SUB_KEY_HEIGHT, fontSize: ARROW_FONT_SIZE }"
								class="flex items-center justify-center rounded-md font-medium leading-none transition-all duration-75"
							>
								{{ key.label }}
							</div>
						</div>
					</div>
				</div>

				<!-- 数字小键盘区 -->
				<div class="flex flex-col gap-[calc(var(--tku-key-unit)*0.15)]">
					<div
						v-for="(row, rowIndex) in props.layout.numpadRows"
						:key="'numpad-' + rowIndex"
						class="flex gap-[calc(var(--tku-key-unit)*0.15)]"
					>
						<div
							v-for="key in row.keys"
							:key="key.code"
							:class="key.spacer ? 'invisible' : keyClass(key) + ' border'"
							:style="{ width: keyWidth(key), height: SUB_KEY_HEIGHT, fontSize: SUB_FONT_SIZE }"
							class="flex items-center justify-center rounded-md font-medium leading-none transition-all duration-75"
						>
							{{ key.label }}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
