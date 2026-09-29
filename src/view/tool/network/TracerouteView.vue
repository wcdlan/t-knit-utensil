<script lang="ts" setup>
	import { onMounted, ref } from 'vue';
	import { copyToClipboard } from '@/utils/clipboard';
	import { fetchTraceStatus, formatTraceText, traceRoute } from '@/utils/trace';
	import { TRACE_EXAMPLES, TRACE_MAX_HOP_OPTIONS, TRACE_PROBE_OPTIONS } from '@/data/trace';
	import AboutPanel from '@/fragment/tool/network/traceroute/AboutPanel.vue';
	import TraceConfigPanel from '@/fragment/tool/network/traceroute/TraceConfigPanel.vue';
	import TraceResultPanel from '@/fragment/tool/network/traceroute/TraceResultPanel.vue';
	import type { TraceResult, TraceStatus } from '@/types/trace';

	const host = ref('example.com');
	const maxHops = ref(20);
	const probes = ref(1);
	const resolveNames = ref(true);

	/** 服务端路由追踪能力状态（命令是否可用） */
	const status = ref<TraceStatus>({ available: true, command: null, platform: '' });
	const loading = ref(false);
	const error = ref('');
	const result = ref<TraceResult | null>(null);

	/** 执行路由追踪 */
	async function runTrace() {
		const target = host.value.trim();
		if (!target) {
			result.value = null;
			error.value = '请输入要追踪的目标主机名或 IP 地址';
			return;
		}
		if (!status.value.available) {
			result.value = null;
			error.value = '部署服务器上没有 traceroute / tracert 命令，无法执行路由追踪';
			return;
		}

		loading.value = true;
		error.value = '';
		try {
			result.value = await traceRoute({
				host: target,
				maxHops: maxHops.value,
				probes: probes.value,
				resolveNames: resolveNames.value
			});
		} catch (e) {
			result.value = null;
			error.value = e instanceof Error ? e.message : String(e);
		} finally {
			loading.value = false;
		}
	}

	function copy(value: string, successText?: string) {
		copyToClipboard(value, successText);
	}

	/** 复制整条路径（形如 traceroute 文本输出） */
	function copyAll() {
		const current = result.value;
		if (!current?.hops.length) return;
		copyToClipboard(formatTraceText(current), `已复制 ${current.hops.length} 跳路径`);
	}

	// 读取服务端命令可用性，缺命令时页面给出安装提示
	onMounted(async () => {
		status.value = await fetchTraceStatus();
	});
</script>

<template>
	<div class="space-y-6">
		<!-- AboutPanel：路由追踪原理、结果解读与权限要求 -->
		<AboutPanel />
		<!-- TraceConfigPanel：目标输入 + 最大跳数 / 探测次数 / 主机名反查配置 -->
		<TraceConfigPanel
			v-model:host="host"
			v-model:max-hops="maxHops"
			v-model:probes="probes"
			v-model:resolve-names="resolveNames"
			:available="status.available"
			:command="status.command"
			:examples="TRACE_EXAMPLES"
			:loading="loading"
			:max-hop-options="TRACE_MAX_HOP_OPTIONS"
			:probe-options="TRACE_PROBE_OPTIONS"
			@start="runTrace"
		/>
		<!-- TraceResultPanel：逐跳时间线、延迟对比、逐次探测明细与原始输出 -->
		<TraceResultPanel :error="error" :loading="loading" :result="result" @copy="copy" @copy-all="copyAll" />
	</div>
</template>
