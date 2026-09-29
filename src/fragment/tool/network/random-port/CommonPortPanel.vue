<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { NButton, NCollapse, NCollapseItem, NInput, NTag } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';
	import CommonPortRow from '@/fragment/tool/network/random-port/CommonPortRow.vue';
	import type { CommonPortGroup } from '@/types/port';

	const props = defineProps<{
		/** 按关键词过滤后的分组数据（空关键词即全部） */
		groups: CommonPortGroup[];
		/** 搜索关键词 */
		keyword: string;
		/** 常用服务端口总数 */
		total: number;
		/** 分组总数 */
		groupTotal: number;
		/** 当前搜索结果命中数量 */
		matched: number;
	}>();

	const emit = defineEmits<{
		'update:keyword': [value: string];
		copy: [value: string, successText?: string];
	}>();

	/** 整个速查面板是否展开（默认折叠，避免占用首屏空间） */
	const open = ref(false);
	/** 已展开的分组键 */
	const expandedNames = ref<string[]>([]);

	// 输入关键词时自动展开面板与命中的全部分组，清空关键词后收起分组
	watch(
		() => props.keyword,
		(value) => {
			if (value.trim()) {
				open.value = true;
				expandedNames.value = props.groups.map((group) => group.key);
			} else {
				expandedNames.value = [];
			}
		}
	);

	/** 展开 / 收起全部分组 */
	function toggleAll() {
		expandedNames.value = expandedNames.value.length ? [] : props.groups.map((group) => group.key);
	}
</script>

<template>
	<div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
		<!-- 面板头部：点击展开常用服务端口速查 -->
		<div
			class="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 transition hover:bg-slate-50"
			@click="open = !open"
		>
			<div class="flex min-w-0 items-center gap-3">
				<span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
					<TkuIcon :name="icons.database" :size="18" />
				</span>
				<div class="min-w-0">
					<div class="flex flex-wrap items-center gap-2">
						<span class="text-sm font-semibold text-slate-800">常用服务默认端口速查</span>
						<n-tag :bordered="false" round size="tiny" type="info">{{ props.total }} 个服务</n-tag>
						<n-tag :bordered="false" round size="tiny">{{ props.groupTotal }} 类</n-tag>
					</div>
					<p class="mt-0.5 truncate text-xs text-slate-500">
						按用途归档，默认折叠；展开后可查看每个端口的服务介绍与安全提示
					</p>
				</div>
			</div>
			<span class="flex shrink-0 items-center gap-1 text-xs text-slate-400">
				{{ open ? '收起' : '展开' }}
				<TkuIcon :name="open ? icons.chevronDown : icons.chevronRight" :size="18" />
			</span>
		</div>

		<!-- 面板主体：搜索 + 分组折叠列表 -->
		<div v-show="open" class="border-t border-slate-100 px-5 py-4">
			<div class="mb-3 flex flex-wrap items-center gap-3">
				<n-input
					:value="props.keyword"
					class="max-w-md flex-1"
					clearable
					placeholder="搜索服务名 / 中文名 / 端口号，如 Redis、6379、消息队列"
					size="small"
					@update:value="(v: string) => emit('update:keyword', v)"
				>
					<template #prefix>
						<TkuIcon :name="icons.magnify" :size="16" class="text-slate-400" />
					</template>
				</n-input>
				<span v-if="props.keyword.trim()" class="text-xs text-slate-400">命中 {{ props.matched }} 个服务</span>
				<n-button class="ml-auto" quaternary size="tiny" @click="toggleAll">
					{{ expandedNames.length ? '收起全部分组' : '展开全部分组' }}
				</n-button>
			</div>

			<!-- 搜索无结果 -->
			<div
				v-if="!props.groups.length"
				class="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 py-8 text-center"
			>
				<p class="text-sm text-slate-400">没有匹配的服务，换个关键词试试</p>
			</div>

			<!-- 分类折叠：分组默认折叠，展开后逐条查看服务详情 -->
			<n-collapse v-else v-model:expanded-names="expandedNames">
				<n-collapse-item v-for="group in props.groups" :key="group.key" :name="group.key">
					<template #header>
						<div class="flex flex-wrap items-center gap-2">
							<span class="text-sm font-semibold text-slate-700">{{ group.label }}</span>
							<n-tag :bordered="false" round size="tiny">{{ group.entries.length }}</n-tag>
							<span class="hidden text-xs text-slate-400 sm:inline">{{ group.description }}</span>
						</div>
					</template>
					<div class="grid gap-2 lg:grid-cols-2">
						<!-- CommonPortRow：单个服务的端口、名称与可展开详情 -->
						<CommonPortRow
							v-for="entry in group.entries"
							:key="`${group.key}-${entry.service}-${entry.port}`"
							:entry="entry"
							@copy="(value: string, successText?: string) => emit('copy', value, successText)"
						/>
					</div>
				</n-collapse-item>
			</n-collapse>
		</div>
	</div>
</template>
