<script lang="ts" setup>
	import { computed } from 'vue';
	import { useRoute } from 'vue-router';
	import { getToolById } from '@/data/tools';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/components/common/TkuIcon.vue';

	const route = useRoute();
	const toolId = computed(() => route.params.toolId as string);
	const tool = computed(() => getToolById(toolId.value));
</script>

<template>
	<div v-if="tool">
		<!-- Breadcrumb -->
		<div class="mb-6">
			<router-link
				class="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-500 transition-colors duration-200"
				to="/"
			>
				<span class="text-base">&larr;</span>
				<span>返回首页</span>
			</router-link>
		</div>

		<!-- Tool Header with gradient icon container -->
		<div class="mb-8">
			<div class="flex items-center gap-4">
				<div
					class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center shadow-sm"
				>
					<TkuIcon :name="tool.icon" :size="28" />
				</div>
				<div>
					<h1 class="text-2xl font-bold text-slate-800 tracking-tight">{{ tool.name }}</h1>
					<p class="text-slate-500 text-sm mt-0.5">{{ tool.description }}</p>
				</div>
			</div>
		</div>

		<!-- Dynamic Tool Component -->
		<div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8">
			<JsonFormatter v-if="toolId === 'json-formatter'" />
			<Base64Tool v-else-if="toolId === 'base64'" />
			<UrlEncode v-else-if="toolId === 'url-encode'" />
			<UnicodeTool v-else-if="toolId === 'unicode'" />
			<EncodingTool v-else-if="toolId === 'encoding'" />
			<SqlFormatter v-else-if="toolId === 'sql-formatter'" />
			<TimestampTool v-else-if="toolId === 'timestamp'" />
			<ColorConverter v-else-if="toolId === 'color'" />
			<UuidGenerator v-else-if="toolId === 'uuid'" />
			<HashTool v-else-if="toolId === 'hash'" />
			<QrcodeTool v-else-if="toolId === 'qrcode'" />
			<PasswordTool v-else-if="toolId === 'password'" />
			<RegexTool v-else-if="toolId === 'regex'" />
			<DiffTool v-else-if="toolId === 'diff'" />
			<WordCount v-else-if="toolId === 'word-count'" />
			<SshKeyGen v-else-if="toolId === 'ssh-keygen'" />
			<FaviconTool v-else-if="toolId === 'favicon'" />
			<AiApiTester v-else-if="toolId === 'ai-tester'" />
			<LicenseSelector v-else-if="toolId === 'license-selector'" />
		</div>
	</div>

	<!-- Not found state -->
	<div v-else class="flex flex-col items-center justify-center py-24 text-center">
		<div class="mb-4 text-slate-300">
			<TkuIcon :name="icons.magnify" :size="48" />
		</div>
		<p class="text-slate-500 text-lg font-medium mb-2">工具未找到</p>
		<p class="text-slate-400 text-sm mb-6">请检查工具地址是否正确</p>
		<router-link
			class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium no-underline"
			to="/"
		>
			<span>&larr;</span> 返回首页
		</router-link>
	</div>
</template>

<script lang="ts">
	import JsonFormatter from '@/components/tools/formatter/JsonFormatter.vue';
	import Base64Tool from '@/components/tools/codec/Base64Tool.vue';
	import UrlEncode from '@/components/tools/codec/UrlEncode.vue';
	import UnicodeTool from '@/components/tools/codec/UnicodeTool.vue';
	import EncodingTool from '@/components/tools/codec/EncodingTool.vue';
	import SqlFormatter from '@/components/tools/formatter/SqlFormatter.vue';
	import TimestampTool from '@/components/tools/converter/TimestampTool.vue';
	import ColorConverter from '@/components/tools/converter/ColorConverter.vue';
	import UuidGenerator from '@/components/tools/generator/UuidGenerator.vue';
	import HashTool from '@/components/tools/generator/HashTool.vue';
	import QrcodeTool from '@/components/tools/generator/QrcodeTool.vue';
	import PasswordTool from '@/components/tools/generator/PasswordTool.vue';
	import RegexTool from '@/components/tools/text/RegexTool.vue';
	import DiffTool from '@/components/tools/text/DiffTool.vue';
	import WordCount from '@/components/tools/text/WordCount.vue';
	import SshKeyGen from '@/components/tools/ssh/SshKeyGen.vue';
	import FaviconTool from '@/components/tools/image/FaviconTool.vue';
	import LicenseSelector from '@/components/tools/common/LicenseSelector.vue';
	import AiApiTester from '@/components/tools/ai/AiApiTester.vue';

	export default {
		components: {
			JsonFormatter,
			Base64Tool,
			UrlEncode,
			UnicodeTool,
			EncodingTool,
			SqlFormatter,
			TimestampTool,
			ColorConverter,
			UuidGenerator,
			HashTool,
			QrcodeTool,
			PasswordTool,
			RegexTool,
			DiffTool,
			WordCount,
			SshKeyGen,
			FaviconTool,
			LicenseSelector,
			AiApiTester
		}
	};
</script>
