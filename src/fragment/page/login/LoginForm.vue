<script lang="ts" setup>
	import { computed } from 'vue';
	import { NAlert, NButton, NInput } from 'naive-ui';

	const props = defineProps<{
		password: string;
		error: string;
		loading: boolean;
	}>();

	const emit = defineEmits<{
		'update:password': [value: string];
		login: [];
	}>();

	const password = computed({
		get: () => props.password,
		set: (v: string) => emit('update:password', v)
	});
</script>

<template>
	<!-- 登录卡片：密码输入 + 错误提示 + 登录按钮 -->
	<div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8">
		<div class="space-y-5">
			<div>
				<label class="block text-xs font-semibold text-slate-500 mb-2">密码</label>
				<n-input
					v-model:value="password"
					placeholder="请输入密码"
					show-password-toggle
					size="large"
					type="password"
					@keyup.enter="emit('login')"
				/>
			</div>

			<!-- 错误提示 -->
			<n-alert v-if="error" class="text-sm" type="error">
				{{ error }}
			</n-alert>

			<n-button
				:loading="loading"
				block
				class="!rounded-lg !font-medium"
				size="large"
				type="primary"
				@click="emit('login')"
			>
				{{ loading ? '验证中...' : '登录' }}
			</n-button>
		</div>
	</div>
</template>
