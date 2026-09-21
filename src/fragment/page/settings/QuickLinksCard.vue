<script lang="ts" setup>
	import { computed, ref } from 'vue';
	import { NButton, NCard, NInput, NPopover, NSwitch, NTooltip, useMessage } from 'naive-ui';
	import { icons, QUICK_LINK_ICON_GROUPS } from '@/data/icons';
	import { fileToDataUri } from '@/utils/imageBase64';
	import { ICON_ACCEPT, ICON_SIZE_HINT, validateIconFile } from '@/utils/icon';
	import QuickLinkIcon from '@/component/common/QuickLinkIcon.vue';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import type { QuickLink } from '@/types/site';

	const props = defineProps<{
		quickLinks: QuickLink[];
	}>();

	const emit = defineEmits<{
		add: [];
		remove: [index: number];
		'select-icon': [link: QuickLink, value: string];
	}>();

	const message = useMessage();

	/** 当前展开图标选择浮层的行下标（null 表示全部收起；按行区分避免所有浮层同时展开） */
	const openIndex = ref<number | null>(null);
	/** 图标搜索关键词 */
	const keyword = ref('');
	/** 待上传自定义图标的行下标 */
	const uploadIndex = ref<number | null>(null);
	/** 隐藏的文件选择框 */
	const fileInput = ref<HTMLInputElement | null>(null);

	/** 按关键词过滤后的图标分组（匹配中文名称或 mdi 标识） */
	const filteredGroups = computed(() => {
		const kw = keyword.value.trim().toLowerCase();
		if (!kw) return QUICK_LINK_ICON_GROUPS;
		return QUICK_LINK_ICON_GROUPS.map((group) => ({
			label: group.label,
			options: group.options.filter(
				(option) => option.label.toLowerCase().includes(kw) || option.value.toLowerCase().includes(kw)
			)
		})).filter((group) => group.options.length > 0);
	});

	/** 展开 / 收起指定行的浮层，切换行时自动收起上一行 */
	function setOpen(index: number, visible: boolean) {
		if (visible) {
			openIndex.value = index;
			keyword.value = '';
			return;
		}
		// 仅收起当前展开行：点击其他行时，旧浮层的 click-outside 也会触发，
		// 若无条件置空会把刚展开的新浮层一起关掉
		if (openIndex.value === index) openIndex.value = null;
	}

	/** 选中内置图标：写回后收起浮层 */
	function pickIcon(link: QuickLink, value: string) {
		emit('select-icon', link, value);
		openIndex.value = null;
		keyword.value = '';
	}

	/** 打开文件选择框（记录目标行） */
	function triggerUpload(index: number) {
		uploadIndex.value = index;
		fileInput.value?.click();
	}

	/** 读取自定义图标文件为 Data URL 并写回对应链接 */
	async function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		const index = uploadIndex.value;
		input.value = '';
		if (!file || index === null) return;

		const error = validateIconFile(file);
		if (error) {
			message.error(error);
			return;
		}
		try {
			const dataUri = await fileToDataUri(file);
			const link = props.quickLinks[index];
			if (link) emit('select-icon', link, dataUri);
			openIndex.value = null;
			message.success('自定义图标已应用，保存配置后生效');
		} catch {
			message.error('图标读取失败，请重试');
		} finally {
			uploadIndex.value = null;
		}
	}
</script>

<template>
	<!-- 快捷连接卡片：站点快速链接列表（图标 / 名称 / URL / 新标签开关） -->
	<n-card size="small" title="快捷连接">
		<!-- 隐藏文件选择框：上传自定义图标（png / jpg / ico / svg 等），放在浮层外避免浮层收起丢失事件 -->
		<input ref="fileInput" :accept="ICON_ACCEPT" class="hidden" type="file" @change="handleFileChange" />

		<div class="space-y-3">
			<div
				v-for="(link, index) in quickLinks"
				:key="index"
				class="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-3 py-2"
			>
				<!-- 图标选择浮层：按行受控展开，切换行时自动收起，避免全部同时展开 -->
				<n-popover
					:show="openIndex === index"
					placement="bottom-start"
					trigger="click"
					@update:show="(visible: boolean) => setOpen(index, visible)"
				>
					<template #trigger>
						<button
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-blue-300 hover:text-blue-500"
							:title="link.icon.startsWith('data:') ? '自定义图标（点击更换）' : link.icon"
							type="button"
						>
							<QuickLinkIcon :icon="link.icon" :size="18" />
						</button>
					</template>

					<div class="w-[324px]">
						<!-- 图标搜索：按名称或 mdi 标识过滤 -->
						<n-input
							v-model:value="keyword"
							clearable
							placeholder="搜索图标（如 github / 邮箱 / 数据库）"
							size="tiny"
						/>

						<!-- 分组图标网格：6 列，超出高度滚动 -->
						<div class="mt-2 max-h-[240px] overflow-y-auto pr-1">
							<div v-for="group in filteredGroups" :key="group.label" class="mb-2 last:mb-0">
								<div class="mb-1 text-[10px] font-medium text-slate-400">{{ group.label }}</div>
								<div class="grid grid-cols-8 gap-1">
									<button
										v-for="option in group.options"
										:key="option.value"
										:class="
											link.icon === option.value
												? 'bg-blue-50 text-blue-600 ring-1 ring-blue-300'
												: 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
										"
										:title="option.label"
										class="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
										type="button"
										@click="pickIcon(link, option.value)"
									>
										<TkuIcon :name="option.value" :size="18" />
									</button>
								</div>
							</div>
							<p v-if="!filteredGroups.length" class="py-6 text-center text-[11px] text-slate-400">没有匹配的图标</p>
						</div>

						<!-- 自定义图标上传 -->
						<div class="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
							<n-button dashed size="tiny" @click="triggerUpload(index)">上传自定义图标</n-button>
							<span class="text-[10px] text-slate-400">{{ ICON_SIZE_HINT }}</span>
						</div>
					</div>
				</n-popover>

				<div class="w-32 shrink-0">
					<n-input v-model:value="link.name" placeholder="名称（提示）" size="small" />
				</div>
				<div class="flex-1 min-w-0">
					<n-input v-model:value="link.url" placeholder="https://..." size="small" />
				</div>
				<!-- 新标签页开关 -->
				<n-tooltip>
					<template #trigger>
						<n-switch v-model:value="link.newTab" class="shrink-0" size="small" />
					</template>
					新标签页打开
				</n-tooltip>
				<button
					class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
					title="删除"
					type="button"
					@click="emit('remove', index)"
				>
					<TkuIcon :name="icons.close" :size="16" />
				</button>
			</div>
			<n-button dashed size="small" @click="emit('add')"> 添加快捷连接 </n-button>
		</div>
	</n-card>
</template>
