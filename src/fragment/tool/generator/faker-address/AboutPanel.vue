<template>
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
		<h3 class="mb-3 text-sm font-semibold text-blue-800">关于「地址信息生成」</h3>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			本工具按所选语言区域生成完整的地址数据，覆盖国家、省份/州、城市、街道、邮编、经纬度与时区。
			中文区域会产出「海南省海汉市石巷968号」这类符合国内表达习惯的地址，切换为英文（美国）则生成「New
			York」风格的美式地址。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			经纬度基于地理坐标随机分布（纬度 -90° ~ 90°，经度 -180° ~ 180°），精度保留 4 位小数，可用于在地图上标记模拟点位；
			时区取自 IANA 时区数据库（如 Asia/Shanghai、America/New_York），方便与真实时间系统对接。
		</p>
		<p class="text-sm leading-relaxed text-slate-600">
			<span class="font-medium text-blue-800">典型场景</span
			>：为电商下单页、物流配送演示、地图可视化、国际化表单测试提供贴近真实格式的假地址，避免使用「Test Street
			1」这类一眼假的占位数据。
		</p>
	</div>
</template>
