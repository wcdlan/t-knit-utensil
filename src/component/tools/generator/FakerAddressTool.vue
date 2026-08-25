<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { NButton, NInputNumber } from 'naive-ui';
	import { useFaker } from '@/data/useFaker';
	import LocaleSelect from './common/LocaleSelect.vue';
	import ResultRow from './common/ResultRow.vue';
	import { copyToClipboard } from '@/utils/clipboard';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	const { faker, locale, setLocale } = useFaker(() => generate());

	const count = ref(5);

	interface AddressRecord {
		country: string;
		state: string;
		city: string;
		street: string;
		postal: string;
		latitude: string;
		longitude: string;
		timeZone: string;
	}

	const records = ref<AddressRecord[]>([]);

	function generate() {
		const fk = faker();
		const result: AddressRecord[] = [];
		for (let i = 0; i < count.value; i++) {
			result.push({
				country: fk.location.country(),
				state: fk.location.state(),
				city: fk.location.city(),
				street: fk.location.streetAddress(),
				postal: fk.location.zipCode(),
				latitude: fk.location.latitude({ precision: 4 }).toFixed(4),
				longitude: fk.location.longitude({ precision: 4 }).toFixed(4),
				timeZone: fk.location.timeZone()
			});
		}
		records.value = result;
	}

	function copyAll() {
		const text = records.value
			.map(
				(r, i) =>
					`# 地址 ${i + 1}\n国家：${r.country}\n省份/州：${r.state}\n城市：${r.city}\n街道：${r.street}\n邮编：${r.postal}\n经纬度：${r.latitude}, ${r.longitude}\n时区：${r.timeZone}`
			)
			.join('\n\n');
		copyToClipboard(text, '已复制全部');
	}

	watch(count, () => generate());

	generate();
</script>

<template>
	<div class="space-y-6">
		<!-- 生成配置 -->
		<div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
			<div class="flex flex-wrap items-center gap-4">
				<LocaleSelect :model-value="locale" @update:model-value="setLocale" />
				<div class="flex items-center gap-2">
					<span class="text-xs font-semibold text-slate-500">生成数量</span>
					<n-input-number v-model:value="count" :max="20" :min="1" class="w-20" />
				</div>
			</div>
		</div>

		<!-- 操作按钮 -->
		<div class="flex gap-2">
			<n-button type="primary" @click="generate">
				<span class="flex items-center gap-1.5">
					<TkuIcon :name="icons.refresh" :size="16" />
					<span>重新生成</span>
				</span>
			</n-button>
			<n-button :disabled="!records.length" secondary @click="copyAll">
				<span class="flex items-center gap-1.5">
					<TkuIcon :name="icons.clipboard" :size="16" />
					<span>复制全部</span>
				</span>
			</n-button>
		</div>

		<!-- 结果 -->
		<div v-if="records.length" class="space-y-3">
			<div v-for="(r, i) in records" :key="i" class="space-y-1.5 rounded-xl border border-slate-100 p-3">
				<div class="mb-1.5 flex items-center justify-between">
					<span class="text-sm font-semibold text-slate-700">地址 {{ i + 1 }}：{{ r.city }}</span>
					<n-button secondary size="tiny" @click="copyToClipboard(JSON.stringify(r, null, 2), '已复制记录')">
						复制记录
					</n-button>
				</div>
				<div class="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
					<ResultRow :value="r.country" label="国家" />
					<ResultRow :value="r.state" label="省份/州" />
					<ResultRow :value="r.city" label="城市" />
					<ResultRow :value="r.street" label="街道地址" />
					<ResultRow :value="r.postal" label="邮编" />
					<ResultRow :value="r.timeZone" label="时区" />
				</div>
				<ResultRow :value="`${r.latitude}, ${r.longitude}`" label="经纬度" />
			</div>
		</div>

		<!-- 介绍 -->
		<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
			<h3 class="mb-3 text-sm font-semibold text-blue-800">关于「地址信息生成」</h3>
			<p class="mb-2 text-sm leading-relaxed text-slate-600">
				本工具按所选语言区域生成完整的地址数据，覆盖国家、省份/州、城市、街道、邮编、经纬度与时区。
				中文区域会产出「海南省海汉市石巷968号」这类符合国内表达习惯的地址，切换为英文（美国）则生成「New
				York」风格的美式地址。
			</p>
			<p class="mb-2 text-sm leading-relaxed text-slate-600">
				经纬度基于地理坐标随机分布（纬度 -90° ~ 90°，经度 -180° ~ 180°），精度保留 4
				位小数，可用于在地图上标记模拟点位； 时区取自 IANA 时区数据库（如
				Asia/Shanghai、America/New_York），方便与真实时间系统对接。
			</p>
			<p class="text-sm leading-relaxed text-slate-600">
				<span class="font-medium text-blue-800">典型场景</span
				>：为电商下单页、物流配送演示、地图可视化、国际化表单测试提供贴近真实格式的假地址，避免使用「Test Street
				1」这类一眼假的占位数据。
			</p>
		</div>
	</div>
</template>
