<script lang="ts" setup>
	import { ref } from 'vue';
	import { NButton, NCheckbox, NInputNumber } from 'naive-ui';
	import { copyToClipboard } from '@/utils/clipboard';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/components/common/TkuIcon.vue';

	const length = ref(16);
	const upper = ref(true);
	const lower = ref(true);
	const numbers = ref(true);
	const symbols = ref(true);
	const passwords = ref<string[]>([]);
	const count = ref(5);

	function generate() {
		let chars = '';
		if (lower.value) chars += 'abcdefghijklmnopqrstuvwxyz';
		if (upper.value) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		if (numbers.value) chars += '0123456789';
		if (symbols.value) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

		if (!chars) {
			passwords.value = ['请至少选择一种字符类型'];
			return;
		}

		const result: string[] = [];
		for (let i = 0; i < count.value; i++) {
			let pwd = '';
			const bytes = crypto.getRandomValues(new Uint32Array(length.value));
			for (let j = 0; j < length.value; j++) {
				pwd += chars[bytes[j] % chars.length];
			}
			result.push(pwd);
		}
		passwords.value = result;
	}

	function copyAll() {
		copyToClipboard(passwords.value.join('\n'));
	}

	function copyOne(pwd: string) {
		copyToClipboard(pwd);
	}

	generate();
</script>

<template>
	<div class="space-y-6">
		<!-- Controls section -->
		<div class="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
			<span class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">生成配置</span>
			<div class="flex flex-wrap gap-4 items-end">
				<div>
					<label class="block text-xs font-semibold text-slate-500 mb-1">密码长度</label>
					<n-input-number v-model:value="length" :max="128" :min="4" class="w-20" />
				</div>
				<div>
					<label class="block text-xs font-semibold text-slate-500 mb-1">生成数量</label>
					<n-input-number v-model:value="count" :max="50" :min="1" class="w-20" />
				</div>
			</div>

			<div class="flex flex-wrap gap-4 mt-3">
				<n-checkbox v-model:checked="upper"> A-Z </n-checkbox>
				<n-checkbox v-model:checked="lower"> a-z </n-checkbox>
				<n-checkbox v-model:checked="numbers"> 0-9 </n-checkbox>
				<n-checkbox v-model:checked="symbols"> !@#$ </n-checkbox>
			</div>
		</div>

		<!-- Action buttons -->
		<div class="flex gap-2">
			<n-button type="primary" @click="generate">
				<span class="flex items-center gap-1.5">
					<TkuIcon :name="icons.star" :size="16" />
					<span>生成</span>
				</span>
			</n-button>
			<n-button v-if="passwords.length" secondary @click="copyAll">
				<span class="flex items-center gap-1.5">
					<TkuIcon :name="icons.clipboard" :size="16" />
					<span>复制全部</span>
				</span>
			</n-button>
		</div>

		<!-- Results list -->
		<div class="space-y-1.5">
			<div
				v-for="(pwd, i) in passwords"
				:key="i"
				class="flex items-center justify-between p-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition animate-fade-in cursor-pointer"
				@click="copyOne(pwd)"
			>
				<code class="text-sm font-mono text-slate-700">{{ pwd }}</code>
				<n-button class="opacity-0 group-hover:opacity-100 transition" secondary size="tiny" @click.stop="copyOne(pwd)">
					复制
				</n-button>
			</div>
		</div>
	</div>
</template>
