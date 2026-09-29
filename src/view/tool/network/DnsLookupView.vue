<script lang="ts" setup>
	import { computed, onMounted, reactive, ref, watch } from 'vue';
	import { copyToClipboard } from '@/utils/clipboard';
	import { fetchDnsServerStatus, formatRecordsText, lookupDnsRecord, pingTarget } from '@/utils/dns';
	import { DNS_SERVER_PRESETS, DNS_TOOL_METAS } from '@/data/dns';
	import AboutPanel from '@/fragment/tool/network/dns-lookup/AboutPanel.vue';
	import ModeTabs from '@/fragment/tool/network/dns-lookup/ModeTabs.vue';
	import ResolverPanel from '@/fragment/tool/network/dns-lookup/ResolverPanel.vue';
	import QueryPanel from '@/fragment/tool/network/dns-lookup/QueryPanel.vue';
	import RecordResultPanel from '@/fragment/tool/network/dns-lookup/RecordResultPanel.vue';
	import PingConfigPanel from '@/fragment/tool/network/dns-lookup/PingConfigPanel.vue';
	import PingResultPanel from '@/fragment/tool/network/dns-lookup/PingResultPanel.vue';
	import type {
		DnsLookupType,
		DnsResolveResult,
		DnsServerKey,
		DnsServerStatus,
		DnsToolKey,
		PingMode,
		PingResult
	} from '@/types/dns';

	/** 子工具页签与 DNS 服务器预设（数据源来自 data/dns.ts） */
	const metas = DNS_TOOL_METAS;
	const presets = DNS_SERVER_PRESETS;

	const active = ref<DnsToolKey>('A');
	const serverKey = ref<DnsServerKey>('system');
	const customAddress = ref('');
	const status = ref<DnsServerStatus>({ servers: [], platform: '', pingAvailable: false });

	/** 各子工具独立的查询目标，切换页签时保留各自输入 */
	const inputs = reactive<Record<DnsToolKey, string>>({
		A: 'example.com',
		CNAME: 'www.github.com',
		MX: 'qq.com',
		NS: 'example.com',
		TXT: 'example.com',
		PTR: '8.8.8.8',
		PING: '223.5.5.5'
	});

	const lookupLoading = ref(false);
	const lookupError = ref('');
	const lookupResult = ref<DnsResolveResult | null>(null);

	const pingMode = ref<PingMode>('tcp');
	const pingPort = ref(443);
	const pingCount = ref(4);
	const pingLoading = ref(false);
	const pingError = ref('');
	const pingResult = ref<PingResult | null>(null);

	/** 当前子工具元数据 */
	const activeMeta = computed(() => metas.find((item) => item.key === active.value) ?? metas[0]);
	/** 当前是否为 PING 检测页签 */
	const isPing = computed(() => active.value === 'PING');
	/** 当前记录类型（PING 页签下无意义，仅在记录查询时使用） */
	const activeLookupType = computed(() => active.value as DnsLookupType);
	/** 当前子工具的查询目标（可写，供 v-model 使用） */
	const currentInput = computed({
		get: () => inputs[active.value],
		set: (value: string) => (inputs[active.value] = value)
	});

	/** 实际使用的 DNS 服务器地址（系统默认与自定义都交给后端处理） */
	const resolverAddress = computed(() => {
		const preset = presets.find((item) => item.key === serverKey.value);
		if (!preset) return '';
		return preset.key === 'custom' ? customAddress.value.trim() : preset.address;
	});

	// 切换页签时清空上一子工具的结果与错误，避免误导
	watch(active, () => {
		lookupResult.value = null;
		lookupError.value = '';
		pingResult.value = null;
		pingError.value = '';
	});

	/** 执行 DNS 记录解析 */
	async function runLookup() {
		const target = currentInput.value.trim();
		if (!target) {
			lookupResult.value = null;
			lookupError.value = active.value === 'PTR' ? '请输入要反向解析的 IP 地址' : '请输入要解析的域名';
			return;
		}
		if (serverKey.value === 'custom' && !customAddress.value.trim()) {
			lookupResult.value = null;
			lookupError.value = '请填写自定义 DNS 服务器地址，例如 223.5.5.5';
			return;
		}

		lookupLoading.value = true;
		lookupError.value = '';
		try {
			lookupResult.value = await lookupDnsRecord(target, activeLookupType.value, resolverAddress.value);
		} catch (error) {
			lookupResult.value = null;
			lookupError.value = error instanceof Error ? error.message : String(error);
		} finally {
			lookupLoading.value = false;
		}
	}

	/** 执行 PING 可达性探测 */
	async function runPing() {
		const host = currentInput.value.trim();
		if (!host) {
			pingResult.value = null;
			pingError.value = '请输入要检测的主机名或 IP 地址';
			return;
		}
		if (pingMode.value === 'icmp' && !status.value.pingAvailable) {
			pingResult.value = null;
			pingError.value = '部署服务器上没有 ping 命令，无法执行 ICMP 探测，请改用 TCP 端口方式';
			return;
		}

		pingLoading.value = true;
		pingError.value = '';
		try {
			pingResult.value = await pingTarget({
				host,
				mode: pingMode.value,
				port: pingPort.value,
				count: pingCount.value,
				timeoutMs: 3000
			});
		} catch (error) {
			pingResult.value = null;
			pingError.value = error instanceof Error ? error.message : String(error);
		} finally {
			pingLoading.value = false;
		}
	}

	function copy(value: string, successText?: string) {
		copyToClipboard(value, successText);
	}

	/** 复制全部解析记录值（MX 记录带上优先级前缀） */
	function copyAllRecords() {
		const result = lookupResult.value;
		if (!result?.records.length) return;
		copyToClipboard(
			formatRecordsText(result.records, result.type),
			`已复制 ${result.records.length} 条 ${result.type} 记录`
		);
	}

	// 读取部署服务器的系统默认 DNS 与 ping 可用性；可用 ICMP 时默认选中 ICMP
	onMounted(async () => {
		status.value = await fetchDnsServerStatus();
		if (status.value.pingAvailable) pingMode.value = 'icmp';
	});
</script>

<template>
	<div class="space-y-6">
		<!-- AboutPanel：DNS 记录类型、系统默认与指定 DNS 差异、PING 方式说明 -->
		<AboutPanel />
		<!-- ModeTabs：A / CNAME / MX / NS / TXT / PTR / PING 子工具切换 -->
		<ModeTabs v-model:active="active" :tabs="metas" />
		<!-- ResolverPanel：系统默认 DNS 或指定 DNS 服务器（PING 探测不涉及记录查询，故不展示） -->
		<ResolverPanel
			v-if="!isPing"
			v-model:custom-address="customAddress"
			v-model:server-key="serverKey"
			:presets="presets"
			:system-servers="status.servers"
		/>
		<!-- QueryPanel：查询目标输入 + 示例 + 查询按钮（A/CNAME/MX/NS/TXT/PTR 共用） -->
		<QueryPanel
			v-if="!isPing"
			v-model:value="currentInput"
			:loading="lookupLoading"
			:meta="activeMeta"
			@submit="runLookup"
		/>
		<!-- RecordResultPanel：解析记录表格（点击记录值复制，MX 展示优先级） -->
		<RecordResultPanel
			v-if="!isPing"
			:error="lookupError"
			:loading="lookupLoading"
			:result="lookupResult"
			:type="activeLookupType"
			@copy="copy"
			@copy-all="copyAllRecords"
		/>
		<!-- PingConfigPanel：PING 目标 / 探测方式（ICMP、TCP）/ 端口 / 次数配置 -->
		<PingConfigPanel
			v-else
			v-model:count="pingCount"
			v-model:host="currentInput"
			v-model:mode="pingMode"
			v-model:port="pingPort"
			:loading="pingLoading"
			:meta="activeMeta"
			:ping-available="status.pingAvailable"
			@start="runPing"
		/>
		<!-- PingResultPanel：延迟统计、逐次探测柱状图与 ICMP 原始输出 -->
		<PingResultPanel v-if="isPing" :error="pingError" :loading="pingLoading" :result="pingResult" @copy="copy" />
	</div>
</template>
