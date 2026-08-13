<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { NButton, NCheckbox, NInput, NInputNumber, NSelect } from 'naive-ui';
	import { v1, v3, v4, v5, v6, v7, validate } from 'uuid';
	import { copyToClipboard } from '@/utils/clipboard';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/components/common/TkuIcon.vue';

	type UuidVersion = 'v1' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7';
	type NamespacePreset = 'dns' | 'url' | 'oid' | 'x500';
	type NamespaceKey = NamespacePreset | 'custom';

	const uuids = ref<string[]>([]);
	const count = ref(5);
	const uppercase = ref(false);
	const version = ref<UuidVersion>('v4');

	// v3/v5 名称化版本配置
	const name = ref('example.com');
	const namespace = ref<NamespaceKey>('dns');
	const customNamespace = ref('');
	const nsError = ref('');

	const versionOptions: { label: string; value: UuidVersion }[] = [
		{ label: 'v1（时间 + 节点）', value: 'v1' },
		{ label: 'v3（MD5 命名空间）', value: 'v3' },
		{ label: 'v4（随机）', value: 'v4' },
		{ label: 'v5（SHA-1 命名空间）', value: 'v5' },
		{ label: 'v6（有序时间）', value: 'v6' },
		{ label: 'v7（时间戳 + 随机）', value: 'v7' }
	];

	// RFC 4122 预定义命名空间常量（uuid 包 v14 不再导出，直接内联）
	const NAMESPACE_MAP: Record<NamespacePreset, string> = {
		dns: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
		url: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
		oid: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
		x500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8'
	};

	const namespaceOptions: { label: string; value: NamespaceKey }[] = [
		{ label: 'DNS', value: 'dns' },
		{ label: 'URL', value: 'url' },
		{ label: 'OID', value: 'oid' },
		{ label: 'X.500', value: 'x500' },
		{ label: '自定义', value: 'custom' }
	];

	const isNameBased = () => version.value === 'v3' || version.value === 'v5';

	function resolveNamespace(): string {
		if (namespace.value === 'custom') {
			const ns = customNamespace.value.trim();
			if (!validate(ns)) {
				nsError.value = '请输入合法的 UUID 作为命名空间';
				return '';
			}
			nsError.value = '';
			return ns;
		}
		return NAMESPACE_MAP[namespace.value as NamespacePreset];
	}

	function generateOne(): string {
		switch (version.value) {
			case 'v1':
				return v1();
			case 'v3':
				return v3(name.value, resolveNamespace());
			case 'v5':
				return v5(name.value, resolveNamespace());
			case 'v6':
				return v6();
			case 'v7':
				return v7();
			default:
				return v4();
		}
	}

	function generate() {
		if (isNameBased() && !resolveNamespace()) {
			uuids.value = [];
			return;
		}
		const result: string[] = [];
		for (let i = 0; i < count.value; i++) {
			const uuid = generateOne();
			result.push(uppercase.value ? uuid.toUpperCase() : uuid);
		}
		uuids.value = result;
	}

	function copyAll() {
		copyToClipboard(uuids.value.join('\n'), '已复制全部');
	}

	function copyOne(uuid: string) {
		copyToClipboard(uuid, '已复制');
	}

	// 切换版本时立即刷新结果；名称/命名空间变化由用户点击「生成」更新
	watch(version, () => generate());

	generate();
</script>

<template>
	<div class="space-y-6">
		<!-- Controls section -->
		<div class="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
			<span class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">生成配置</span>

			<div class="flex flex-wrap items-center gap-4">
				<div class="flex items-center gap-2">
					<span class="text-xs font-semibold text-slate-500">UUID 版本</span>
					<n-select v-model:value="version" :options="versionOptions" class="!w-[200px] !max-w-full" />
				</div>
				<div class="flex items-center gap-2">
					<span class="text-xs font-semibold text-slate-500">生成数量</span>
					<n-input-number v-model:value="count" :max="100" :min="1" class="w-20" />
				</div>
				<n-checkbox v-model:checked="uppercase"> 大写 </n-checkbox>
			</div>

			<!-- v3/v5 名称化配置 -->
			<div v-if="isNameBased()" class="mt-4 flex flex-wrap items-center gap-4">
				<div class="flex items-center gap-2">
					<span class="text-xs font-semibold text-slate-500">名称</span>
					<n-input v-model:value="name" class="!w-[200px] !max-w-full" placeholder="任意文本" size="small" />
				</div>
				<div class="flex items-center gap-2">
					<span class="text-xs font-semibold text-slate-500">命名空间</span>
					<n-select v-model:value="namespace" :options="namespaceOptions" class="!w-[120px] !max-w-full" size="small" />
				</div>
			</div>

			<!-- 自定义命名空间输入 -->
			<div v-if="isNameBased() && namespace === 'custom'" class="mt-3 flex flex-wrap items-center gap-2">
				<n-input
					v-model:value="customNamespace"
					class="!w-[260px] !max-w-full"
					placeholder="输入命名空间 UUID，例如 6ba7b810-9dad-11d1-80b4-00c04fd430c8"
					size="small"
				/>
			</div>
			<p v-if="nsError" class="mt-2 text-xs text-red-500">{{ nsError }}</p>

			<p v-if="isNameBased()" class="mt-3 text-xs text-slate-400">
				v3/v5 为确定性版本：相同的名称与命名空间必定生成相同 UUID。
			</p>
		</div>

		<!-- Action buttons -->
		<div class="flex gap-2">
			<n-button type="primary" @click="generate">
				<span class="flex items-center gap-1.5">
					<TkuIcon :name="icons.star" :size="16" />
					<span>生成</span>
				</span>
			</n-button>
			<n-button v-if="uuids.length" secondary @click="copyAll">
				<span class="flex items-center gap-1.5">
					<TkuIcon :name="icons.clipboard" :size="16" />
					<span>复制全部</span>
				</span>
			</n-button>
		</div>

		<!-- Results list -->
		<div class="space-y-1.5">
			<div
				v-for="(uuid, i) in uuids"
				:key="i"
				class="flex cursor-pointer items-center justify-between p-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition animate-fade-in"
				@click="copyOne(uuid)"
			>
				<code class="text-sm font-mono text-slate-700">{{ uuid }}</code>
				<n-button class="pointer-events-none opacity-0 group-hover:opacity-100 transition" secondary size="tiny">
					复制
				</n-button>
			</div>
		</div>

		<!-- About UUID -->
		<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
			<h3 class="text-sm font-semibold text-blue-800 mb-3">什么是 UUID？</h3>
			<p class="text-sm text-slate-600 leading-relaxed mb-3">
				UUID（通用唯一标识符）是 128 位的标识符，通常以
				<code class="font-mono text-xs text-blue-800">xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx</code>
				形式呈现，用于在分布式系统中唯一标识实体。不同版本采用不同的生成策略：
			</p>
			<ul class="text-sm text-slate-600 leading-relaxed space-y-1.5 list-inside">
				<li>
					<span class="font-medium text-blue-800">v1</span>：基于时间戳与节点标识（MAC
					地址或随机）生成，可排序但可能泄露机器信息。
				</li>
				<li>
					<span class="font-medium text-blue-800">v3</span>：对名称与命名空间做 MD5 哈希，结果确定（相同输入必得相同
					UUID）。
				</li>
				<li><span class="font-medium text-blue-800">v4</span>：纯随机生成（加密安全），最常见的版本。</li>
				<li><span class="font-medium text-blue-800">v5</span>：与 v3 类似，但改用 SHA-1 哈希，碰撞概率更低。</li>
				<li><span class="font-medium text-blue-800">v6</span>：时间有序前缀的 v1 改进版，既保留时间信息又便于排序。</li>
				<li><span class="font-medium text-blue-800">v7</span>：Unix 时间戳 + 随机值，直观可排序，新应用推荐使用。</li>
			</ul>
			<p class="text-sm text-slate-600 leading-relaxed mt-3">
				历史上的 <span class="font-medium text-blue-800">v2</span>（DCE Security）依赖宿主机 POSIX
				UID/GID，在浏览器端无法有意义地生成，已不推荐使用，故本工具未提供。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed mt-2">
				请注意：UUID 保证的是唯一性，而非密码学安全，不应作为认证 token
				或密钥使用。所有生成均在浏览器本地完成，内容不会上传。
			</p>
		</div>
	</div>
</template>