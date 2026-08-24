<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { NButton, NInputNumber, NSelect } from 'naive-ui';
	import { useFaker } from '@/data/useFaker';
	import LocaleSelect from './common/LocaleSelect.vue';
	import { copyToClipboard } from '@/utils/clipboard';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/components/common/TkuIcon.vue';

	const { faker, locale, setLocale } = useFaker(() => generate());

	type Category = 'animal' | 'food' | 'color' | 'word';

	const category = ref<Category>('animal');
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

	function copyAll() {
		copyToClipboard(items.value.join('\n'), '已复制全部');
	}

	watch(count, () => generate());
	watch(category, () => generate());

	generate();
</script>

<template>
	<div class="space-y-6">
		<!-- 生成配置 -->
		<div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
			<div class="flex flex-wrap items-center gap-4">
				<LocaleSelect :model-value="locale" @update:model-value="setLocale" />
				<div class="flex items-center gap-2">
					<span class="text-xs font-semibold text-slate-500">类别</span>
					<n-select v-model:value="category" :options="categoryOptions" class="!w-[110px] !max-w-full" />
				</div>
				<div class="flex items-center gap-2">
					<span class="text-xs font-semibold text-slate-500">生成数量</span>
					<n-input-number v-model:value="count" :max="30" :min="1" class="w-20" />
				</div>
			</div>
		</div>

		<!-- 操作按钮 -->
		<div class="flex gap-2">
			<n-button type="primary" @click="generate">
				<span class="flex items-center gap-1.5">
					<TkuIcon :name="icons.refresh" :size="16" />
					<span>重新生成</span>
				</span>
			</n-button>
			<n-button :disabled="!items.length" secondary @click="copyAll">
				<span class="flex items-center gap-1.5">
					<TkuIcon :name="icons.clipboard" :size="16" />
					<span>复制全部</span>
				</span>
			</n-button>
		</div>

		<!-- 结果 -->
		<div v-if="items.length" class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
			<div
				v-for="(item, i) in items"
				:key="i"
				class="flex cursor-pointer items-center justify-between rounded-lg bg-slate-50 p-3 transition hover:bg-slate-100"
				@click="copyToClipboard(item, '已复制')"
			>
				<span class="truncate text-sm text-slate-700">{{ item }}</span>
				<n-button class="pointer-events-none opacity-0 transition group-hover:opacity-100" secondary size="tiny">
					复制
				</n-button>
			</div>
		</div>

		<!-- 介绍 -->
		<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
			<h3 class="mb-3 text-sm font-semibold text-blue-800">关于「自然万物生成」</h3>
			<p class="mb-2 text-sm leading-relaxed text-slate-600">
				本工具汇集 Faker
				的自然类词库，按类别生成动物、美食、颜色与词汇四类内容。中文区域会产出「北京犬」「番茄酱烤鳄鱼肉串」「淡紫色」等本地化词条，
				切换语言即可获得对应区域的词条。
			</p>
			<p class="mb-2 text-sm leading-relaxed text-slate-600">
				动物词库覆盖犬、猫、鸟、鱼等常见分类及宠物名；美食词库包含菜名、水果、蔬菜、食材、香料与菜系；颜色词库既有中文颜色名，
				也包含 HEX / CSS 格式的随机色值；词汇词库则抽取名词、形容词、动词与副词。
			</p>
			<p class="text-sm leading-relaxed text-slate-600">
				<span class="font-medium text-blue-800">典型场景</span>：菜谱 Demo
				的食材列表、宠物商店页面、配色方案灵感、以及词典类应用的中文词条测试。
			</p>
		</div>
	</div>
</template>
