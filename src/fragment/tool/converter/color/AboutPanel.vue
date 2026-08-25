<template>
	<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
		<h3 class="text-sm font-semibold text-blue-800 mb-3">关于颜色模型</h3>
		<p class="text-sm text-slate-600 leading-relaxed mb-2">
			<span class="font-medium text-blue-800">HEX</span>（十六进制颜色）是 Web 开发中最常用的颜色表示法，以
			<code class="font-mono text-xs text-blue-800">#RRGGBB</code>
			格式书写，每两位十六进制数分别代表红、绿、蓝通道的亮度（00～FF，即 0～255）。
		</p>
		<p class="text-sm text-slate-600 leading-relaxed mb-2">
			<span class="font-medium text-blue-800">RGB</span>（红绿蓝）与 HEX
			本质相同——都是面向显示设备的加色模型。三个数值分别表示红、绿、蓝通道的强度，数值越大颜色越亮； 三通道全为 0
			时为黑色，全为 255 时为白色。
		</p>
		<p class="text-sm text-slate-600 leading-relaxed">
			<span class="font-medium text-blue-800">HSL</span>（色相、饱和度、明度）更贴近人类对颜色的认知：
			色相（H）在色环上以角度（0°～360°）定义色调；饱和度（S）控制色彩的鲜艳程度（0% 为灰色，100% 为纯色）；
			明度（L）控制色彩的明暗（0% 为黑色，100% 为白色）。HSL 在需要微调颜色倾向时比 RGB 更直观。
		</p>
	</div>
</template>
