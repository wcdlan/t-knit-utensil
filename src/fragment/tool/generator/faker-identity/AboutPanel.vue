<template>
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
</template>
