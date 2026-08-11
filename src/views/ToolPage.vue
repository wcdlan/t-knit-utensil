<script lang="ts" setup>
	import { computed } from 'vue'
	import { useRoute } from 'vue-router'
	import { getToolById } from '@/data/tools'

	const route = useRoute()
	const toolId = computed(() => route.params.toolId as string)
	const tool = computed(() => getToolById(toolId.value))
</script>

<template>
	<div v-if="tool">
		<!-- Breadcrumb -->
		<div class="mb-6">
			<router-link class="text-sm text-blue-500 hover:text-blue-700 transition" to="/"> &larr; 返回首页 </router-link>
		</div>

		<!-- Tool Header -->
		<div class="mb-6">
			<div class="flex items-center gap-3 mb-2">
				<span class="text-3xl">{{ tool.icon }}</span>
				<h1 class="text-2xl font-bold text-gray-900">{{ tool.name }}</h1>
			</div>
			<p class="text-gray-600">{{ tool.description }}</p>
		</div>

		<!-- Dynamic Tool Component -->
		<div class="bg-white rounded-xl border border-gray-200 p-6">
			<JsonFormatter v-if="toolId === 'json-formatter'" />
			<Base64Tool v-else-if="toolId === 'base64'" />
			<UrlEncode v-else-if="toolId === 'url-encode'" />
			<UnicodeTool v-else-if="toolId === 'unicode'" />
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
	<div v-else class="text-center py-20">
		<p class="text-gray-500 text-lg">工具未找到</p>
		<router-link class="text-blue-500 hover:text-blue-700 mt-4 inline-block" to="/"> 返回首页 </router-link>
	</div>
</template>

<script lang="ts">
	import JsonFormatter from '@/components/tools/formatter/JsonFormatter.vue'
	import Base64Tool from '@/components/tools/codec/Base64Tool.vue'
	import UrlEncode from '@/components/tools/codec/UrlEncode.vue'
	import UnicodeTool from '@/components/tools/codec/UnicodeTool.vue'
	import SqlFormatter from '@/components/tools/formatter/SqlFormatter.vue'
	import TimestampTool from '@/components/tools/converter/TimestampTool.vue'
	import ColorConverter from '@/components/tools/converter/ColorConverter.vue'
	import UuidGenerator from '@/components/tools/generator/UuidGenerator.vue'
	import HashTool from '@/components/tools/generator/HashTool.vue'
	import QrcodeTool from '@/components/tools/generator/QrcodeTool.vue'
	import PasswordTool from '@/components/tools/generator/PasswordTool.vue'
	import RegexTool from '@/components/tools/text/RegexTool.vue'
	import DiffTool from '@/components/tools/text/DiffTool.vue'
	import WordCount from '@/components/tools/text/WordCount.vue'
	import SshKeyGen from '@/components/tools/ssh/SshKeyGen.vue'
	import FaviconTool from '@/components/tools/image/FaviconTool.vue'
	import LicenseSelector from '@/components/tools/common/LicenseSelector.vue'
	import AiApiTester from '@/components/tools/ai/AiApiTester.vue'

	export default {
		components: {
			JsonFormatter,
			Base64Tool,
			UrlEncode,
			UnicodeTool,
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
	}
</script>
