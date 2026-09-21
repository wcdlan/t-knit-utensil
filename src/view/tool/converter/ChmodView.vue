<script lang="ts" setup>
	import { computed, ref } from 'vue';
	import { copyToClipboard } from '@/utils/clipboard';
	import {
		buildChmodCommand,
		buildSummary,
		CHMOD_SPECIALS,
		describeMode,
		formatOctal,
		hasSpecial,
		parseOctal,
		parseSymbolic,
		toggleBit,
		toggleSpecial,
		toSymbolic
	} from '@/utils/chmod';
	import type { ChmodBitId, ChmodClassId, ChmodSpecialId } from '@/types/chmod';
	import AboutPanel from '@/fragment/tool/converter/chmod/AboutPanel.vue';
	import ModeInputPanel from '@/fragment/tool/converter/chmod/ModeInputPanel.vue';
	import PermissionGrid from '@/fragment/tool/converter/chmod/PermissionGrid.vue';
	import ResultPanel from '@/fragment/tool/converter/chmod/ResultPanel.vue';
	import PresetPanel from '@/fragment/tool/converter/chmod/PresetPanel.vue';

	/** 默认权限值：普通文件的常见权限 644 */
	const DEFAULT_MODE = 0o644;

	/** 当前权限值（唯一数据源，八进制 / 符号 / 勾选都由它推导） */
	const mode = ref(DEFAULT_MODE);
	/** 八进制输入文本（允许中间态非法，如用户正在输入） */
	const octalInput = ref(formatOctal(DEFAULT_MODE));
	/** 符号输入文本（允许中间态非法） */
	const symbolicInput = ref(toSymbolic(DEFAULT_MODE));
	/** 命令生成的目标路径 */
	const target = ref('');

	/** 两种输入的解析结果 */
	const octalParse = computed(() => parseOctal(octalInput.value));
	const symbolicParse = computed(() => parseSymbolic(symbolicInput.value));
	/** 输入校验错误提示（合法时为 undefined） */
	const octalError = computed(() => (octalParse.value.ok ? undefined : octalParse.value.error));
	const symbolicError = computed(() => (symbolicParse.value.ok ? undefined : symbolicParse.value.error));

	/** 带文件类型位的符号表示（如 -rwxr-xr-x） */
	const symbolicFull = computed(() => toSymbolic(mode.value, true));
	/** 三个作用对象的权限拆解 */
	const rows = computed(() => describeMode(mode.value));
	/** 已开启的特殊权限位 */
	const specials = computed(() => CHMOD_SPECIALS.filter((meta) => hasSpecial(mode.value, meta.id)));
	/** 生成的 chmod 命令与复制用摘要 */
	const command = computed(() => buildChmodCommand(mode.value, target.value));
	const summary = computed(() => buildSummary(mode.value, target.value));

	/** 统一设置权限值，并同步回两个输入框 */
	function setMode(value: number) {
		mode.value = value;
		octalInput.value = formatOctal(value);
		symbolicInput.value = toSymbolic(value);
	}

	/** 八进制输入：合法时同步权限值与符号表示 */
	function updateOctal(text: string) {
		octalInput.value = text;
		const parsed = parseOctal(text);
		if (!parsed.ok) return;
		mode.value = parsed.mode;
		const next = toSymbolic(parsed.mode);
		if (symbolicInput.value !== next) symbolicInput.value = next;
	}

	/** 符号输入：合法时同步权限值与八进制表示 */
	function updateSymbolic(text: string) {
		symbolicInput.value = text;
		const parsed = parseSymbolic(text);
		if (!parsed.ok) return;
		mode.value = parsed.mode;
		const next = formatOctal(parsed.mode);
		if (octalInput.value !== next) octalInput.value = next;
	}

	/** 勾选权限位 */
	function onToggleBit(classId: ChmodClassId, bit: ChmodBitId) {
		setMode(toggleBit(mode.value, classId, bit));
	}

	/** 勾选特殊权限位 */
	function onToggleSpecial(id: ChmodSpecialId) {
		setMode(toggleSpecial(mode.value, id));
	}

	/** 套用常用权限预设 */
	function applyPreset(octal: string) {
		const parsed = parseOctal(octal);
		if (parsed.ok) setMode(parsed.mode);
	}

	/** 重置为默认权限 644 */
	function reset() {
		setMode(DEFAULT_MODE);
	}

	function copy(value: string) {
		if (!value) return;
		copyToClipboard(value);
	}
</script>

<template>
	<div class="space-y-4">
		<!-- AboutPanel：权限数字含义、目录与文件的差别、特殊位说明 -->
		<AboutPanel />
		<!-- 工作台：权限输入 / 权限勾选 / 计算结果（2xl 三栏，lg 两栏且结果占满整行，窄屏依次堆叠） -->
		<div class="grid gap-4 lg:grid-cols-2 2xl:grid-cols-[minmax(0,320px)_minmax(0,380px)_minmax(0,1fr)]">
			<!-- ModeInputPanel：八进制与符号两种写法的输入（实时联动、校验提示） -->
			<ModeInputPanel
				:octal="octalInput"
				:octal-error="octalError"
				:symbolic="symbolicInput"
				:symbolic-error="symbolicError"
				@reset="reset"
				@update:octal="updateOctal"
				@update:symbolic="updateSymbolic"
			/>
			<!-- PermissionGrid：所有者 / 所属组 / 其他用户 × rwx 勾选矩阵与特殊位 -->
			<PermissionGrid :mode="mode" @toggle-bit="onToggleBit" @toggle-special="onToggleSpecial" />
			<!-- ResultPanel：八进制 / 符号结果、逐位拆解与 chmod 命令生成 -->
			<ResultPanel
				:command="command"
				:octal="formatOctal(mode)"
				:rows="rows"
				:specials="specials"
				:summary="summary"
				:symbolic-full="symbolicFull"
				:target="target"
				class="lg:col-span-2 2xl:col-span-1"
				@copy="copy"
				@update:target="(v: string) => (target = v)"
			/>
		</div>
		<!-- PresetPanel：文件 / 目录 / 特殊位常用权限速查，点击即套用 -->
		<PresetPanel :mode="mode" @apply="applyPreset" />
	</div>
</template>
