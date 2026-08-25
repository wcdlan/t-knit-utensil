<script lang="ts" setup>
	import { computed, ref, watch } from 'vue';
	import { v1, v3, v4, v5, v6, v7, validate } from 'uuid';
	import { copyToClipboard } from '@/utils/clipboard';
	import ConfigPanel from '@/fragment/tool/generator/uuid/ConfigPanel.vue';
	import ActionBar from '@/fragment/tool/generator/uuid/ActionBar.vue';
	import ResultList from '@/fragment/tool/generator/uuid/ResultList.vue';
	import AboutPanel from '@/fragment/tool/generator/uuid/AboutPanel.vue';
	import type { NamespaceKey, NamespacePreset, UuidVersion } from '@/types/uuid';

	const uuids = ref<string[]>([]);
	const count = ref(5);
	const uppercase = ref(false);
	const version = ref<UuidVersion>('v4');

	// v3/v5 名称化版本配置
	const name = ref('example.com');
	const namespace = ref<NamespaceKey>('dns');
	const customNamespace = ref('');
	const nsError = ref('');

	// RFC 4122 预定义命名空间常量（uuid 包 v14 不再导出，直接内联）
	const NAMESPACE_MAP: Record<NamespacePreset, string> = {
		dns: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
		url: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
		oid: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
		x500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8'
	};

	const isNameBased = computed(() => version.value === 'v3' || version.value === 'v5');

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
		if (isNameBased.value && !resolveNamespace()) {
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
		<ConfigPanel
			v-model:count="count"
			v-model:custom-namespace="customNamespace"
			v-model:name="name"
			v-model:namespace="namespace"
			v-model:uppercase="uppercase"
			v-model:version="version"
			:name-based="isNameBased"
			:ns-error="nsError"
		/>
		<ActionBar :uuids="uuids" @generate="generate" @copy-all="copyAll" />
		<ResultList :uuids="uuids" @copy-one="copyOne" />
		<AboutPanel />
	</div>
</template>
