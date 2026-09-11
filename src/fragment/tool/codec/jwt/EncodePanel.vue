<script lang="ts" setup>
	import { NButton, NInput, NSelect, type SelectOption } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import type { JwtAlgorithm, JwtAlgorithmOption } from '@/types/jwt';

	const props = defineProps<{
		algorithm: JwtAlgorithm;
		algorithmOptions: JwtAlgorithmOption[];
		headerJson: string;
		payloadJson: string;
		secret: string;
	}>();

	const emit = defineEmits<{
		'update:algorithm': [value: JwtAlgorithm];
		'update:headerJson': [value: string];
		'update:payloadJson': [value: string];
		'update:secret': [value: string];
		generate: [];
		fillExample: [];
		generateSecret: [];
	}>();

	/** 算法下拉选项（标签后附算法说明） */
	const selectOptions = (): SelectOption[] =>
		props.algorithmOptions.map((o) => ({ label: o.label + ' — ' + o.description, value: o.value }));
</script>

<template>
	<div class="space-y-4">
		<div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
			<span class="mb-3 block text-xs font-semibold tracking-wider text-slate-500 uppercase">签名配置</span>
			<div class="flex flex-wrap items-end gap-3">
				<div>
					<label class="mb-1 block text-xs font-semibold text-slate-500">签名算法</label>
					<n-select
						:options="selectOptions()"
						:value="props.algorithm"
						class="!w-[260px] !max-w-full"
						@update:value="(v: JwtAlgorithm) => emit('update:algorithm', v)"
					/>
				</div>
				<div class="min-w-[16rem] flex-1">
					<label class="mb-1 block text-xs font-semibold text-slate-500">HMAC 密钥（Secret）</label>
					<n-input
						:input-props="{ class: 'font-mono' }"
						:value="props.secret"
						placeholder="输入签名密钥"
						show-password-on="click"
						type="password"
						@update:value="(v: string) => emit('update:secret', v)"
					/>
				</div>
				<!-- 随机密钥：生成一段随机字符串作为 HMAC 密钥 -->
				<n-button secondary @click="emit('generateSecret')">
					<span class="flex items-center gap-1.5">
						<TkuIcon :name="icons.refresh" :size="16" />
						<span>随机密钥</span>
					</span>
				</n-button>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<div>
				<div class="mb-2 flex items-center justify-between">
					<label class="text-xs font-semibold text-slate-500">Header（JSON）</label>
					<span class="text-[10px] text-slate-400">{{ props.headerJson.length }} 字符</span>
				</div>
				<n-input
					:autosize="{ minRows: 6, maxRows: 14 }"
					:input-props="{ class: 'font-mono text-xs' }"
					:value="props.headerJson"
					type="textarea"
					@update:value="(v: string) => emit('update:headerJson', v)"
				/>
			</div>
			<div>
				<div class="mb-2 flex items-center justify-between">
					<label class="text-xs font-semibold text-slate-500">Payload（JSON）</label>
					<span class="text-[10px] text-slate-400">{{ props.payloadJson.length }} 字符</span>
				</div>
				<n-input
					:autosize="{ minRows: 6, maxRows: 14 }"
					:input-props="{ class: 'font-mono text-xs' }"
					:value="props.payloadJson"
					type="textarea"
					@update:value="(v: string) => emit('update:payloadJson', v)"
				/>
			</div>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<!-- 生成 Token：按配置对 Header 与 Payload 签名并输出完整 token -->
			<n-button type="primary" @click="emit('generate')">
				<span class="flex items-center gap-1.5">
					<TkuIcon :name="icons.lock" :size="16" />
					<span>生成 Token</span>
				</span>
			</n-button>
			<!-- 填充示例：载入包含标准声明的示例 Header / Payload -->
			<n-button secondary @click="emit('fillExample')">
				<span class="flex items-center gap-1.5">
					<TkuIcon :name="icons.lightbulb" :size="16" />
					<span>填充示例</span>
				</span>
			</n-button>
		</div>
	</div>
</template>
