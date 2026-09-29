<script lang="ts" setup>
	import { computed, ref, watch } from 'vue';
	import { copyToClipboard } from '@/utils/clipboard';
	import { countCommonPorts, filterCommonPortGroups, generateRandomPorts, isPortRangeValid } from '@/utils/port';
	import { PORT_RANGE_PRESETS } from '@/data/ports';
	import AboutPanel from '@/fragment/tool/network/random-port/AboutPanel.vue';
	import PortConfigPanel from '@/fragment/tool/network/random-port/PortConfigPanel.vue';
	import PortActionBar from '@/fragment/tool/network/random-port/PortActionBar.vue';
	import PortResultPanel from '@/fragment/tool/network/random-port/PortResultPanel.vue';
	import CommonPortPanel from '@/fragment/tool/network/random-port/CommonPortPanel.vue';
	import type { PortRangeKey, RandomPortEntry, RandomPortOptions } from '@/types/port';

	/** 端口区间预设（数据源来自 data/ports.ts） */
	const presets = PORT_RANGE_PRESETS;
	/** 常用服务端口分组总数与条目总数（用于速查面板统计展示） */
	const groupTotal = filterCommonPortGroups('').length;
	const commonTotal = countCommonPorts();

	const rangeKey = ref<PortRangeKey>('dynamic');
	const min = ref(49152);
	const max = ref(65535);
	const count = ref(6);
	const excludeSystem = ref(true);
	const excludeCommon = ref(true);

	const entries = ref<RandomPortEntry[]>([]);
	const poolSize = ref(0);
	const insufficient = ref(false);

	/** 关键词：常用服务端口速查的搜索条件 */
	const keyword = ref('');

	/** 起始端口是否大于结束端口（生成时会自动交换） */
	const rangeInvalid = computed(() => !isPortRangeValid(min.value, max.value));

	const options = computed<RandomPortOptions>(() => ({
		count: count.value,
		min: min.value,
		max: max.value,
		excludeSystem: excludeSystem.value,
		excludeCommon: excludeCommon.value
	}));

	/** 速查面板使用过滤后的分组数据 */
	const commonGroups = computed(() => filterCommonPortGroups(keyword.value));

	/** 当前搜索结果命中的服务数量 */
	const matched = computed(() => commonGroups.value.reduce((total, group) => total + group.entries.length, 0));

	/** 生成随机端口并写入结果状态 */
	function regenerate() {
		const result = generateRandomPorts(options.value);
		entries.value = result.entries;
		poolSize.value = result.poolSize;
		insufficient.value = result.insufficient;
	}

	// 任一生成配置变化即自动重新生成，保证结果区始终有内容
	watch([count, min, max, excludeSystem, excludeCommon], regenerate);

	// 切换区间预设时同步起始 / 结束端口（自定义区间保留用户输入）
	watch(rangeKey, (key) => {
		const preset = presets.find((item) => item.key === key);
		if (preset && key !== 'custom') {
			min.value = preset.min;
			max.value = preset.max;
		}
	});

	function copy(value: string, successText?: string) {
		copyToClipboard(value, successText);
	}

	/** 以换行分隔复制全部端口 */
	function copyList() {
		copyToClipboard(
			entries.value.map((entry) => String(entry.port)).join('\n'),
			`已复制 ${entries.value.length} 个端口`
		);
	}

	/** 以逗号分隔复制全部端口 */
	function copyCsv() {
		copyToClipboard(
			entries.value.map((entry) => String(entry.port)).join(','),
			`已复制 ${entries.value.length} 个端口`
		);
	}

	// 生成类工具：初始化立即生成默认结果
	regenerate();
</script>

<template>
	<div class="space-y-6">
		<!-- AboutPanel：端口号基础知识与随机端口使用须知 -->
		<AboutPanel />
		<!-- PortConfigPanel：端口区间 / 起始结束端口 / 生成数量 / 排除项配置 -->
		<PortConfigPanel
			v-model:count="count"
			v-model:exclude-common="excludeCommon"
			v-model:exclude-system="excludeSystem"
			v-model:max="max"
			v-model:min="min"
			v-model:range-key="rangeKey"
			:insufficient="insufficient"
			:pool-size="poolSize"
			:presets="presets"
			:range-invalid="rangeInvalid"
		/>
		<!-- PortActionBar：重新生成 / 复制列表 / 复制逗号分隔 -->
		<PortActionBar :entries="entries" @generate="regenerate" @copy-csv="copyCsv" @copy-list="copyList" />
		<!-- PortResultPanel：随机端口结果网格（点击单个端口复制，标记区间与常用端口命中） -->
		<PortResultPanel :entries="entries" :insufficient="insufficient" :pool-size="poolSize" @copy="copy" />
		<!-- CommonPortPanel：常用服务默认端口速查（默认折叠，展开后按分组查看服务介绍） -->
		<CommonPortPanel
			v-model:keyword="keyword"
			:group-total="groupTotal"
			:groups="commonGroups"
			:matched="matched"
			:total="commonTotal"
			@copy="copy"
		/>
	</div>
</template>
