<script lang="ts" setup>
	import { computed, ref, watch } from 'vue';
	import { copyToClipboard } from '@/utils/clipboard';
	import {
		decodeJwt,
		describeClaims,
		generateJwtSecret,
		getTimeStatus,
		JWT_ALGORITHM_OPTIONS,
		JWT_DEFAULT_HEADER,
		JWT_DEFAULT_PAYLOAD,
		JWT_EXAMPLE_SECRET,
		JWT_EXAMPLE_TOKEN,
		signJwt,
		verifyJwt
	} from '@/utils/jwt';
	import type { JwtAlgorithm, JwtHeader, JwtMode, JwtPayload, JwtVerifyResult } from '@/types/jwt';
	import AboutPanel from '@/fragment/tool/codec/jwt/AboutPanel.vue';
	import ModeSelect from '@/fragment/tool/codec/jwt/ModeSelect.vue';
	import TokenInput from '@/fragment/tool/codec/jwt/TokenInput.vue';
	import DecodeResult from '@/fragment/tool/codec/jwt/DecodeResult.vue';
	import ClaimTable from '@/fragment/tool/codec/jwt/ClaimTable.vue';
	import VerifyPanel from '@/fragment/tool/codec/jwt/VerifyPanel.vue';
	import EncodePanel from '@/fragment/tool/codec/jwt/EncodePanel.vue';
	import OutputPanel from '@/fragment/tool/codec/jwt/OutputPanel.vue';

	const mode = ref<JwtMode>('decode');

	// ---- 解析模式状态 ----
	const tokenInput = ref('');
	/** 解析结果（输入变化时自动重算） */
	const decodeState = computed(() => decodeJwt(tokenInput.value));
	/** 声明解读条目 */
	const claims = computed(() => (decodeState.value.decoded ? describeClaims(decodeState.value.decoded.payload) : []));
	/** token 时间有效性 */
	const timeStatus = computed(() =>
		decodeState.value.decoded
			? getTimeStatus(decodeState.value.decoded.payload)
			: { expired: false, notYetValid: false }
	);

	// ---- 验签状态 ----
	const verifySecret = ref('');
	const verifyResult = ref<JwtVerifyResult | null>(null);
	const verifying = ref(false);

	// token 或密钥变化后，旧的校验结论不再可靠，重置结果
	watch([tokenInput, verifySecret], () => {
		verifyResult.value = null;
	});

	async function doVerify() {
		const decoded = decodeState.value.decoded;
		if (!decoded) return;
		verifying.value = true;
		try {
			verifyResult.value = await verifyJwt(decoded, verifySecret.value);
		} finally {
			verifying.value = false;
		}
	}

	// ---- 生成模式状态 ----
	const algorithm = ref<JwtAlgorithm>('HS256');
	const headerJson = ref(JWT_DEFAULT_HEADER);
	const payloadJson = ref(JWT_DEFAULT_PAYLOAD);
	const encodeSecret = ref('');
	const generatedToken = ref('');
	const encodeError = ref('');
	const generating = ref(false);

	// 算法变更时同步更新 Header 中的 alg 字段
	watch(algorithm, (alg) => {
		try {
			const header = JSON.parse(headerJson.value);
			header.alg = alg;
			headerJson.value = JSON.stringify(header, null, 2);
		} catch {
			// Header 当前不是合法 JSON，保持用户输入不变
		}
	});

	async function generate() {
		encodeError.value = '';
		generatedToken.value = '';
		if (!encodeSecret.value) {
			encodeError.value = '请先填写 HMAC 密钥（Secret）';
			return;
		}

		let header: JwtHeader;
		let payload: JwtPayload;
		try {
			const parsed: unknown = JSON.parse(headerJson.value);
			if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
				throw new Error('Header 必须是 JSON 对象');
			}
			// 以用户输入为基础，签名算法统一采用当前下拉选择的值
			header = { ...(parsed as JwtHeader), alg: algorithm.value };
		} catch (e) {
			encodeError.value = 'Header JSON 格式错误：' + (e as Error).message;
			return;
		}
		try {
			const parsed: unknown = JSON.parse(payloadJson.value);
			if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
				throw new Error('Payload 必须是 JSON 对象');
			}
			payload = parsed as JwtPayload;
		} catch (e) {
			encodeError.value = 'Payload JSON 格式错误：' + (e as Error).message;
			return;
		}

		generating.value = true;
		try {
			generatedToken.value = await signJwt(header, payload, encodeSecret.value);
		} catch (e) {
			encodeError.value = (e as Error).message;
		} finally {
			generating.value = false;
		}
	}

	function fillEncodeExample() {
		encodeError.value = '';
		headerJson.value = JWT_DEFAULT_HEADER;
		payloadJson.value = JWT_DEFAULT_PAYLOAD;
		algorithm.value = 'HS256';
	}

	function randomSecret() {
		encodeSecret.value = generateJwtSecret();
	}

	// ---- 通用交互 ----
	function copy(text: string) {
		if (!text) return;
		copyToClipboard(text);
	}

	function loadExampleToken() {
		tokenInput.value = JWT_EXAMPLE_TOKEN;
		verifySecret.value = JWT_EXAMPLE_SECRET;
	}

	function clearToken() {
		tokenInput.value = '';
		verifySecret.value = '';
	}

	// 初始化即载入官方示例，页面打开即可看到完整解析结果
	loadExampleToken();
</script>

<template>
	<div class="space-y-6">
		<!-- AboutPanel：JWT 结构说明与安全提示 -->
		<AboutPanel />
		<!-- ModeSelect：解析 Token / 生成 Token 模式切换 -->
		<ModeSelect :mode="mode" @update:mode="(v) => (mode = v)" />

		<!-- ===== 解析模式 ===== -->
		<template v-if="mode === 'decode'">
			<!-- TokenInput：JWT 输入框（支持 Bearer 前缀，载入示例 / 清空） -->
			<TokenInput v-model:model-value="tokenInput" @clear="clearToken" @example="loadExampleToken" />

			<!-- 解析错误提示 -->
			<div v-if="decodeState.error" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
				{{ decodeState.error }}
			</div>

			<!-- DecodeResult：Header / Payload / Signature 三段解码结果展示 -->
			<DecodeResult v-if="decodeState.decoded" :decoded="decodeState.decoded" @copy="copy" />

			<!-- ClaimTable：标准声明解读与时间换算（过期 / 生效状态标注） -->
			<ClaimTable v-if="decodeState.decoded" :claims="claims" :time-status="timeStatus" @copy="copy" />

			<!-- VerifyPanel：HMAC 密钥输入与签名校验（本地 Web Crypto 完成） -->
			<VerifyPanel
				v-if="decodeState.decoded"
				v-model:secret="verifySecret"
				:result="verifyResult"
				:verifying="verifying"
				@verify="doVerify"
			/>
		</template>

		<!-- ===== 生成模式 ===== -->
		<template v-else>
			<!-- EncodePanel：签名算法 / 密钥配置与 Header、Payload JSON 编辑 -->
			<EncodePanel
				v-model:algorithm="algorithm"
				v-model:header-json="headerJson"
				v-model:payload-json="payloadJson"
				v-model:secret="encodeSecret"
				:algorithm-options="JWT_ALGORITHM_OPTIONS"
				@generate="generate"
				@fill-example="fillEncodeExample"
				@generate-secret="randomSecret"
			/>
			<!-- OutputPanel：生成结果输出区（只读 + 复制 / 清空，含错误提示） -->
			<OutputPanel
				:error="encodeError"
				:generating="generating"
				:output="generatedToken"
				@clear="generatedToken = ''"
				@copy="copy(generatedToken)"
			/>
		</template>
	</div>
</template>
