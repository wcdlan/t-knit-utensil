<script lang="ts" setup>
	import { computed } from 'vue';
	import { NCard, NInput } from 'naive-ui';

	const props = defineProps<{
		copyright: string;
		icp: string;
		icpUrl: string;
		poweredBy: string;
	}>();

	const emit = defineEmits<{
		'update:copyright': [value: string];
		'update:icp': [value: string];
		'update:icpUrl': [value: string];
		'update:poweredBy': [value: string];
	}>();

	const copyright = computed({
		get: () => props.copyright,
		set: (v: string) => emit('update:copyright', v)
	});

	const icp = computed({
		get: () => props.icp,
		set: (v: string) => emit('update:icp', v)
	});

	const icpUrl = computed({
		get: () => props.icpUrl,
		set: (v: string) => emit('update:icpUrl', v)
	});

	const poweredBy = computed({
		get: () => props.poweredBy,
		set: (v: string) => emit('update:poweredBy', v)
	});
</script>

<template>
	<!-- 页脚设置卡片：版权 / ICP / 声明文字 -->
	<n-card size="small" title="页脚设置">
		<div class="space-y-4">
			<div>
				<label class="block text-xs font-semibold text-slate-500 mb-1">版权归属</label>
				<n-input v-model:value="copyright" placeholder="例: TKU" />
			</div>
			<div>
				<label class="block text-xs font-semibold text-slate-500 mb-1">ICP 备案号</label>
				<n-input v-model:value="icp" placeholder="例: 京ICP备XXXXXXXX号" />
			</div>
			<div>
				<label class="block text-xs font-semibold text-slate-500 mb-1">备案链接</label>
				<n-input v-model:value="icpUrl" placeholder="https://beian.miit.gov.cn" />
			</div>
			<div>
				<label class="block text-xs font-semibold text-slate-500 mb-1">底部声明文字</label>
				<n-input v-model:value="poweredBy" placeholder="站点底部附加声明" />
			</div>
		</div>
	</n-card>
</template>
