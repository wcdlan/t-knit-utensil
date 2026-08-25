<template>
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
		<h3 class="mb-3 text-sm font-semibold text-blue-800">关于「金融信息生成」</h3>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			本工具生成仿真金融数据：账户户名、账号、金额、信用卡号、发卡机构、CVV、IBAN 与 BIC
			码，以及交易描述。金额符号会随语言区域在 ¥ 与 $ 间切换。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			卡号遵循 Luhn 校验算法生成，可被常见的格式校验器识别；IBAN 按所选区域的格式规则生成（如德国 DE、法国 FR
			前缀），BIC 码为 8 或 11 位 SWIFT 格式，适合联调银行类接口的字段格式。
		</p>
		<p class="text-sm leading-relaxed text-slate-600">
			<span class="font-medium text-blue-800">重要提醒</span
			>：以上均为随机生成的虚构数据，不关联任何真实账户或卡片，仅用于开发测试与
			演示。切勿将其用于支付、实名认证或任何真实金融业务。
		</p>
	</div>
</template>
