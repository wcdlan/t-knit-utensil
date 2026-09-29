// 网络解析工具静态数据（公共 DNS 服务器预设 + 子工具页签元数据）

import { icons } from '@/data/icons';
import type { DnsServerPreset, DnsToolMeta } from '@/types/dns';

/**
 * DNS 服务器预设：system 表示使用部署服务器自身的 DNS 配置，
 * custom 表示手动输入地址（支持 IP:端口，可用于自建 DNS）。
 */
export const DNS_SERVER_PRESETS: DnsServerPreset[] = [
	{
		key: 'system',
		label: '系统默认 DNS',
		address: '',
		description:
			'使用部署服务器本机配置的 DNS（Linux 为 /etc/resolv.conf，Windows 为网卡设置），等同于 nslookup 不带服务器参数。'
	},
	{
		key: 'aliyun',
		label: '阿里公共 DNS（223.5.5.5）',
		address: '223.5.5.5',
		description: '阿里云公共 DNS，国内解析速度快，支持 EDNS Client Subnet，CDN 就近调度较准确。'
	},
	{
		key: 'dnspod',
		label: '腾讯 DNSPod（119.29.29.29）',
		address: '119.29.29.29',
		description: '腾讯 DNSPod 公共 DNS，国内节点多、抖动小，同时提供 DoH / DoT 接入。'
	},
	{
		key: 'dns114',
		label: '114DNS（114.114.114.114）',
		address: '114.114.114.114',
		description: '国内老牌公共 DNS，覆盖广、延迟低，另有 114.114.115.115 作为备用地址。'
	},
	{
		key: 'baidu',
		label: '百度公共 DNS（180.76.76.76）',
		address: '180.76.76.76',
		description: '百度公共 DNS，国内访问稳定，具备一定的恶意域名拦截能力。'
	},
	{
		key: 'google',
		label: 'Google DNS（8.8.8.8）',
		address: '8.8.8.8',
		description: 'Google Public DNS，全球 Anycast 节点，海外域名解析准确；国内访问可能不稳定。'
	},
	{
		key: 'cloudflare',
		label: 'Cloudflare DNS（1.1.1.1）',
		address: '1.1.1.1',
		description: 'Cloudflare 公共 DNS，强调查询速度与隐私（不记录客户端 IP），海外解析常用。'
	},
	{
		key: 'quad9',
		label: 'Quad9（9.9.9.9）',
		address: '9.9.9.9',
		description: 'IBM 等联合运营的公共 DNS，内置恶意域名黑名单，命中威胁情报的域名会直接拦截。'
	},
	{
		key: 'opendns',
		label: 'OpenDNS（208.67.222.222）',
		address: '208.67.222.222',
		description: 'Cisco OpenDNS，支持内容过滤与家长控制策略，家庭与企业场景常用。'
	},
	{
		key: 'custom',
		label: '自定义 DNS 服务器',
		address: '',
		description: '手动输入 DNS 服务器地址，支持 IP:端口 形式，例如内网 DNS 10.0.0.53 或自建 DNS 127.0.0.1:5353。'
	}
];

/** 子工具页签（顺序即界面展示顺序） */
export const DNS_TOOL_METAS: DnsToolMeta[] = [
	{
		key: 'A',
		label: 'A 解析',
		icon: icons.ipv4,
		inputLabel: '域名',
		placeholder: '例如 example.com 或 www.baidu.com',
		hint: 'A 记录把域名指向一个 IPv4 地址，是网站访问最基础的记录类型。',
		examples: ['example.com', 'www.baidu.com', 'github.com']
	},
	{
		key: 'CNAME',
		label: 'CNAME 解析',
		icon: icons.cname,
		inputLabel: '域名（通常是主机记录，如 www）',
		placeholder: '例如 www.github.com 或 mail.qq.com',
		hint: 'CNAME 记录为域名设置别名，解析时会继续追踪别名指向的最终 A 记录。',
		examples: ['www.github.com', 'mail.qq.com', 'docs.qq.com']
	},
	{
		key: 'MX',
		label: 'MX 解析',
		icon: icons.mx,
		inputLabel: '域名（邮件域）',
		placeholder: '例如 gmail.com 或 qq.com',
		hint: 'MX 记录指定接收邮件的服务器，优先级数值越小越优先，配置邮件服务时必查。',
		examples: ['qq.com', '163.com', 'gmail.com']
	},
	{
		key: 'NS',
		label: 'NS 解析',
		icon: icons.serverNetwork,
		inputLabel: '域名（可含子域）',
		placeholder: '例如 example.com 或 cloudflare.com',
		hint: 'NS 记录声明该域名由哪些权威 DNS 服务器负责解析，常用于确认域名托管商。',
		examples: ['example.com', 'cloudflare.com', 'aliyun.com']
	},
	{
		key: 'TXT',
		label: 'TXT 解析',
		icon: icons.txt,
		inputLabel: '域名',
		placeholder: '例如 example.com 或 _dmarc.qq.com',
		hint: 'TXT 记录存放文本信息，常见用途是 SPF 反垃圾邮件、DKIM 签名、域名所有权验证。',
		examples: ['example.com', 'google.com', 'qq.com']
	},
	{
		key: 'PTR',
		label: 'PTR 反向解析',
		icon: icons.ptr,
		inputLabel: 'IP 地址（IPv4 / IPv6）',
		placeholder: '例如 8.8.8.8 或 2001:4860:4860::8888',
		hint: 'PTR 记录把 IP 反向解析为域名（rDNS），邮件服务器与日志溯源常依赖它。',
		examples: ['8.8.8.8', '1.1.1.1', '114.114.114.114']
	},
	{
		key: 'PING',
		label: 'PING 检测',
		icon: icons.ping,
		inputLabel: '主机名或 IP',
		placeholder: '例如 example.com 或 223.5.5.5',
		hint: 'ICMP 方式调用服务器上的 ping 命令；TCP 方式对指定端口发起连接，容器环境同样可用。',
		examples: ['223.5.5.5', 'example.com', '1.1.1.1']
	}
];
