<template>
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
		<h3 class="mb-3 text-sm font-semibold text-blue-800">关于「车辆信息生成」</h3>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			本工具生成仿真车辆档案：整车名称、品牌、型号、类型、燃料、VIN 码、车牌号与车身颜色。中文区域会产出「雪铁龙
			Ranchero」「电动」等 混合本地化数据，切换英文区域则为欧美常见格式。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			VIN（车辆识别码）为 17 位标准格式，包含厂商识别码、车辆说明部分与校验位；车牌号（VRM）由字母与数字按区域规则组合。
			车身颜色取自 Faker 颜色词库，如「淡紫色」「Inchworm」等。
		</p>
		<p class="text-sm leading-relaxed text-slate-600">
			<span class="font-medium text-blue-800">典型场景</span>：汽车销售
			Demo、租车平台测试、保险系统样例数据，以及需要整车信息展示的 管理后台界面。
		</p>
	</div>
</template>
