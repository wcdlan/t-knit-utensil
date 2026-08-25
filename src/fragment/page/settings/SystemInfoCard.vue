<script lang="ts" setup>
	import { computed } from 'vue';
	import { NButton, NCard, NSpin, NTag } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import type { SshKeygenStatus, SystemInfo } from '@/types/system';
	import { formatMemoryMB, formatUptime } from '@/utils/system';

	const props = defineProps<{
		info: SystemInfo | null;
		ssh: SshKeygenStatus | null;
		loading: boolean;
	}>();

	const emit = defineEmits<{
		refresh: [];
	}>();

	// 系统平台展示名（node os.platform() → 中文）
	const platformLabel = computed(() => {
		const map: Record<string, string> = {
			darwin: 'macOS',
			linux: 'Linux',
			win32: 'Windows',
			freebsd: 'FreeBSD',
			openbsd: 'OpenBSD',
			sunos: 'SunOS'
		};
		return props.info ? (map[props.info.platform] ?? props.info.platform) : '';
	});

	// 内存已用 / 总量
	const memUsed = computed(() =>
		props.info ? formatMemoryMB(props.info.totalMemoryMB - props.info.freeMemoryMB) : ''
	);
</script>

<template>
	<!-- 系统信息卡片：部署机器信息 + ssh-keygen/OpenSSH 状态检测 -->
	<n-card size="small" title="系统信息">
		<n-spin :show="loading">
			<div class="space-y-4">
				<!-- 部署机器信息 -->
				<div>
					<div class="mb-2 flex items-center gap-2">
						<span class="text-xs font-semibold text-slate-500">部署机器</span>
						<n-button quaternary size="tiny" type="primary" @click="emit('refresh')">
							<TkuIcon :name="icons.refresh" :size="12" />
							刷新
						</n-button>
					</div>

					<div v-if="info" class="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
						<table class="w-full text-xs leading-6">
							<tbody>
								<tr>
									<td class="w-28 text-slate-400">主机名</td>
									<td class="text-slate-600">{{ info.hostname }}</td>
								</tr>
								<tr>
									<td class="text-slate-400">系统</td>
									<td class="text-slate-600">{{ platformLabel }}（{{ info.osType }} {{ info.osRelease }}）</td>
								</tr>
								<tr>
									<td class="text-slate-400">架构</td>
									<td class="text-slate-600">{{ info.arch }}</td>
								</tr>
								<tr>
									<td class="text-slate-400">CPU</td>
									<td class="text-slate-600">{{ info.cpuModel || '未知' }}（{{ info.cpuCores }} 核）</td>
								</tr>
								<tr>
									<td class="text-slate-400">内存</td>
									<td class="text-slate-600">{{ memUsed }} / {{ formatMemoryMB(info.totalMemoryMB) }}</td>
								</tr>
								<tr>
									<td class="text-slate-400">Node 版本</td>
									<td class="text-slate-600">{{ info.nodeVersion }}</td>
								</tr>
								<tr>
									<td class="text-slate-400">运行时长</td>
									<td class="text-slate-600">
										进程 {{ formatUptime(info.processUptimeSec) }} · 系统 {{ formatUptime(info.systemUptimeSec) }}
									</td>
								</tr>
								<tr>
									<td class="text-slate-400">时区 / PID</td>
									<td class="text-slate-600">{{ info.timezone }} · {{ info.pid }}</td>
								</tr>
							</tbody>
						</table>
					</div>
					<p v-else-if="!loading" class="text-xs text-slate-400">机器信息加载失败，请点击刷新重试。</p>
				</div>

				<!-- ssh-keygen / OpenSSH 状态 -->
				<div>
					<div class="mb-2 text-xs font-semibold text-slate-500">ssh-keygen / OpenSSH 状态</div>
					<div v-if="ssh" class="flex items-center gap-2">
						<n-tag :type="ssh.available ? 'success' : 'error'" round size="small">
							{{ ssh.available ? '可用' : '不可用' }}
						</n-tag>
						<span v-if="ssh.available" class="text-xs text-slate-600">
							OpenSSH {{ ssh.version || '（版本未知）' }}
						</span>
						<span v-else class="text-xs text-slate-500">{{ ssh.error || '未检测到 ssh-keygen' }}</span>
					</div>
					<p v-else-if="!loading" class="text-xs text-slate-400">状态检测失败，请点击刷新重试。</p>
				</div>

				<!-- 存储说明（静态） -->
				<div class="border-t border-slate-100 pt-3 text-xs text-slate-400 leading-relaxed">
					<p>运行时数据：<code class="bg-slate-100 px-1 rounded">site.db</code> 存储在服务器端（SQLite）。</p>
					<p>默认配置：<code class="bg-slate-100 px-1 rounded">site.config.json</code> 仅作初始默认值。</p>
					<p>配置修改后立即持久化，刷新页面即生效。</p>
				</div>
			</div>
		</n-spin>
	</n-card>
</template>
