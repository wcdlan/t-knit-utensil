<script lang="ts" setup>
	import { ref } from 'vue';
	import { NButton, NCheckbox, NInputNumber } from 'naive-ui';
	import { copyToClipboard } from '@/utils/clipboard';

	const uuids = ref<string[]>([]);
	const count = ref(5);
	const uppercase = ref(false);

	function generateV4(): string {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
			const r = (Math.random() * 16) | 0;
			const v = c === 'x' ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	}

	function generate() {
		const result: string[] = [];
		for (let i = 0; i < count.value; i++) {
			const uuid = generateV4();
			result.push(uppercase.value ? uuid.toUpperCase() : uuid);
		}
		uuids.value = result;
	}

	function copyAll() {
		copyToClipboard(uuids.value.join('\n'));
	}

	function copyOne(uuid: string) {
		copyToClipboard(uuid);
	}

	generate();
</script>

<template>
	<div class="space-y-4">
		<div class="flex flex-wrap items-center gap-4">
			<div class="flex items-center gap-2">
				<span class="text-sm text-gray-600">生成数量:</span>
				<n-input-number v-model:value="count" :max="100" :min="1" class="w-20" />
			</div>
			<n-checkbox v-model:checked="uppercase"> 大写 </n-checkbox>
			<n-button type="primary" @click="generate"> 生成 </n-button>
			<n-button v-if="uuids.length" @click="copyAll"> 复制全部 </n-button>
		</div>

		<div class="space-y-1">
			<div
				v-for="(uuid, i) in uuids"
				:key="i"
				class="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition"
			>
				<code class="text-sm font-mono text-gray-700">{{ uuid }}</code>
				<n-button class="opacity-0 group-hover:opacity-100 transition" size="tiny" @click="copyOne(uuid)">
					复制
				</n-button>
			</div>
		</div>
	</div>
</template>
