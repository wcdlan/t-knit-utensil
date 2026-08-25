<template>
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
		<h3 class="mb-3 text-sm font-semibold text-blue-800">关于 VirtIO 驱动</h3>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			VirtIO 是 KVM/QEMU 虚拟化环境的半虚拟化（paravirtualized）驱动标准，为 Windows
			虚拟机提供高性能的磁盘、网络、显卡等设备驱动。 安装 VirtIO 驱动后，Windows 虚拟机可以显著提升 I/O
			性能，避免使用模拟设备带来的性能瓶颈。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			本工具允许您从 Fedora 的官方归档仓库浏览和下载 VirtIO 驱动。数据来源为
			<a
				class="font-medium text-blue-800 underline"
				href="https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/archive-virtio/"
				rel="noopener noreferrer"
				target="_blank"
			>
				Fedora People </a
			>，涵盖了从 0.1.96 到 0.1.285 的多个历史版本归档。
		</p>
		<p class="mb-1 text-sm font-medium text-blue-800">常见文件说明</p>
		<ul class="space-y-1 text-sm leading-relaxed text-slate-600">
			<li>
				<span class="font-medium text-slate-700">virtio-win-*.iso</span> — 完整 ISO 镜像，包含所有 VirtIO 驱动。 在
				Windows 安装过程中可通过虚拟光驱挂载，加载驱动后即可识别 VirtIO 磁盘/网卡。
			</li>
			<li>
				<span class="font-medium text-slate-700">virtio-win-gt-x64/x86.msi</span> — Guest Tools MSI 安装包，安装后提供
				balloon、vioserial、pvpanic 等附加驱动。
			</li>
			<li>
				<span class="font-medium text-slate-700">virtio-win-guest-tools.exe</span> — 一体化的 Guest Tools 安装程序，含
				MSI 安装包。
			</li>
			<li>
				<span class="font-medium text-slate-700">*.noarch.rpm / *.src.rpm</span> — Linux 发行版 RPM
				包，适用于在宿主机上安装驱动工具。
			</li>
		</ul>
		<p class="mt-3 text-sm leading-relaxed text-slate-600">
			<span class="font-medium text-blue-800">使用提示</span>：下载后请校验 CHECKSUM
			文件以确保完整性（同一版本目录下包含 CHECKSUM 文件）。 所有文件托管在 Fedora
			官方服务器，下载链接为直链，本工具仅做目录浏览与转发。
		</p>
	</div>
</template>
