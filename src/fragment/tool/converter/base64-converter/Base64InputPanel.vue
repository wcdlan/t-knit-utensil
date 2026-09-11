<script lang="ts" setup>
	import { computed, ref, watch } from 'vue';
	import { NButton, NInput } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	const props = defineProps<{
		modelValue: string;
	}>();

	const emit = defineEmits<{
		'update:modelValue': [value: string];
	}>();

	const fileInput = ref<HTMLInputElement | null>(null);
	/** 从 txt 文件加载时的文件名（非空表示处于文件加载态） */
	const fileName = ref('');
	const fileSize = ref(0);
	/** 是否处于拖拽悬停状态（视觉反馈） */
	const isDragging = ref(false);

	/** 展示内容：文件加载态只显示摘要，避免大段 Base64 撑满输入框 */
	const displayValue = computed(() => {
		if (!fileName.value) return props.modelValue;
		const preview = props.modelValue.slice(0, 300);
		return props.modelValue.length > 300 ? preview + '…（内容较长，仅显示摘要）' : preview;
	});

	/** 字节数格式化为可读大小 */
	function formatSize(bytes: number): string {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
		return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
	}

	/** 读取 txt 文件内容作为 Base64 输入（上传选择与拖拽共用） */
	function loadTextFile(file: File | undefined) {
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			fileName.value = file.name;
			fileSize.value = file.size;
			emit('update:modelValue', reader.result as string);
		};
		reader.onerror = () => {
			fileName.value = '';
			fileSize.value = 0;
		};
		reader.readAsText(file);
	}

	function onUploadFile(e: Event) {
		const input = e.target as HTMLInputElement;
		loadTextFile(input.files?.[0]);
		input.value = '';
	}

	function onDrop(e: DragEvent) {
		isDragging.value = false;
		loadTextFile(e.dataTransfer?.files?.[0]);
	}

	/** 退出文件加载态并清空输入 */
	function clearFile() {
		fileName.value = '';
		fileSize.value = 0;
		emit('update:modelValue', '');
	}

	// 输入被外部清空（如还原面板的「清空」按钮）时，同步退出文件加载态，避免信息条残留
	watch(
		() => props.modelValue,
		(value) => {
			if (!value && fileName.value) {
				fileName.value = '';
				fileSize.value = 0;
			}
		}
	);
</script>

<template>
	<div>
		<div class="mb-2 flex items-center justify-between">
			<label class="text-xs font-semibold text-slate-500">Base64 输入</label>
			<div class="flex flex-wrap items-center gap-2">
				<span class="text-[10px] text-slate-400">{{ props.modelValue.length }} 字符</span>
				<!-- 上传 txt：选择本地 txt 文件，其内容作为 Base64 输入（文件加载态不完整展示内容） -->
				<n-button secondary size="tiny" @click="fileInput?.click()">
					<span class="flex items-center gap-1">
						<TkuIcon :name="icons.file" :size="14" />
						<span>上传 txt</span>
					</span>
				</n-button>
				<!-- 清空 / 退出文件加载态 -->
				<n-button :disabled="!props.modelValue" secondary size="tiny" @click="clearFile">
					<span class="flex items-center gap-1">
						<TkuIcon :name="icons.close" :size="14" />
						<span>清空</span>
					</span>
				</n-button>
			</div>
		</div>

		<!-- 文件加载信息条：展示文件名与大小，不展示完整 Base64 内容 -->
		<div
			v-if="fileName"
			class="mb-2 flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50/60 px-3 py-2"
		>
			<div class="min-w-0">
				<div class="truncate text-xs font-semibold text-blue-800">{{ fileName }}</div>
				<div class="text-[11px] text-blue-600">
					{{ formatSize(fileSize) }} · 已作为 Base64 输入，点击下方查看还原结果
				</div>
			</div>
		</div>

		<!-- 输入区：支持粘贴编辑，或拖拽 txt 文件到此处完成上传 -->
		<div
			:class="isDragging ? 'border-blue-400 bg-blue-50/50' : ''"
			class="relative rounded-xl border-2 border-dashed border-transparent transition"
			@dragenter.prevent="isDragging = true"
			@dragover.prevent="isDragging = true"
			@dragleave.prevent="isDragging = false"
			@drop.prevent="onDrop"
		>
			<input ref="fileInput" accept=".txt,text/plain" class="hidden" type="file" @change="onUploadFile" />
			<n-input
				:autosize="{ minRows: 6, maxRows: 16 }"
				:input-props="{ class: 'font-mono text-xs' }"
				:placeholder="fileName ? '文件内容已加载' : '粘贴 Base64，或拖拽 txt 文件到此处，可带 data:xxx;base64, 前缀'"
				:readonly="!!fileName"
				:value="displayValue"
				type="textarea"
				@update:value="(v: string) => emit('update:modelValue', v)"
			/>
			<!-- 拖拽悬停提示层 -->
			<div
				v-if="isDragging"
				class="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-blue-100/80"
			>
				<div class="mb-2 text-blue-500">
					<TkuIcon :name="icons.file" :size="32" />
				</div>
				<p class="text-sm font-medium text-blue-700">松开鼠标，将 txt 内容作为 Base64 输入</p>
			</div>
			<!-- 空态覆盖层 -->
			<div
				v-if="!props.modelValue"
				class="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-center"
			>
				<div class="mb-2 text-slate-300">
					<TkuIcon :name="icons.clipboard" :size="28" />
				</div>
				<p class="text-xs text-slate-400">粘贴 Base64，或上传 txt 文件自动识别还原</p>
			</div>
		</div>
	</div>
</template>
