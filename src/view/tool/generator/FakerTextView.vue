<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { useFaker } from '@/composable/useFaker';
	import { copyToClipboard } from '@/utils/clipboard';
	import ConfigPanel from '@/fragment/tool/generator/faker-text/ConfigPanel.vue';
	import ActionBar from '@/fragment/tool/generator/faker-text/ActionBar.vue';
	import ResultList from '@/fragment/tool/generator/faker-text/ResultList.vue';
	import AboutPanel from '@/fragment/tool/generator/faker-text/AboutPanel.vue';
	import type { TextMode } from '@/types/faker-text';

	const { faker, locale } = useFaker(() => generate());

	const mode = ref<TextMode>('paragraph');
	const count = ref(3);

	const items = ref<string[]>([]);

	function generate() {
		const fk = faker();
		const result: string[] = [];
		for (let i = 0; i < count.value; i++) {
			switch (mode.value) {
				case 'word':
					result.push(fk.lorem.word());
					break;
				case 'sentence':
					result.push(fk.lorem.sentence({ min: 8, max: 16 }));
					break;
				case 'paragraph':
					result.push(fk.lorem.paragraph({ min: 3, max: 6 }));
					break;
				case 'slug':
					result.push(fk.lorem.slug({ min: 3, max: 6 }));
					break;
			}
		}
		items.value = result;
	}

	function copyAll() {
		const text = items.value.join(mode.value === 'word' ? '\n' : '\n\n');
		copyToClipboard(text, '已复制全部');
	}

	function copyItem(text: string) {
		copyToClipboard(text, '已复制');
	}

	watch(count, () => generate());
	watch(mode, () => generate());

	generate();
</script>

<template>
	<div class="space-y-6">
		<ConfigPanel v-model:count="count" v-model:locale="locale" v-model:mode="mode" />
		<ActionBar :has-items="!!items.length" @generate="generate" @copy-all="copyAll" />
		<ResultList :items="items" @copy-text="copyItem" />
		<AboutPanel />
	</div>
</template>
