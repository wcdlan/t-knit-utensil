<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { useFaker } from '@/composable/useFaker';
	import { copyToClipboard } from '@/utils/clipboard';
	import type { FakerNatureCategory } from '@/types/faker';
	import ConfigPanel from '@/fragment/tool/generator/faker-nature/ConfigPanel.vue';
	import ActionBar from '@/fragment/tool/generator/faker-nature/ActionBar.vue';
	import ResultList from '@/fragment/tool/generator/faker-nature/ResultList.vue';
	import AboutPanel from '@/fragment/tool/generator/faker-nature/AboutPanel.vue';

	const { faker, locale, setLocale } = useFaker(() => generate());

	const category = ref<FakerNatureCategory>('animal');
	const count = ref(6);

	const categoryOptions = [
		{ label: '动物', value: 'animal' },
		{ label: '美食', value: 'food' },
		{ label: '颜色', value: 'color' },
		{ label: '词汇', value: 'word' }
	];

	const items = ref<string[]>([]);

	function generate() {
		const fk = faker();
		const result: string[] = [];
		const animalPool = [
			() => fk.animal.type(),
			() => fk.animal.dog(),
			() => fk.animal.cat(),
			() => fk.animal.bird(),
			() => fk.animal.petName(),
			() => fk.animal.fish()
		];
		const foodPool = [
			() => fk.food.dish(),
			() => fk.food.fruit(),
			() => fk.food.vegetable(),
			() => fk.food.ingredient(),
			() => fk.food.spice(),
			() => fk.food.ethnicCategory()
		];
		const colorPool = [
			() => fk.color.human(),
			() => fk.color.rgb(),
			() => fk.color.rgb({ format: 'css' }),
			() => fk.color.hsl({ format: 'css' }),
			() => fk.color.space()
		];
		const wordPool = [
			() => fk.word.noun(),
			() => fk.word.adjective(),
			() => fk.word.verb(),
			() => fk.word.adverb(),
			() => fk.word.sample()
		];

		const pool =
			category.value === 'animal'
				? animalPool
				: category.value === 'food'
					? foodPool
					: category.value === 'color'
						? colorPool
						: wordPool;

		for (let i = 0; i < count.value; i++) {
			result.push(pool[Math.floor(Math.random() * pool.length)]());
		}
		items.value = result;
	}

	function copyItem(item: string) {
		copyToClipboard(item, '已复制');
	}

	function copyAll() {
		copyToClipboard(items.value.join('\n'), '已复制全部');
	}

	watch(count, () => generate());
	watch(category, () => generate());

	generate();
</script>

<template>
	<div class="space-y-6">
		<!-- ConfigPanel：生成配置面板（类别 / 数量 + 语言区域选择） -->
		<ConfigPanel
			:category="category"
			:category-options="categoryOptions"
			:count="count"
			:locale="locale"
			@update:category="(v) => (category = v)"
			@update:count="(v) => (count = v)"
			@update:locale="setLocale"
		/>
		<!-- ActionBar：生成 / 复制全部 操作按钮 -->
		<ActionBar :can-copy="items.length > 0" @generate="generate" @copy-all="copyAll" />
		<!-- ResultList：生成的随机自然词汇列表（动物 / 美食 / 颜色 / 词汇，点击复制） -->
		<ResultList :items="items" @copy="copyItem" />
		<!-- AboutPanel：工具简介与使用说明 -->
		<AboutPanel />
	</div>
</template>
