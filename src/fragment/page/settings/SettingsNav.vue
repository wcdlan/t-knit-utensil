<script lang="ts" setup>
	import { h } from 'vue';
	import type { MenuOption } from 'naive-ui';
	import { NMenu } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import type { SettingsTabKey } from '@/types/site';

	const props = defineProps<{
		active: SettingsTabKey;
	}>();

	const emit = defineEmits<{
		'update:active': [value: SettingsTabKey];
	}>();

	// 导航项图标渲染函数（naive-ui menu icon 需要返回 VNode 工厂）
	function renderIcon(name: string) {
		return () => h(TkuIcon, { name, size: 16 });
	}

	// 配置组子导航项：key 与 SettingsTabKey 对应
	const options: MenuOption[] = [
		{ key: 'site', label: '站点信息', icon: renderIcon(icons.web) },
		{ key: 'footer', label: '页脚设置', icon: renderIcon(icons.textFormat) },
		{ key: 'quickLinks', label: '快捷连接', icon: renderIcon(icons.link) },
		{ key: 'security', label: '安全设置', icon: renderIcon(icons.shieldKey) },
		{ key: 'system', label: '系统信息', icon: renderIcon(icons.lightbulb) }
	];

	function handleUpdate(key: string | null) {
		if (key) emit('update:active', key as SettingsTabKey);
	}
</script>

<template>
	<!-- 配置组子导航：垂直菜单，点击切换右侧配置内容 -->
	<nav class="rounded-xl border border-slate-200/80 bg-white p-2 shadow-sm">
		<n-menu :options="options" :root-indent="8" :value="props.active" @update:value="handleUpdate" />
	</nav>
</template>
