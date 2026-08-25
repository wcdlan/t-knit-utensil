<template>
	<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
		<h3 class="text-sm font-semibold text-blue-800 mb-3">什么是二维码？</h3>
		<p class="text-sm text-slate-600 leading-relaxed mb-2">
			二维码（Quick Response Code）是日本电装于 1994 年发明的矩阵式二维条码，用黑白方块排列记录数据。
			相比传统一维条码，二维码可存储更多信息（字母数字模式下最多 4296 个字符），且支持纠错——即使部分污损也能被正常识别。
		</p>
		<p class="text-sm text-slate-600 leading-relaxed mb-2">
			每个二维码的角落有三个定位图案（回形方块），帮助扫码设备快速定位方向； 内部的数据区域通过 RS-Reed Solomon
			纠错码保证可靠性，共分为 L、M、Q、H 四个纠错等级（分别可恢复约 7%、15%、25%、30% 的数据）。
		</p>
		<p class="text-sm text-slate-600 leading-relaxed mb-2">
			常见应用场景：网址分享、Wi-Fi
			配置、名片交换（vCard）、支付凭证、活动票务等。手机自带相机即可扫描，无需额外安装应用。
		</p>
		<p class="text-sm text-slate-600 leading-relaxed">
			本工具通过调用外部 API（<code class="font-mono text-xs text-blue-800">qrserver.com</code>）生成二维码图片，
			输入的文本/网址将被发送至该服务处理。请勿将敏感信息（如密码、私钥）写入二维码内容。
		</p>
	</div>
</template>
