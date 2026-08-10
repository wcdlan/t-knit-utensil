<script lang="ts" setup>
import {computed, ref} from 'vue'

// ── License full texts (loaded at build time) ──────────────────────────────────
const LICENSE_TEXTS: Record<string, string> = import.meta.glob(
    '@/assets/license/*.txt',
    {query: '?raw', import: 'default', eager: true},
) as Record<string, string>

function getLicenseText(id: string): string {
  for (const [path, text] of Object.entries(LICENSE_TEXTS)) {
    if (path.endsWith(`/${id}.txt`)) return text
  }
  return ''
}

// ── License Profiles ──────────────────────────────────────────────────────────
interface LicenseProfile {
  id: string
  name: string
  spdxId: string
  copyleft: number        // 0=none 1=attribution 2=weak(file) 3=strong(viral) 4=network(AGPL)
  patent: boolean
  simplicity: number      // 0=short 1=medium 2=comprehensive
  osiApproved: boolean
  summary: string
  tags: string[]
  url: string
}

const LICENSES: LicenseProfile[] = [
  {
    id: 'mit', name: 'MIT License', spdxId: 'MIT',
    copyleft: 1, patent: false, simplicity: 0, osiApproved: true,
    summary: '最宽松的许可协议之一。允许任意使用、复制、修改、合并、出版、分发、再许可和/或销售软件副本，仅需保留原版权声明和许可声明。',
    tags: ['宽松', '简短', '商业友好', '社区热门'],
    url: 'https://opensource.org/licenses/MIT',
  },
  {
    id: 'apache-2.0', name: 'Apache License 2.0', spdxId: 'Apache-2.0',
    copyleft: 1, patent: true, simplicity: 1, osiApproved: true,
    summary: '与 MIT 类似但增加了专利授权条款和商标保护。使用者获得明确的专利许可，修改文件需注明变更。适合需要专利保护的项目。',
    tags: ['宽松', '专利保护', '商业友好', '企业首选'],
    url: 'https://www.apache.org/licenses/LICENSE-2.0',
  },
  {
    id: 'bsd-2', name: 'BSD 2-Clause License', spdxId: 'BSD-2-Clause',
    copyleft: 1, patent: false, simplicity: 0, osiApproved: true,
    summary: '与 MIT 几乎相同，仅需保留版权声明和免责声明。额外包含"禁止以作者名义背书"条款。非常简短。',
    tags: ['宽松', '简短', '商业友好'],
    url: 'https://opensource.org/licenses/BSD-2-Clause',
  },
  {
    id: 'bsd-3', name: 'BSD 3-Clause License', spdxId: 'BSD-3-Clause',
    copyleft: 1, patent: false, simplicity: 0, osiApproved: true,
    summary: 'BSD 2-Clause 的扩展，增加"未经许可不得使用作者/机构名称背书"条款。Go 语言等项目使用。',
    tags: ['宽松', '简短', '商业友好', '反背书'],
    url: 'https://opensource.org/licenses/BSD-3-Clause',
  },
  {
    id: 'isc', name: 'ISC License', spdxId: 'ISC',
    copyleft: 1, patent: false, simplicity: 0, osiApproved: true,
    summary: '功能上等同于 MIT，但语言更简洁。ISC（Internet Systems Consortium）使用的许可。OpenBSD 等项目采用。',
    tags: ['宽松', '最简短', '商业友好'],
    url: 'https://opensource.org/licenses/ISC',
  },
  {
    id: 'gpl-2.0', name: 'GNU General Public License v2.0', spdxId: 'GPL-2.0-only',
    copyleft: 3, patent: false, simplicity: 2, osiApproved: true,
    summary: '强 Copyleft 许可证。任何分发包含 GPLv2 代码的软件必须以 GPLv2 开源。不含专利条款。Linux 内核使用。',
    tags: ['强Copyleft', '病毒式', '自由软件', 'Linux'],
    url: 'https://www.gnu.org/licenses/gpl-2.0.html',
  },
  {
    id: 'gpl-3.0', name: 'GNU General Public License v3.0', spdxId: 'GPL-3.0-only',
    copyleft: 3, patent: true, simplicity: 2, osiApproved: true,
    summary: 'GPLv2 的升级版。增加专利授权条款、反 Tivoization 条款，兼容 Apache 2.0。更强的国际法律适用性。',
    tags: ['强Copyleft', '专利保护', '反Tivoization', '自由软件'],
    url: 'https://www.gnu.org/licenses/gpl-3.0.html',
  },
  {
    id: 'agpl-3.0', name: 'GNU Affero General Public License v3.0', spdxId: 'AGPL-3.0-only',
    copyleft: 4, patent: true, simplicity: 2, osiApproved: true,
    summary: 'GPLv3 的加强版。当用户在网络上使用软件时（如 SaaS），也需提供源代码。防止云服务商"利用但不回馈"。MongoDB 使用。',
    tags: ['网络Copyleft', '专利保护', 'SaaS杀手', '自由软件'],
    url: 'https://www.gnu.org/licenses/agpl-3.0.html',
  },
  {
    id: 'lgpl-2.1', name: 'GNU Lesser General Public License v2.1', spdxId: 'LGPL-2.1-only',
    copyleft: 2, patent: false, simplicity: 2, osiApproved: true,
    summary: '弱 Copyleft。允许非自由软件通过链接方式使用 LGPL 库，但库本身的修改需开源。适合希望推广使用的库项目。',
    tags: ['弱Copyleft', '库友好', '链接例外'],
    url: 'https://www.gnu.org/licenses/lgpl-2.1.html',
  },
  {
    id: 'lgpl-3.0', name: 'GNU Lesser General Public License v3.0', spdxId: 'LGPL-3.0-only',
    copyleft: 2, patent: true, simplicity: 2, osiApproved: true,
    summary: 'LGPLv2.1 的升级版。增加专利授权条款，兼容 GPLv3。适合需要专利保护的库项目。',
    tags: ['弱Copyleft', '专利保护', '库友好', 'GPLv3兼容'],
    url: 'https://www.gnu.org/licenses/lgpl-3.0.html',
  },
  {
    id: 'mpl-2.0', name: 'Mozilla Public License 2.0', spdxId: 'MPL-2.0',
    copyleft: 2, patent: true, simplicity: 1, osiApproved: true,
    summary: '文件级 Copyleft。修改 MPL 许可的文件需开源修改部分，但可与闭源文件共存于同一项目中。专利保护。比 LGPL 更灵活。',
    tags: ['弱Copyleft', '文件级', '专利保护', '灵活'],
    url: 'https://www.mozilla.org/en-US/MPL/2.0/',
  },
  {
    id: 'unlicense', name: 'The Unlicense', spdxId: 'Unlicense',
    copyleft: 0, patent: false, simplicity: 0, osiApproved: true,
    summary: '完全放弃版权，将作品贡献到公共领域。无任何限制，不要求署名。适合希望代码被最大程度自由使用的开发者。',
    tags: ['公共领域', '无限制', '最自由'],
    url: 'https://unlicense.org/',
  },
  {
    id: 'cc0-1.0', name: 'Creative Commons Zero v1.0 Universal', spdxId: 'CC0-1.0',
    copyleft: 0, patent: false, simplicity: 1, osiApproved: false,
    summary: 'CC0 是 Creative Commons 发布的公共领域贡献声明。在法律允许范围内放弃所有版权及相关权利。比 Unlicense 更严谨的法律措辞。',
    tags: ['公共领域', '无限制', '法律严谨'],
    url: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },
  {
    id: 'eupl-1.2', name: 'European Union Public License 1.2', spdxId: 'EUPL-1.2',
    copyleft: 3, patent: true, simplicity: 1, osiApproved: true,
    summary: '欧盟官方许可证。强 Copyleft，但有兼容性列表可与 GPL/AGPL/LGPL/MPL 等兼容。多语言版本（22种欧盟官方语言），适合欧盟公共项目。',
    tags: ['强Copyleft', '欧盟', '多语言', '兼容性好'],
    url: 'https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12',
  },
]

// ── Questions ────────────────────────────────────────────────────────────────
interface QuestionOption {
  value: string
  label: string
  description: string
}

interface Question {
  id: string
  text: string
  options: QuestionOption[]
}

const QUESTIONS: Question[] = [
  {
    id: 'projectType',
    text: '项目的主要用途是什么？',
    options: [
      {value: 'personal', label: '个人学习/娱乐项目', description: 'Side project、学习练习、个人工具等'},
      {value: 'commercial', label: '商业闭源产品', description: '计划闭源销售的商业软件产品'},
      {value: 'library', label: '开源库/SDK/框架', description: '供其他开发者使用的库或框架'},
      {value: 'saas', label: '企业 SaaS / 云服务', description: '基于云端的软件即服务产品'},
      {value: 'cli', label: '命令行/桌面工具', description: 'CLI 工具、桌面应用等'},
    ],
  },
  {
    id: 'copyleft',
    text: '你希望下游使用者遵守什么规则？',
    options: [
      {value: 'none', label: '无限制，闭源商用均可', description: '使用者可自由使用，无需公开源码（MIT 风格）'},
      {value: 'attribution', label: '仅保留版权声明即可', description: '只需保留原作者版权信息，其余自由使用'},
      {value: 'weak', label: '对文件的修改需开源', description: '修改本软件的文件需公开，但可与闭源代码共存（MPL 风格）'},
      {value: 'strong', label: '衍生作品需同协议开源', description: '基于本软件的作品必须以相同协议开源（GPL 风格）'},
      {value: 'network', label: '网络提供服务也需开源', description: '即使只在服务器上运行，也要公开源码（AGPL 风格）'},
    ],
  },
  {
    id: 'patent',
    text: '你对专利保护的需求？',
    options: [
      {value: 'yes', label: '需要明确的专利授权条款', description: '许可证中应包含明示的专利授权，降低专利诉讼风险'},
      {value: 'no', label: '不太关心专利条款', description: '专利相关的内容对我来说不重要'},
    ],
  },
  {
    id: 'simplicity',
    text: '你偏好哪种许可证风格？',
    options: [
      {value: 'short', label: '简短精炼', description: '几十行以内，一目了然，MIT/ISC/BSD 风格'},
      {value: 'medium', label: '适中即可', description: '关键条款覆盖到位，不需要太啰嗦（Apache/MPL 风格）'},
      {value: 'full', label: '完整严谨', description: '全面的法律措辞，覆盖各种边界情况（GPL 风格）'},
    ],
  },
]

// ── State ────────────────────────────────────────────────────────────────────
const answers = ref<Record<string, string>>({
  projectType: 'personal',
  copyleft: 'none',
  patent: 'no',
  simplicity: 'short',
})

const expandedLicense = ref<string | null>(null)
const copiedId = ref<string | null>(null)

// ── Scoring Engine ───────────────────────────────────────────────────────────
interface ScoredLicense {
  license: LicenseProfile
  score: number
  highlights: string[]
}

function computeScores(): ScoredLicense[] {
  const a = answers.value

  const desiredCopyleftMax = {
    personal: 4, commercial: 1, library: 2, saas: 1, cli: 3,
  }[a.projectType] ?? 4

  const copyleftTarget = {
    none: 0, attribution: 1, weak: 2, strong: 3, network: 4,
  }[a.copyleft] ?? 0

  const needPatent = a.patent === 'yes'
  const simplicityTarget = {
    short: 0, medium: 1, full: 2,
  }[a.simplicity] ?? 0

  const results: ScoredLicense[] = LICENSES.map((license) => {
    let score = 100

    const copyleftDiff = Math.abs(license.copyleft - copyleftTarget)
    score -= copyleftDiff * 12

    if (license.copyleft > desiredCopyleftMax) {
      score -= (license.copyleft - desiredCopyleftMax) * 18
    }

    if (needPatent && !license.patent) {
      score -= 15
    }
    if (!needPatent && license.patent) {
      score += 3
    }

    const simplicityDiff = Math.abs(license.simplicity - simplicityTarget)
    score -= simplicityDiff * 8

    if (a.projectType === 'commercial' || a.projectType === 'saas') {
      if (license.copyleft <= 1) score += 5
      if (license.patent) score += 3
    }
    if (a.projectType === 'library') {
      if (license.copyleft >= 1 && license.copyleft <= 2) score += 5
      if (license.copyleft === 0) score -= 3
    }
    if (a.projectType === 'saas' && license.copyleft >= 4) {
      score -= 25
    }

    const highlights: string[] = []
    if (license.copyleft === copyleftTarget) highlights.push('Copyleft 级别完全匹配')
    else if (copyleftDiff <= 1) highlights.push('Copyleft 级别接近')
    if (needPatent && license.patent) highlights.push('提供专利保护')
    if (simplicityDiff === 0) highlights.push('许可文本风格匹配')
    if (license.osiApproved) highlights.push('OSI 认证')

    return {license, score: Math.max(0, Math.round(score)), highlights}
  })

  results.sort((a, b) => b.score - a.score)
  return results
}

const scoredLicenses = computed(() => computeScores())

// ── Actions ──────────────────────────────────────────────────────────────────
function toggleExpand(id: string) {
  expandedLicense.value = expandedLicense.value === id ? null : id
}

async function copyLicense(license: LicenseProfile) {
  try {
    await navigator.clipboard.writeText(getLicenseText(license.id))
    copiedId.value = license.id
    setTimeout(() => {
      copiedId.value = null
    }, 2000)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = getLicenseText(license.id)
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copiedId.value = license.id
    setTimeout(() => {
      copiedId.value = null
    }, 2000)
  }
}

function downloadLicense(license: LicenseProfile) {
  const text = getLicenseText(license.id)
  const blob = new Blob([text], {type: 'text/plain;charset=utf-8'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${license.spdxId.replace(/[^a-zA-Z0-9.-]/g, '_')}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const copyleftLabels: Record<number, string> = {
  0: '完全自由', 1: '保留署名', 2: '弱 Copyleft (文件级)', 3: '强 Copyleft (项目级)', 4: '网络 Copyleft (AGPL)',
}
const simplicityLabels: Record<number, string> = {0: '简短', 1: '适中', 2: '完整'}

function scoreColor(score: number): string {
  if (score >= 90) return 'bg-green-500'
  if (score >= 75) return 'bg-emerald-400'
  if (score >= 60) return 'bg-yellow-400'
  if (score >= 40) return 'bg-orange-400'
  return 'bg-red-400'
}

function scoreLabel(score: number): string {
  if (score >= 90) return '强烈推荐'
  if (score >= 75) return '推荐'
  if (score >= 60) return '可以考虑'
  if (score >= 40) return '不太匹配'
  return '不推荐'
}
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-6">
    <!-- Left: Questionnaire -->
    <div class="lg:w-96 shrink-0 space-y-5">
      <div
          v-for="q in QUESTIONS"
          :key="q.id"
          class="bg-gray-50 rounded-xl p-4 border border-gray-100"
      >
        <h3 class="text-sm font-semibold text-gray-800 mb-3">{{ q.text }}</h3>
        <div class="space-y-1.5">
          <label
              v-for="opt in q.options"
              :key="opt.value"
              :class="answers[q.id] === opt.value ? 'bg-white border-blue-300 shadow-sm' : ''"
              class="flex items-start gap-2.5 p-2.5 rounded-lg cursor-pointer transition hover:bg-white border border-transparent"
          >
            <input
                v-model="answers[q.id]"
                :name="q.id"
                :value="opt.value"
                class="mt-0.5 shrink-0"
                type="radio"
            />
            <div>
              <div class="text-sm font-medium text-gray-700">{{ opt.label }}</div>
              <div class="text-xs text-gray-400 mt-0.5">{{ opt.description }}</div>
            </div>
          </label>
        </div>
      </div>
    </div>

    <!-- Right: Results -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-gray-800">
          推荐结果
          <span class="text-sm font-normal text-gray-400 ml-2">按适配度排序</span>
        </h2>
        <span class="text-xs text-gray-400">{{ LICENSES.length }} 个许可证</span>
      </div>

      <div class="space-y-3">
        <div
            v-for="item in scoredLicenses"
            :key="item.license.id"
            :class="expandedLicense === item.license.id ? 'border-blue-300 shadow-md' : 'border-gray-200 hover:border-gray-300'"
            class="bg-white rounded-xl border transition"
        >
          <div class="p-4">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap mb-1">
                  <span class="text-base font-bold text-gray-900">{{ item.license.name }}</span>
                  <code class="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">{{
                      item.license.spdxId
                    }}</code>
                  <span
                      :class="{
                      'bg-green-100 text-green-700': item.score >= 90,
                      'bg-emerald-50 text-emerald-600': item.score >= 75 && item.score < 90,
                      'bg-yellow-50 text-yellow-600': item.score >= 60 && item.score < 75,
                      'bg-orange-50 text-orange-600': item.score >= 40 && item.score < 60,
                      'bg-red-50 text-red-500': item.score < 40,
                    }"
                      class="text-xs font-medium px-1.5 py-0.5 rounded"
                  >{{ scoreLabel(item.score) }}</span>
                </div>

                <p class="text-sm text-gray-500 mb-2">{{ item.license.summary }}</p>

                <div class="flex flex-wrap gap-1 mb-2">
                  <span
                      v-for="tag in item.license.tags"
                      :key="tag"
                      class="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded"
                  >{{ tag }}</span>
                </div>

                <div v-if="item.highlights.length" class="flex flex-wrap gap-1 mb-2">
                  <span
                      v-for="h in item.highlights"
                      :key="h"
                      class="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded"
                  >✓ {{ h }}</span>
                </div>

                <div class="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  <span>Copyleft: {{ copyleftLabels[item.license.copyleft] }}</span>
                  <span>复杂度: {{ simplicityLabels[item.license.simplicity] }}</span>
                  <span v-if="item.license.patent" class="text-green-500 font-medium">含专利条款</span>
                  <span v-if="item.license.osiApproved" class="text-blue-400">OSI 认证</span>
                  <a :href="item.license.url" class="text-blue-400 hover:text-blue-600 underline"
                     target="_blank">SPDX</a>
                </div>
              </div>

              <div class="shrink-0 flex flex-col items-center gap-1">
                <div :class="{
                  'text-green-500': item.score >= 90,
                  'text-emerald-500': item.score >= 75 && item.score < 90,
                  'text-yellow-500': item.score >= 60 && item.score < 75,
                  'text-orange-500': item.score >= 40 && item.score < 60,
                  'text-red-500': item.score < 40,
                }" class="text-2xl font-bold">{{ item.score }}
                </div>
                <div class="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                      :class="scoreColor(item.score)"
                      :style="{ width: item.score + '%' }"
                      class="h-full rounded-full transition-all duration-500"
                  />
                </div>
                <span class="text-[10px] text-gray-400">适配度</span>
              </div>
            </div>

            <div class="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              <button
                  :class="expandedLicense === item.license.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                  class="px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer flex items-center gap-1"
                  @click="toggleExpand(item.license.id)"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="2"/>
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="2"/>
                </svg>
                {{ expandedLicense === item.license.id ? '收起全文' : '查看全文' }}
              </button>
              <button
                  :class="copiedId === item.license.id
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                  class="px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer flex items-center gap-1"
                  @click="copyLicense(item.license)"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="2"/>
                </svg>
                {{ copiedId === item.license.id ? '已复制 ✓' : '复制全文' }}
              </button>
              <button
                  class="px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer flex items-center gap-1 bg-gray-100 text-gray-600 hover:bg-gray-200"
                  @click="downloadLicense(item.license)"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="2"/>
                </svg>
                下载 .txt
              </button>
            </div>
          </div>

          <!-- Expanded: Full License Text -->
          <div
              v-if="expandedLicense === item.license.id"
              class="border-t border-gray-100 p-4 bg-gray-50 rounded-b-xl"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-medium text-gray-500">{{ item.license.name }} — 完整协议文本</span>
              <span class="text-[10px] text-gray-400">{{
                  getLicenseText(item.license.id).length.toLocaleString()
                }} 字符</span>
            </div>
            <pre
                class="text-xs font-mono text-gray-700 whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-lg p-4 leading-relaxed">{{
                getLicenseText(item.license.id)
              }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
