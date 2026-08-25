<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { useFaker } from '@/composable/useFaker';
	import { copyToClipboard } from '@/utils/clipboard';
	import ConfigPanel from '@/fragment/tool/generator/faker-network/ConfigPanel.vue';
	import ActionBar from '@/fragment/tool/generator/faker-network/ActionBar.vue';
	import ResultList from '@/fragment/tool/generator/faker-network/ResultList.vue';
	import AboutPanel from '@/fragment/tool/generator/faker-network/AboutPanel.vue';
	import type { NetworkRecord } from '@/types/network';

	const { faker, locale, setLocale } = useFaker(() => generate());

	const count = ref(5);
	const withDevice = ref(true);
	const records = ref<NetworkRecord[]>([]);

	function generate() {
		const fk = faker();
		const result: NetworkRecord[] = [];
		for (let i = 0; i < count.value; i++) {
			result.push({
				domain: fk.internet.domainName(),
				email: fk.internet.email(),
				ipv4: fk.internet.ipv4(),
				ipv6: fk.internet.ipv6(),
				mac: fk.internet.mac({ separator: ':' }),
				userAgent: fk.internet.userAgent(),
				port: fk.internet.port(),
				statusCode: fk.internet.httpStatusCode()
			});
		}
		records.value = result;
	}

	function copyAll() {
		const text = records.value
			.map(
				(r, i) =>
					`# 网络记录 ${i + 1}\n域名：${r.domain}\n邮箱：${r.email}\nIPv4：${r.ipv4}\nIPv6：${r.ipv6}\nMAC：${r.mac}\n端口：${r.port}\n状态码：${r.statusCode}\nUA：${r.userAgent}`
			)
			.join('\n\n');
		copyToClipboard(text, '已复制全部');
	}

	function copyRecord(record: NetworkRecord) {
		copyToClipboard(JSON.stringify(record, null, 2), '已复制记录');
	}

	watch(count, () => generate());

	generate();
</script>

<template>
	<div class="space-y-6">
		<!-- ConfigPanel：生成配置面板（数量 + 语言区域选择，默认中文） -->
		<ConfigPanel v-model:count="count" v-model:with-device="withDevice" :locale="locale" @update:locale="setLocale" />
		<!-- ActionBar：生成 / 复制全部 操作按钮 -->
		<ActionBar :has-records="!!records.length" @generate="generate" @copy-all="copyAll" />
		<!-- ResultList：生成的随机网络信息记录列表（域名 / IP / MAC 等，点击单条复制） -->
		<ResultList :records="records" :with-device="withDevice" @copy-record="copyRecord" />
		<!-- AboutPanel：工具简介与使用说明 -->
		<AboutPanel />
	</div>
</template>
