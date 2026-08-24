<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { NButton, NInputNumber, NSelect } from 'naive-ui';
	import { useFaker } from '@/data/useFaker';
	import LocaleSelect from './common/LocaleSelect.vue';
	import { copyToClipboard } from '@/utils/clipboard';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/components/common/TkuIcon.vue';

	const { faker, locale, setLocale } = useFaker(() => generate());

	type TextMode = 'word' | 'sentence' | 'paragraph' | 'slug';

	const mode = ref<TextMode>('paragraph');
	const count = ref(3);

	const modeOptions = [
		{ label: '单词', value: 'word' },
		{ label: '句子', value: 'sentence' },
		{ label: '段落', value: 'paragraph' },
		{ label: '短横线形式 (slug)', value: 'slug' }
	];

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

	watch(count, () => generate());
	watch(mode, () => generate());

	generate();
</script>

<template>
	<div class="space-y-6">
		<!-- 生成配置 -->
		<div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
			<div class="flex flex-wrap items-center gap-4">
				<LocaleSelect :model-value="locale" @update:model-value="setLocale" />
				<div class="flex items-center gap-2">
					<span class="text-xs font-semibold text-slate-500">文本类型</span>
					<n-select v-model:value="mode" :options="modeOptions" class="!w-[150px] !max-w-full" />
				</div>
				<div class="flex items-center gap-2">
					<span class="text-xs font-semibold text-slate-500">生成数量</span>
					<n-input-number v-model:value="count" :max="20" :min="1" class="w-20" />
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
		<div v-if="items.length" class="space-y-2">
			<div
				v-for="(t, i) in items"
				:key="i"
				class="cursor-pointer rounded-lg bg-slate-50 p-3 transition hover:bg-slate-100"
				@click="copyToClipboard(t, '已复制')"
			>
				<p class="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{{ t }}</p>
			</div>
		</div>

		<!-- 介绍 -->
		<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
			<h3 class="mb-3 text-sm font-semibold text-blue-800">关于「文本内容生成」</h3>
			<p class="mb-2 text-sm leading-relaxed text-slate-600">
				本工具按所选语言区域生成占位文本，支持单词、句子、段落与短横线形式（slug）四种粒度。中文区域基于《千字文》风格的词典生成中文占位文案，
				英文区域则为经典 Lorem Ipsum 拉丁文占位文本。
			</p>
			<p class="mb-2 text-sm leading-relaxed text-slate-600">
				占位文本常用于页面原型、排版预览与富文本测试：段落适合填充文章正文，句子适合列表摘要，单词适合标签或按钮文案，
				slug 形式则适合生成 URL 路径或文件名的雏形。
			</p>
			<p class="text-sm leading-relaxed text-slate-600">
				<span class="font-medium text-blue-800">小技巧</span
				>：切换语言后文本会自动重新生成，可以快速对比不同语言下的排版宽度，帮助评估 多语言站点是否存在文字溢出问题。
			</p>
		</div>
	</div>
</template>
