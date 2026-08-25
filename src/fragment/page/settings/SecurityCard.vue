<script lang="ts" setup>
	import { computed } from 'vue';
	import { NCard, NInput } from 'naive-ui';

	const props = defineProps<{
		password: string;
	}>();

	const emit = defineEmits<{
		'update:password': [value: string];
	}>();

	const password = computed({
		get: () => props.password,
		set: (v: string) => emit('update:password', v)
	});
</script>

<template>
	<!-- 安全设置卡片：登录密码 -->
	<n-card size="small" title="安全设置">
		<div class="space-y-4">
			<div>
				<label class="block text-xs font-semibold text-slate-500 mb-1">登录密码</label>
				<n-input v-model:value="password" placeholder="修改后下次登录使用新密码" show-password-toggle type="password" />
			</div>
		</div>
	</n-card>
</template>
