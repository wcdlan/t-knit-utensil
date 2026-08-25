<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { NButton, NInputNumber, NSelect } from 'naive-ui';
	import { useFaker } from '@/composable/useFaker';
	import LocaleSelect from './common/LocaleSelect.vue';
	import ResultRow from './common/ResultRow.vue';
	import { copyToClipboard } from '@/utils/clipboard';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	const { faker, locale, setLocale } = useFaker(() => generate());

	const count = ref(5);
	const sex = ref<'any' | 'male' | 'female'>('any');

	interface IdentityRecord {
		name: string;
		sex: string;
		email: string;
		phone: string;
		username: string;
		birthdate: string;
		zodiac: string;
		bio: string;
	}

	const records = ref<IdentityRecord[]>([]);

	const sexOptions = [
		{ label: '随机', value: 'any' },
		{ label: '男性', value: 'male' },
		{ label: '女性', value: 'female' }
	];

	function formatDate(d: Date): string {
		const pad = (n: number) => String(n).padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
	}

	function generate() {
		const fk = faker();
		const result: IdentityRecord[] = [];
		for (let i = 0; i < count.value; i++) {
			const name = sex.value === 'any' ? fk.person.fullName() : fk.person.fullName({ sex: sex.value });
			result.push({
				name,
				sex: fk.person.sex(),
				email: fk.internet.email(),
				phone: fk.phone.number(),
				username: fk.internet.username(),
				birthdate: formatDate(fk.date.birthdate({ mode: 'age', min: 18, max: 65 })),
				zodiac: fk.person.zodiacSign(),
				bio: fk.person.bio()
			});
		}
		records.value = result;
	}

	function copyAll() {
		const text = records.value
			.map(
				(r, i) =>
					`# ${i + 1} ${r.name}\n性别：${r.sex}\n邮箱：${r.email}\n电话：${r.phone}\n用户名：${r.username}\n出生日期：${r.birthdate}\n星座：${r.zodiac}\n个性签名：${r.bio}`
			)
			.join('\n\n');
		copyToClipboard(text, '已复制全部');
	}

	watch(count, () => generate());
	watch(sex, () => generate());

	generate();
</script>

<template>
	<div class="space-y-6">
		<!-- 生成配置 -->
		<div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
			<div class="flex flex-wrap items-center gap-4">
				<LocaleSelect :model-value="locale" @update:model-value="setLocale" />
				<div class="flex items-center gap-2">
					<span class="text-xs font-semibold text-slate-500">生成数量</span>
					<n-input-number v-model:value="count" :max="20" :min="1" class="w-20" />
				</div>
				<div class="flex items-center gap-2">
					<span class="text-xs font-semibold text-slate-500">性别倾向</span>
					<n-select v-model:value="sex" :options="sexOptions" class="!w-[110px] !max-w-full" />
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
			<n-button :disabled="!records.length" secondary @click="copyAll">
				<span class="flex items-center gap-1.5">
					<TkuIcon :name="icons.clipboard" :size="16" />
					<span>复制全部</span>
				</span>
			</n-button>
		</div>

		<!-- 结果 -->
		<div v-if="records.length" class="space-y-3">
			<div v-for="(r, i) in records" :key="i" class="space-y-1.5 rounded-xl border border-slate-100 p-3">
				<div class="mb-1.5 flex items-center justify-between">
					<span class="text-sm font-semibold text-slate-700">{{ i + 1 }}. {{ r.name }}</span>
					<n-button secondary size="tiny" @click="copyToClipboard(JSON.stringify(r, null, 2), '已复制记录')">
						复制记录
					</n-button>
				</div>
				<div class="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
					<ResultRow :value="r.email" label="邮箱" />
					<ResultRow :value="r.phone" label="电话" />
					<ResultRow :value="r.username" label="用户名" />
					<ResultRow :value="r.birthdate" label="出生日期" />
					<ResultRow :value="r.sex" label="性别" />
					<ResultRow :value="r.zodiac" label="星座" />
				</div>
				<ResultRow :value="r.bio" label="个性签名" />
			</div>
		</div>

		<!-- 介绍 -->
		<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
			<h3 class="mb-3 text-sm font-semibold text-blue-800">关于「身份信息生成」</h3>
			<p class="mb-2 text-sm leading-relaxed text-slate-600">
				本工具基于 Faker.js 生成仿真个人资料，包括姓名、性别、邮箱、电话、用户名、出生日期、星座与个性签名。 数据由
				<span class="font-medium text-blue-800">Faker 词典</span
				>按所选语言区域组合而成，例如中文环境下会产出「俞美方」「安林市」这类本地化结果。
			</p>
			<p class="mb-2 text-sm leading-relaxed text-slate-600">
				切换「生成语言」后结果会自动刷新——中文（简体）为默认语言，也可切换为英语、日语、韩语等 14
				种区域，适合为多语言站点、国际化的 测试环境准备演示数据。
			</p>
			<p class="text-sm leading-relaxed text-slate-600">
				<span class="font-medium text-blue-800">使用提醒</span
				>：所有数据均为随机虚构，仅用于开发测试与界面演示，请勿用于实名认证、发送真实邮件等场景。生成过程完全在浏览器本地完成，不会上传任何内容。
			</p>
		</div>
	</div>
</template>
