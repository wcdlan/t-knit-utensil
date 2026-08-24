<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { NButton, NCheckbox, NInputNumber } from 'naive-ui';
	import { useFaker } from '@/data/useFaker';
	import LocaleSelect from './common/LocaleSelect.vue';
	import ResultRow from './common/ResultRow.vue';
	import { copyToClipboard } from '@/utils/clipboard';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/components/common/TkuIcon.vue';

	const { faker, locale, setLocale } = useFaker(() => generate());

	const count = ref(5);
	const withDevice = ref(true);

	interface NetworkRecord {
		domain: string;
		email: string;
		ipv4: string;
		ipv6: string;
		mac: string;
		userAgent: string;
		port: number;
		statusCode: number;
	}

	const records = ref<NetworkRecord[]>([]);

	function generate() {
		const fk = faker();
		const result: NetworkRecord[] = [];
		for (let i = 0; i < count.value; i++) {
			result.push({
				domain: fk.internet.domainName(),
				email: fk.internet.email(),
				ipv4: fk.internet.ipv4(),
				ipv6: fk.internet.ipv6(),
				mac: fk.internet.mac({ separator: ':' }),
				userAgent: fk.internet.userAgent(),
				port: fk.internet.port(),
				statusCode: fk.internet.httpStatusCode()
			});
		}
		records.value = result;
	}

	function copyAll() {
		const text = records.value
			.map(
				(r, i) =>
					`# 网络记录 ${i + 1}\n域名：${r.domain}\n邮箱：${r.email}\nIPv4：${r.ipv4}\nIPv6：${r.ipv6}\nMAC：${r.mac}\n端口：${r.port}\n状态码：${r.statusCode}\nUA：${r.userAgent}`
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
				<n-checkbox v-model:checked="withDevice"> 包含浏览器 UA </n-checkbox>
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
					<span class="text-sm font-semibold text-slate-700">网络记录 {{ i + 1 }}：{{ r.domain }}</span>
					<n-button secondary size="tiny" @click="copyToClipboard(JSON.stringify(r, null, 2), '已复制记录')">
						复制记录
					</n-button>
				</div>
				<div class="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
					<ResultRow :value="r.domain" label="域名" />
					<ResultRow :value="r.email" label="邮箱" />
					<ResultRow :value="r.ipv4" label="IPv4" />
					<ResultRow :value="r.ipv6" label="IPv6" />
					<ResultRow :value="r.mac" label="MAC 地址" />
					<ResultRow :value="String(r.port)" label="端口" />
					<ResultRow :value="String(r.statusCode)" label="HTTP 状态码" />
				</div>
				<ResultRow v-if="withDevice" :value="r.userAgent" label="浏览器 UA" />
			</div>
		</div>

		<!-- 介绍 -->
		<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
			<h3 class="mb-3 text-sm font-semibold text-blue-800">关于「网络与设备生成」</h3>
			<p class="mb-2 text-sm leading-relaxed text-slate-600">
				本工具批量生成网络相关仿真数据：域名、邮箱、IPv4/IPv6 地址、MAC 地址、端口、HTTP 状态码与浏览器 UA。 IPv4
				从完整地址空间随机抽取（可后续扩展为指定网段），MAC 地址使用冒号分隔的标准格式。
			</p>
			<p class="mb-2 text-sm leading-relaxed text-slate-600">
				HTTP 状态码覆盖 1xx~5xx 各类别（200、404、500 等），可用于接口日志模拟；浏览器 UA
				随机组合操作系统、内核与版本号， 例如 Chrome / Firefox / Safari / Edge，适合做流量分析与设备指纹演示。
			</p>
			<p class="text-sm leading-relaxed text-slate-600">
				<span class="font-medium text-blue-800">典型场景</span
				>：网络日志脱敏演示、访问日志测试、防火墙规则调试、以及需要随机 IP/UA 的爬虫与安全工具开发。所有 IP
				均为随机生成，不代表真实设备。
			</p>
		</div>
	</div>
</template>
