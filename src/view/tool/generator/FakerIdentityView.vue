<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { useFaker } from '@/composable/useFaker';
	import { copyToClipboard } from '@/utils/clipboard';
	import ConfigPanel from '@/fragment/tool/generator/faker-identity/ConfigPanel.vue';
	import ActionBar from '@/fragment/tool/generator/faker-identity/ActionBar.vue';
	import ResultList from '@/fragment/tool/generator/faker-identity/ResultList.vue';
	import AboutPanel from '@/fragment/tool/generator/faker-identity/AboutPanel.vue';
	import type { IdentityRecord, IdentitySex } from '@/types/identity';

	const { faker, locale, setLocale } = useFaker(() => generate());

	const count = ref(5);
	const sex = ref<IdentitySex>('any');

	const records = ref<IdentityRecord[]>([]);

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

	function copyRecord(record: IdentityRecord) {
		copyToClipboard(JSON.stringify(record, null, 2), '已复制记录');
	}

	watch(count, () => generate());
	watch(sex, () => generate());

	generate();
</script>

<template>
	<div class="space-y-6">
		<ConfigPanel v-model:count="count" v-model:sex="sex" :locale="locale" @update:locale="setLocale" />
		<ActionBar :disabled="!records.length" @generate="generate" @copy-all="copyAll" />
		<ResultList :records="records" @copy-record="copyRecord" />
		<AboutPanel />
	</div>
</template>
