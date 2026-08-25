<script lang="ts" setup>
	import { ref } from 'vue';
	import { copyToClipboard } from '@/utils/clipboard';
	import ConfigPanel from '@/fragment/tool/generator/password/ConfigPanel.vue';
	import ActionBar from '@/fragment/tool/generator/password/ActionBar.vue';
	import ResultList from '@/fragment/tool/generator/password/ResultList.vue';
	import AboutPanel from '@/fragment/tool/generator/password/AboutPanel.vue';

	const length = ref(16);
	const count = ref(5);
	const upper = ref(true);
	const lower = ref(true);
	const numbers = ref(true);
	const symbols = ref(true);
	const passwords = ref<string[]>([]);

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
		<ConfigPanel
			v-model:count="count"
			v-model:length="length"
			v-model:lower="lower"
			v-model:numbers="numbers"
			v-model:symbols="symbols"
			v-model:upper="upper"
		/>
		<ActionBar :passwords="passwords" @generate="generate" @copy-all="copyAll" />
		<ResultList :passwords="passwords" @copy-one="copyOne" />
		<AboutPanel />
	</div>
</template>
