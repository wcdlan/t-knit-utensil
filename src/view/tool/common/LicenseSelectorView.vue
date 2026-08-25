<script lang="ts" setup>
	import { computed, ref } from 'vue';
	import { copyToClipboard } from '@/utils/clipboard';
	import { downloadTextFile } from '@/utils/download';
	import { LICENSES } from '@/data/licenses';
	import type { LicenseProfile, Question, ScoredLicense } from '@/types/license';
	import QuestionnairePanel from '@/fragment/tool/common/license-selector/QuestionnairePanel.vue';
	import ResultList from '@/fragment/tool/common/license-selector/ResultList.vue';
	import AboutPanel from '@/fragment/tool/common/license-selector/AboutPanel.vue';

	// ── 许可证全文（构建时加载） ──────────────────────────────────
	const LICENSE_TEXTS: Record<string, string> = import.meta.glob('@/assets/license/*.txt', {
		query: '?raw',
		import: 'default',
		eager: true
	}) as Record<string, string>;

	function getLicenseText(id: string, lang?: string): string {
		if (lang) {
			for (const [path, text] of Object.entries(LICENSE_TEXTS)) {
				if (path.endsWith(`/${id}.${lang}.txt`)) return text;
			}
		}
		for (const [path, text] of Object.entries(LICENSE_TEXTS)) {
			if (path.endsWith(`/${id}.txt`)) return text;
		}
		return '';
	}

	// ── Questions ────────────────────────────────────────────────────────────────

	const QUESTIONS: Question[] = [
		{
			id: 'projectType',
			text: '项目的主要用途是什么？',
			options: [
				{ value: 'personal', label: '个人学习/娱乐项目', description: 'Side project、学习练习、个人工具等' },
				{ value: 'commercial', label: '商业闭源产品', description: '计划闭源销售的商业软件产品' },
				{ value: 'library', label: '开源库/SDK/框架', description: '供其他开发者使用的库或框架' },
				{ value: 'saas', label: '企业 SaaS / 云服务', description: '基于云端的软件即服务产品' },
				{ value: 'cli', label: '命令行/桌面工具', description: 'CLI 工具、桌面应用等' }
			]
		},
		{
			id: 'copyleft',
			text: '你希望下游使用者遵守什么规则？',
			options: [
				{ value: 'none', label: '无限制，闭源商用均可', description: '使用者可自由使用，无需公开源码（MIT 风格）' },
				{ value: 'attribution', label: '仅保留版权声明即可', description: '只需保留原作者版权信息，其余自由使用' },
				{
					value: 'weak',
					label: '对文件的修改需开源',
					description: '修改本软件的文件需公开，但可与闭源代码共存（MPL 风格）'
				},
				{
					value: 'strong',
					label: '衍生作品需同协议开源',
					description: '基于本软件的作品必须以相同协议开源（GPL 风格）'
				},
				{
					value: 'network',
					label: '网络提供服务也需开源',
					description: '即使只在服务器上运行，也要公开源码（AGPL 风格）'
				}
			]
		},
		{
			id: 'patent',
			text: '你对专利保护的需求？',
			options: [
				{
					value: 'yes',
					label: '需要明确的专利授权条款',
					description: '许可证中应包含明示的专利授权，降低专利诉讼风险'
				},
				{ value: 'no', label: '不太关心专利条款', description: '专利相关的内容对我来说不重要' }
			]
		},
		{
			id: 'domestic',
			text: '是否偏好国产开源许可证？',
			options: [
				{ value: 'any', label: '不关心，国内外均可', description: '许可证产地不影响选择，按其他条件匹配即可' },
				{
					value: 'prefer',
					label: '优先国产许可证',
					description: '同等条件下偏向国产许可证（如木兰系列），但不排斥国外许可证'
				},
				{
					value: 'only',
					label: '仅考虑国产许可证',
					description: '只考虑国产许可证，如木兰宽松许可证 v2、木兰公共许可证 v2 等'
				}
			]
		},
		{
			id: 'simplicity',
			text: '你偏好哪种许可证风格？',
			options: [
				{ value: 'short', label: '简短精炼', description: '几十行以内，一目了然，MIT/ISC/BSD 风格' },
				{ value: 'medium', label: '适中即可', description: '关键条款覆盖到位，不需要太啰嗦（Apache/MPL 风格）' },
				{ value: 'full', label: '完整严谨', description: '全面的法律措辞，覆盖各种边界情况（GPL 风格）' }
			]
		}
	];

	// ── State ────────────────────────────────────────────────────────────────────
	const answers = ref<Record<string, string>>({
		projectType: 'personal',
		copyleft: 'none',
		patent: 'no',
		domestic: 'any',
		simplicity: 'short'
	});

	const expandedLicense = ref<string | null>(null);
	const selectedLang = ref<string>('');
	const copiedId = ref<string | null>(null);

	// ── Scoring Engine ───────────────────────────────────────────────────────────

	function computeScores(): ScoredLicense[] {
		const a = answers.value;
		const desiredCopyleftMax = { personal: 4, commercial: 1, library: 2, saas: 1, cli: 3 }[a.projectType] ?? 4;
		const copyleftTarget = { none: 0, attribution: 1, weak: 2, strong: 3, network: 4 }[a.copyleft] ?? 0;
		const needPatent = a.patent === 'yes';
		const simplicityTarget = { short: 0, medium: 1, full: 2 }[a.simplicity] ?? 0;

		const results: ScoredLicense[] = LICENSES.map((license) => {
			let score = 100;
			const copyleftDiff = Math.abs(license.copyleft - copyleftTarget);
			score -= copyleftDiff * 12;
			if (license.copyleft > desiredCopyleftMax) score -= (license.copyleft - desiredCopyleftMax) * 18;
			if (needPatent && !license.patent) score -= 15;
			if (!needPatent && license.patent) score += 3;
			const simplicityDiff = Math.abs(license.simplicity - simplicityTarget);
			score -= simplicityDiff * 8;
			if (a.domestic === 'only' && !license.domestic) score -= 50;
			if (a.domestic === 'prefer' && license.domestic) score += 12;
			if (a.domestic === 'only' && license.domestic) score += 5;
			if (a.projectType === 'commercial' || a.projectType === 'saas') {
				if (license.copyleft <= 1) score += 5;
				if (license.patent) score += 3;
			}
			if (a.projectType === 'library') {
				if (license.copyleft >= 1 && license.copyleft <= 2) score += 5;
				if (license.copyleft === 0) score -= 3;
			}
			if (a.projectType === 'saas' && license.copyleft >= 4) score -= 25;
			const highlights: string[] = [];
			if (license.copyleft === copyleftTarget) highlights.push('Copyleft 级别完全匹配');
			else if (copyleftDiff <= 1) highlights.push('Copyleft 级别接近');
			if (needPatent && license.patent) highlights.push('提供专利保护');
			if (simplicityDiff === 0) highlights.push('许可文本风格匹配');
			if (license.osiApproved) highlights.push('OSI 认证');
			if (a.domestic !== 'any' && license.domestic) highlights.push('国产许可证');
			return { license, score: Math.max(0, Math.round(score)), highlights };
		});

		results.sort((a, b) => b.score - a.score);
		return results;
	}

	const scoredLicenses = computed(() => computeScores());

	// Full text of the currently expanded license (empty when collapsed)
	const expandedText = computed(() => {
		if (!expandedLicense.value) return '';
		return getLicenseText(expandedLicense.value, selectedLang.value);
	});

	// ── Actions ──────────────────────────────────────────────────────────────────
	function toggleExpand(id: string) {
		if (expandedLicense.value === id) {
			expandedLicense.value = null;
		} else {
			expandedLicense.value = id;
			const lic = LICENSES.find((l) => l.id === id);
			selectedLang.value = lic?.languages[0]?.code ?? 'en';
		}
	}

	async function copyLicense(license: LicenseProfile) {
		await copyToClipboard(getLicenseText(license.id, selectedLang.value));
		copiedId.value = license.id;
		setTimeout(() => {
			copiedId.value = null;
		}, 2000);
	}

	function downloadLicense(license: LicenseProfile) {
		const text = getLicenseText(license.id, selectedLang.value);
		const langSuffix =
			selectedLang.value && selectedLang.value !== license.languages[0]?.code ? `.${selectedLang.value}` : '';
		downloadTextFile(text, `${license.spdxId.replace(/[^a-zA-Z0-9.-]/g, '_')}${langSuffix}.txt`);
	}
</script>

<template>
	<div class="flex flex-col lg:flex-row gap-6">
		<!-- QuestionnairePanel：许可证选择问卷面板（按项目类型 / Copyleft 强度等问答） -->
		<QuestionnairePanel
			:answers="answers"
			:questions="QUESTIONS"
			@update:answer="(questionId: string, value: string) => (answers[questionId] = value)"
		/>
		<!-- ResultList：推荐许可证结果列表（评分排序 + 展开全文 / 复制 / 下载） -->
		<ResultList
			:copied-id="copiedId"
			:expanded-id="expandedLicense"
			:expanded-text="expandedText"
			:items="scoredLicenses"
			:selected-lang="selectedLang"
			:total="LICENSES.length"
			@copy="copyLicense"
			@download="downloadLicense"
			@toggle-expand="toggleExpand"
			@update:selected-lang="(v: string) => (selectedLang = v)"
		/>
		<!-- AboutPanel：工具简介与使用说明 -->
		<AboutPanel />
	</div>
</template>
