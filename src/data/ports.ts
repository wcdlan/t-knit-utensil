// 端口工具静态数据（端口区间预设 / 常用服务默认端口注册表）
// 端口号参考 IANA 服务名与端口号注册表及各服务官方默认配置，仅列常用默认值，实际部署可能被改端口

import type { CommonPortEntry, CommonPortGroup, PortRangePreset } from '@/types/port';

/** 常用端口区间预设（IANA 三段式划分 + 全部端口 + 自定义） */
export const PORT_RANGE_PRESETS: PortRangePreset[] = [
	{
		key: 'dynamic',
		label: '动态端口 49152-65535',
		min: 49152,
		max: 65535,
		description: 'IANA 划分的动态 / 私有端口，操作系统临时端口也取自此处，最适合作为随机端口使用。'
	},
	{
		key: 'registered',
		label: '注册端口 1024-49151',
		min: 1024,
		max: 49151,
		description: '需向 IANA 注册的端口区间，包含大量知名服务端口，随机生成时建议勾选「排除常用服务端口」。'
	},
	{
		key: 'all',
		label: '全部端口 1-65535',
		min: 1,
		max: 65535,
		description: '覆盖全部可用端口，包含 1-1023 的系统端口；监听系统端口需要 root / 管理员权限。'
	},
	{
		key: 'system',
		label: '系统端口 1-1023',
		min: 1,
		max: 1023,
		description: '知名端口区间，仅 root（Linux）或管理员（Windows）可监听，普通进程无法直接使用。'
	},
	{
		key: 'custom',
		label: '自定义范围',
		min: 1024,
		max: 65535,
		description: '自行指定起始与结束端口；范围越窄、生成数量越多，越容易耗尽候选端口。'
	}
];

/** 常用服务默认端口分组（速查表数据源，默认折叠展示） */
export const COMMON_PORT_GROUPS: CommonPortGroup[] = [
	{
		key: 'web',
		label: 'Web 与反向代理',
		description: '网站访问入口与 HTTP 服务、网关控制台',
		entries: [
			{
				service: 'HTTP',
				name: '万维网明文服务',
				port: 80,
				protocol: 'TCP',
				hot: true,
				description:
					'超文本传输协议端口，浏览器访问 http:// 站点时默认连接该端口，也是绝大多数 Web 服务器的默认监听端口。',
				note: '明文传输，生产环境建议 301 跳转到 HTTPS。'
			},
			{
				service: 'HTTPS',
				name: '万维网加密服务',
				port: 443,
				protocol: 'TCP',
				hot: true,
				description: 'HTTP over TLS 加密端口，现代网站的标准入口，浏览器访问 https:// 站点时默认使用。',
				note: '需配置有效证书，建议开启 HSTS 并禁用 TLS 1.0/1.1。'
			},
			{
				service: 'HTTP Alt',
				name: 'HTTP 备用端口',
				port: 8080,
				protocol: 'TCP',
				hot: true,
				description: '非特权用户即可监听的 HTTP 备用端口，Tomcat、各类开发服务器与反向代理网关常把它作为默认入口。',
				note: '没有 root / 管理员权限时，常用 8080 与 8443 替代 80 与 443。'
			},
			{
				service: 'HTTPS Alt',
				name: 'HTTPS 备用端口',
				port: 8443,
				protocol: 'TCP',
				description: '与 8080 对应的加密端口，常见于 Tomcat 与网关的 HTTPS 监听，也是不少云平台控制台的默认端口。'
			},
			{
				service: 'Nginx / Caddy / Django',
				name: '备用 HTTP 端口',
				port: 8000,
				protocol: 'TCP',
				description: 'Nginx、Caddy、Django 开发服务器等常以 8000 作为默认或备用 HTTP 监听端口，避免与 80 端口冲突。'
			},
			{
				service: 'Nginx Proxy Manager',
				name: 'NPM 管理后台',
				port: 81,
				protocol: 'TCP',
				description: 'Nginx Proxy Manager 的 Web 管理界面默认端口，与它代理的 80 / 443 业务端口分离。',
				note: '管理后台务必修改默认账号并限制访问来源。'
			},
			{
				service: 'Traefik Dashboard',
				name: 'Traefik 控制面板',
				port: 8080,
				protocol: 'TCP',
				description: 'Traefik 的 Dashboard 与 API 默认监听端口，用于查看路由、中间件与服务状态。',
				note: '控制面板应加认证或限制来源 IP，避免泄露内部拓扑。'
			},
			{
				service: 'Caddy Admin API',
				name: 'Caddy 管理接口',
				port: 2019,
				protocol: 'TCP',
				description: 'Caddy 的本地管理 API，用于动态加载配置、查询证书与运行时状态。',
				note: '默认只监听 127.0.0.1，不要暴露到公网。'
			},
			{
				service: 'LiteSpeed WebAdmin',
				name: 'LiteSpeed 管理后台',
				port: 7080,
				protocol: 'TCP',
				description: 'LiteSpeed Web Server 的 WebAdmin 控制台默认端口，配套的加密后台为 7081。'
			}
		]
	},
	{
		key: 'app',
		label: '应用与中间件',
		description: 'Java 容器、注册中心、消息队列、对象存储与大数据组件',
		entries: [
			{
				service: 'Apache Tomcat',
				name: 'Tomcat HTTP 连接器',
				port: 8080,
				protocol: 'TCP',
				hot: true,
				description: 'Tomcat 的默认 HTTP 连接器端口，Spring Boot 内嵌 Tomcat 同样默认使用 8080。'
			},
			{
				service: 'Apache Tomcat AJP',
				name: 'Tomcat AJP 协议',
				port: 8009,
				protocol: 'TCP',
				description: 'Tomcat 与前置 Web 服务器之间的 AJP 二进制协议端口，用于转发请求并传递客户端信息。',
				note: 'AJP 曾出现 Ghostcat 文件读取漏洞（CVE-2020-1938），不用时应关闭。'
			},
			{
				service: 'Apache Tomcat Shutdown',
				name: 'Tomcat 关闭端口',
				port: 8005,
				protocol: 'TCP',
				description: '接收 SHUTDOWN 指令关闭 Tomcat 实例的控制端口。',
				note: '出于安全考虑通常只监听 127.0.0.1。'
			},
			{
				service: 'WildFly / JBoss',
				name: 'WildFly 管理控制台',
				port: 9990,
				protocol: 'TCP',
				description: 'WildFly（JBoss AS）的 Web 管理控制台端口，业务 HTTP 默认 8080、HTTPS 默认 8443。'
			},
			{
				service: 'Oracle WebLogic',
				name: 'WebLogic 控制台',
				port: 7001,
				protocol: 'TCP',
				description: 'WebLogic Server 默认的 HTTP 监听端口，管理控制台与部署的应用共用该端口。'
			},
			{
				service: 'IBM WebSphere',
				name: 'WebSphere 应用端口',
				port: 9080,
				protocol: 'TCP',
				description: 'WebSphere Application Server 默认的 HTTP 传输链端口，管理控制台通常为 9060（HTTPS 9043）。'
			},
			{
				service: 'Nacos',
				name: 'Nacos 控制台 / OpenAPI',
				port: 8848,
				protocol: 'TCP',
				hot: true,
				description: '阿里开源的服务注册与配置中心，8848 为控制台与 OpenAPI 的 HTTP 端口。',
				note: 'Nacos 2.x 还需放通 9848 / 9849 的 gRPC 端口，并务必修改默认口令。'
			},
			{
				service: 'Nacos gRPC',
				name: 'Nacos 长连接端口',
				port: 9848,
				protocol: 'TCP',
				description: 'Nacos 2.x 客户端 gRPC 长连接端口，默认值为服务端口 8848 加 1000，集群间同步使用 9849。'
			},
			{
				service: 'Apache ZooKeeper',
				name: 'ZooKeeper 客户端端口',
				port: 2181,
				protocol: 'TCP',
				hot: true,
				description: '分布式协调服务 ZooKeeper 对客户端提供服务的端口，Kafka 等组件依赖它做元数据协调。'
			},
			{
				service: 'ZooKeeper Follower',
				name: 'ZooKeeper 节点通信',
				port: 2888,
				protocol: 'TCP',
				description: 'ZooKeeper 集群中 Leader 与 Follower 之间的数据同步端口（仅集群模式使用）。'
			},
			{
				service: 'ZooKeeper Election',
				name: 'ZooKeeper 选举端口',
				port: 3888,
				protocol: 'TCP',
				description: 'ZooKeeper 集群选举 Leader 时的通信端口。'
			},
			{
				service: 'Apache Kafka',
				name: 'Kafka Broker 端口',
				port: 9092,
				protocol: 'TCP',
				hot: true,
				description: '分布式消息队列 Kafka 的 Broker 对外服务端口，生产者与消费者均连接此端口收发消息。'
			},
			{
				service: 'Kafka Controller / SSL',
				name: 'Kafka 控制器端口',
				port: 9093,
				protocol: 'TCP',
				description: 'KRaft 模式下 Controller 通信端口，也常被用作 SSL / SASL 加密监听端口。'
			},
			{
				service: 'RabbitMQ',
				name: 'AMQP 消息端口',
				port: 5672,
				protocol: 'TCP',
				hot: true,
				description: 'RabbitMQ 的 AMQP 0-9-1 协议端口，业务程序通过它发送与消费消息。'
			},
			{
				service: 'RabbitMQ Management',
				name: 'RabbitMQ 管理后台',
				port: 15672,
				protocol: 'TCP',
				description: 'RabbitMQ 的 Web 管理控制台端口，可查看队列、交换机与连接状态。',
				note: '默认账号 guest / guest 仅允许本机登录，生产环境请新建账号。'
			},
			{
				service: 'RabbitMQ Erlang',
				name: 'RabbitMQ 集群通信',
				port: 25672,
				protocol: 'TCP',
				description: 'RabbitMQ 节点间基于 Erlang 分布式协议的集群内部通信端口。'
			},
			{
				service: 'RocketMQ NameServer',
				name: 'RocketMQ 名称服务',
				port: 9876,
				protocol: 'TCP',
				description: 'RocketMQ 的 NameServer 端口，负责路由信息注册与发现，生产者与消费者先访问它再连 Broker。'
			},
			{
				service: 'RocketMQ Broker',
				name: 'RocketMQ Broker 端口',
				port: 10911,
				protocol: 'TCP',
				description: 'RocketMQ Broker 对外提供消息收发服务的主端口，主从同步默认使用 10912。'
			},
			{
				service: 'ActiveMQ',
				name: 'ActiveMQ OpenWire 端口',
				port: 61616,
				protocol: 'TCP',
				description: 'ActiveMQ 默认的 OpenWire 协议端口，Java 客户端通过它收发 JMS 消息。'
			},
			{
				service: 'ActiveMQ Console',
				name: 'ActiveMQ 管理控制台',
				port: 8161,
				protocol: 'TCP',
				description: 'ActiveMQ 自带的 Web 管理控制台端口。',
				note: '默认账号 admin / admin，必须第一时间修改。'
			},
			{
				service: 'MinIO API',
				name: 'MinIO 对象存储 API',
				port: 9000,
				protocol: 'TCP',
				description: 'MinIO 的 S3 兼容 API 端口，应用程序通过它上传下载对象文件。'
			},
			{
				service: 'MinIO Console',
				name: 'MinIO 控制台',
				port: 9001,
				protocol: 'TCP',
				description: 'MinIO 的 Web 管理控制台端口，用于管理桶、用户与访问策略。'
			},
			{
				service: 'Apache Flink',
				name: 'Flink JobManager UI',
				port: 8081,
				protocol: 'TCP',
				description: 'Flink JobManager 的 Web UI 与 REST API 端口，用于提交作业与查看运行状态。'
			},
			{
				service: 'Apache Spark',
				name: 'Spark Master RPC',
				port: 7077,
				protocol: 'TCP',
				description: 'Spark Standalone 模式下 Master 的 RPC 端口，Worker 与客户端通过它注册和提交任务。'
			},
			{
				service: 'HDFS NameNode UI',
				name: 'HDFS NameNode 控制台',
				port: 9870,
				protocol: 'TCP',
				description: 'Hadoop 3.x 中 NameNode 的 Web UI 端口（2.x 为 50070），用于查看 HDFS 状态与文件浏览。'
			},
			{
				service: 'HDFS RPC',
				name: 'HDFS 客户端 RPC',
				port: 8020,
				protocol: 'TCP',
				description: 'HDFS 客户端与 NameNode 交互的 RPC 端口，读写文件时先通过它获取数据块位置。'
			},
			{
				service: 'Consul HTTP',
				name: 'Consul API / UI',
				port: 8500,
				protocol: 'TCP',
				description: 'HashiCorp Consul 的 HTTP API 与 Web UI 端口，服务注册发现与健康检查均通过它完成。'
			},
			{
				service: 'Consul Raft',
				name: 'Consul Server 通信',
				port: 8300,
				protocol: 'TCP',
				description: 'Consul Server 节点之间 Raft 一致性协议的通信端口（仅服务端模式使用）。'
			},
			{
				service: 'Consul DNS',
				name: 'Consul DNS 接口',
				port: 8600,
				protocol: 'TCP/UDP',
				description: 'Consul 提供的 DNS 解析端口，可通过域名直接发现服务实例地址。'
			},
			{
				service: 'etcd Client',
				name: 'etcd 客户端端口',
				port: 2379,
				protocol: 'TCP',
				description: 'etcd 对外提供键值读写与 watch 的客户端端口，Kubernetes 集群的所有状态都存在这里。',
				note: '未启用 TLS + 认证的 etcd 等于泄露整个集群数据，务必加固。'
			},
			{
				service: 'etcd Peer',
				name: 'etcd 节点间通信',
				port: 2380,
				protocol: 'TCP',
				description: 'etcd 集群成员之间同步数据的对等通信端口。'
			}
		]
	},
	{
		key: 'database',
		label: '数据库与缓存',
		description: '关系型数据库、NoSQL、时序库与检索服务',
		entries: [
			{
				service: 'MySQL',
				name: 'MySQL 服务端口',
				port: 3306,
				protocol: 'TCP',
				hot: true,
				description: 'MySQL 与 MariaDB 的默认服务端口，客户端、ORM 与各类管理工具都连接此端口。',
				note: '不要直接暴露公网，务必限制来源 IP 并使用强口令。'
			},
			{
				service: 'MySQL X Protocol',
				name: 'MySQL X 协议端口',
				port: 33060,
				protocol: 'TCP',
				description: 'MySQL 8.0 引入的 X Protocol 端口，用于文档型 CRUD 与 X DevAPI 连接。'
			},
			{
				service: 'PostgreSQL',
				name: 'PostgreSQL 服务端口',
				port: 5432,
				protocol: 'TCP',
				hot: true,
				description: 'PostgreSQL 默认监听端口，psql、JDBC 与连接池组件均使用该端口。'
			},
			{
				service: 'Oracle Database',
				name: 'Oracle 监听端口',
				port: 1521,
				protocol: 'TCP',
				hot: true,
				description: 'Oracle 数据库 TNS 监听器默认端口，客户端通过服务名或 SID 连接实例。'
			},
			{
				service: 'SQL Server',
				name: 'SQL Server 服务端口',
				port: 1433,
				protocol: 'TCP',
				hot: true,
				description: 'Microsoft SQL Server 默认的 TCP 监听端口，命名实例可能使用动态端口。'
			},
			{
				service: 'SQL Server Browser',
				name: 'SQL Server 浏览器服务',
				port: 1434,
				protocol: 'UDP',
				description: 'SQL Server Browser 服务端口，客户端通过它查询实例名与对应的动态端口号。'
			},
			{
				service: 'IBM Db2',
				name: 'Db2 服务端口',
				port: 50000,
				protocol: 'TCP',
				description: 'IBM Db2 数据库默认的客户端连接端口。'
			},
			{
				service: 'MongoDB',
				name: 'MongoDB 服务端口',
				port: 27017,
				protocol: 'TCP',
				hot: true,
				description: 'MongoDB 默认的数据库服务端口，mongod 与 mongos 均监听它，副本集成员常用 27018 / 27019。',
				note: '早期默认无认证，多次出现未授权访问导致删库勒索，务必开启鉴权。'
			},
			{
				service: 'Redis',
				name: 'Redis 服务端口',
				port: 6379,
				protocol: 'TCP',
				hot: true,
				description: 'Redis 默认服务端口，缓存、分布式锁、队列等场景的客户端连接入口。',
				note: '默认无密码，暴露公网极易被写入 SSH 公钥或挖矿，须设置密码并绑定内网。'
			},
			{
				service: 'Redis Cluster Bus',
				name: 'Redis 集群总线',
				port: 16379,
				protocol: 'TCP',
				description: 'Redis Cluster 节点之间的集群总线端口，规则为服务端口加 10000，用于心跳与数据迁移。'
			},
			{
				service: 'Memcached',
				name: 'Memcached 缓存端口',
				port: 11211,
				protocol: 'TCP/UDP',
				description: 'Memcached 默认服务端口，常用于数据库查询结果与会话缓存。',
				note: 'UDP 是常见的反射放大攻击来源，生产环境应禁用 UDP 并绑定内网。'
			},
			{
				service: 'Elasticsearch REST',
				name: 'ES HTTP 接口',
				port: 9200,
				protocol: 'TCP',
				hot: true,
				description: 'Elasticsearch 对外提供 RESTful 查询与写入的 HTTP 端口，Kibana 与业务程序都通过它访问。',
				note: '切勿直接暴露公网，务必开启认证（X-Pack 或前置网关）。'
			},
			{
				service: 'Elasticsearch Transport',
				name: 'ES 节点间传输',
				port: 9300,
				protocol: 'TCP',
				description: 'Elasticsearch 集群节点之间的内部传输端口，负责分片分配与数据复制。'
			},
			{
				service: 'ClickHouse HTTP',
				name: 'ClickHouse HTTP 接口',
				port: 8123,
				protocol: 'TCP',
				description: 'ClickHouse 的 HTTP 查询端口，curl、JDBC 与 BI 工具常通过它执行 SQL。'
			},
			{
				service: 'ClickHouse Native',
				name: 'ClickHouse 原生协议',
				port: 9000,
				protocol: 'TCP',
				description: 'ClickHouse 原生 TCP 协议端口，clickhouse-client 与原生驱动默认连接此端口。'
			},
			{
				service: 'Cassandra CQL',
				name: 'Cassandra 客户端端口',
				port: 9042,
				protocol: 'TCP',
				description: 'Cassandra 的 CQL 原生协议端口，驱动与 cqlsh 通过它执行查询。'
			},
			{
				service: 'Cassandra Gossip',
				name: 'Cassandra 节点通信',
				port: 7000,
				protocol: 'TCP',
				description: 'Cassandra 集群节点之间的 Gossip 通信端口（启用节点间 SSL 时使用 7001）。'
			},
			{
				service: 'Neo4j Browser',
				name: 'Neo4j 浏览器控制台',
				port: 7474,
				protocol: 'TCP',
				description: 'Neo4j 图数据库的 HTTP 接口与 Browser 操作台端口。'
			},
			{
				service: 'Neo4j Bolt',
				name: 'Neo4j Bolt 协议',
				port: 7687,
				protocol: 'TCP',
				description: 'Neo4j 的 Bolt 二进制协议端口，官方驱动与各类语言客户端均通过它访问图数据。'
			},
			{
				service: 'InfluxDB',
				name: 'InfluxDB HTTP API',
				port: 8086,
				protocol: 'TCP',
				description: 'InfluxDB 时序数据库的 HTTP API 与 Web 查询界面端口。'
			},
			{
				service: 'TDengine',
				name: 'TDengine 服务端口',
				port: 6030,
				protocol: 'TCP',
				description: 'TDengine 时序数据库的客户端连接与 REST 接口端口。'
			},
			{
				service: 'TiDB',
				name: 'TiDB MySQL 协议',
				port: 4000,
				protocol: 'TCP',
				description: 'TiDB 对外提供 MySQL 兼容协议的端口，可直接用 MySQL 客户端连接。'
			},
			{
				service: 'TiDB Status',
				name: 'TiDB 状态上报端口',
				port: 10080,
				protocol: 'TCP',
				description: 'TiDB 的状态与监控指标上报端口，Prometheus 从这里抓取实例指标。'
			},
			{
				service: 'HBase Master UI',
				name: 'HBase 主节点控制台',
				port: 16010,
				protocol: 'TCP',
				description: 'HBase HMaster 的 Web UI 端口，用于查看 Region 分布与集群状态。'
			},
			{
				service: 'HiveServer2',
				name: 'Hive 服务端口',
				port: 10000,
				protocol: 'TCP',
				description: 'HiveServer2 的 Thrift / JDBC 端口，BI 工具与 beeline 通过它提交 HiveQL。'
			},
			{
				service: 'Apache Doris FE HTTP',
				name: 'Doris FE 控制台',
				port: 8030,
				protocol: 'TCP',
				description: 'Doris 前端（FE）的 HTTP 端口，提供 Web UI 与 Stream Load 导入入口。'
			},
			{
				service: 'Apache Doris FE Query',
				name: 'Doris FE 查询端口',
				port: 9030,
				protocol: 'TCP',
				description: 'Doris FE 的 MySQL 协议端口，各类 MySQL 客户端可直连执行查询。'
			}
		]
	},
	{
		key: 'file',
		label: '文件与共享',
		description: '文件传输、网络共享与存储协议',
		entries: [
			{
				service: 'FTP Control',
				name: 'FTP 控制连接',
				port: 21,
				protocol: 'TCP',
				hot: true,
				description: 'FTP 协议的命令控制端口，用于登录、切换目录与下发传输指令。',
				note: '账号密码与数据均明文传输，建议改用 SFTP 或 FTPS。'
			},
			{
				service: 'FTP Data',
				name: 'FTP 数据连接（主动模式）',
				port: 20,
				protocol: 'TCP',
				description: 'FTP 主动模式下服务器主动连接客户端的数据端口，被动模式则使用随机高位端口。'
			},
			{
				service: 'TFTP',
				name: '简单文件传输协议',
				port: 69,
				protocol: 'UDP',
				description: '轻量级文件传输协议，常用于网络设备固件、配置文件的刷写与 PXE 启动。',
				note: '无认证机制，仅限可信内网使用。'
			},
			{
				service: 'SMB / CIFS',
				name: 'Windows 文件共享',
				port: 445,
				protocol: 'TCP',
				hot: true,
				description: 'SMB 协议在现代 Windows 文件共享中的直连端口，映射网络驱动器与域内共享均使用它。',
				note: '永恒之蓝（MS17-010）等蠕虫利用该端口传播，禁止暴露公网并及时打补丁。'
			},
			{
				service: 'NetBIOS Session',
				name: 'NetBIOS 会话服务',
				port: 139,
				protocol: 'TCP',
				description: '基于 NetBIOS over TCP/IP 的会话服务端口，旧版 Windows 共享与打印机共享使用。'
			},
			{
				service: 'NetBIOS Datagram',
				name: 'NetBIOS 数据报服务',
				port: 138,
				protocol: 'UDP',
				description: 'NetBIOS 的无连接数据报服务端口，用于网络中的名称广播与浏览列表。'
			},
			{
				service: 'NFS',
				name: '网络文件系统',
				port: 2049,
				protocol: 'TCP/UDP',
				description: 'NFS 服务默认端口，Linux 之间挂载共享目录时使用，早期版本还需 rpcbind 的 111 端口配合。'
			},
			{
				service: 'rsync',
				name: 'rsync 守护进程',
				port: 873,
				protocol: 'TCP',
				description: 'rsync 以守护进程方式提供增量同步服务的端口，备份与镜像场景常用。'
			},
			{
				service: 'iSCSI',
				name: 'iSCSI 存储协议',
				port: 3260,
				protocol: 'TCP',
				description: 'IP SAN 中 iSCSI 目标器（Target）的监听端口，主机通过它挂载远端块设备。'
			},
			{
				service: 'AFP',
				name: 'Apple 文件共享',
				port: 548,
				protocol: 'TCP',
				description: 'Apple Filing Protocol 端口，macOS 旧版文件共享使用，现已逐步被 SMB 取代。'
			}
		]
	},
	{
		key: 'mail',
		label: '邮件服务',
		description: '邮件发送、收取与加密端口',
		entries: [
			{
				service: 'SMTP',
				name: '邮件传输（明文）',
				port: 25,
				protocol: 'TCP',
				description: 'SMTP 默认端口，主要用于邮件服务器之间的投递。',
				note: '多数云厂商封禁 25 端口出站，客户端发信请改用 587。'
			},
			{
				service: 'SMTP Submission',
				name: '邮件提交端口',
				port: 587,
				protocol: 'TCP',
				hot: true,
				description: '标准邮件客户端提交端口，配合 STARTTLS 加密，是配置发信时最常用的端口。'
			},
			{
				service: 'SMTPS',
				name: '邮件传输（隐式 TLS）',
				port: 465,
				protocol: 'TCP',
				description: '直接以 TLS 握手开始的 SMTP 加密端口，部分服务商仍要求使用 465 发信。'
			},
			{
				service: 'POP3',
				name: '邮件接收（明文）',
				port: 110,
				protocol: 'TCP',
				description: 'POP3 协议默认端口，把邮件下载到本地并通常从服务器删除。'
			},
			{
				service: 'POP3S',
				name: '邮件接收（加密）',
				port: 995,
				protocol: 'TCP',
				description: 'POP3 over SSL/TLS 端口，加密收取邮件。'
			},
			{
				service: 'IMAP',
				name: '邮件访问（明文）',
				port: 143,
				protocol: 'TCP',
				description: 'IMAP 协议默认端口，客户端与服务器保持同步、可在多设备查看同一邮箱。'
			},
			{
				service: 'IMAPS',
				name: '邮件访问（加密）',
				port: 993,
				protocol: 'TCP',
				hot: true,
				description: 'IMAP over SSL/TLS 端口，现代邮件客户端默认推荐的收信端口。'
			},
			{
				service: 'ManageSieve',
				name: '邮件过滤规则管理',
				port: 4190,
				protocol: 'TCP',
				description: 'ManageSieve 协议端口，用于远程管理服务器端的邮件过滤（Sieve）规则。'
			}
		]
	},
	{
		key: 'remote',
		label: '远程访问与终端',
		description: '远程登录、图形桌面与运维通道',
		entries: [
			{
				service: 'SSH',
				name: '安全远程登录',
				port: 22,
				protocol: 'TCP',
				hot: true,
				description: 'OpenSSH 服务端默认端口，同时承载 SFTP、SCP 与端口转发，是运维最常用的入口。',
				note: '建议禁用口令登录、改用密钥认证，并对公网入口做爆破防护。'
			},
			{
				service: 'Telnet',
				name: '明文远程登录',
				port: 23,
				protocol: 'TCP',
				description: '早期远程登录协议端口，网络设备调试时仍可见。',
				note: '账号与数据完全明文，生产环境应禁用，改用 SSH。'
			},
			{
				service: 'RDP',
				name: 'Windows 远程桌面',
				port: 3389,
				protocol: 'TCP',
				hot: true,
				description: 'Microsoft 远程桌面协议端口，用于图形化远程操作 Windows 主机。',
				note: '暴露公网易遭暴力破解与 BlueKeep 类漏洞攻击，务必加白名单与多因素认证。'
			},
			{
				service: 'VNC',
				name: 'VNC 远程桌面',
				port: 5900,
				protocol: 'TCP',
				description: 'VNC 显示号 N 对应端口 5900+N，例如 :1 桌面监听 5901，常用于 Linux 与虚拟化控制台。',
				note: '默认认证强度低，建议通过 SSH 隧道访问。'
			},
			{
				service: 'X11',
				name: 'X Window 显示服务',
				port: 6000,
				protocol: 'TCP',
				description: 'X11 图形显示服务端口，显示号 N 对应 6000+N，用于远程图形界面转发。'
			},
			{
				service: 'TeamViewer',
				name: 'TeamViewer 通信端口',
				port: 5938,
				protocol: 'TCP/UDP',
				description: 'TeamViewer 客户端建立连接与中继时使用的端口。'
			},
			{
				service: 'AnyDesk',
				name: 'AnyDesk 通信端口',
				port: 7070,
				protocol: 'TCP',
				description: 'AnyDesk 远程协助默认使用的直连端口。'
			},
			{
				service: 'WinRM',
				name: 'Windows 远程管理',
				port: 5985,
				protocol: 'TCP',
				description: 'WinRM 的 HTTP 端口，PowerShell 远程会话与 Ansible 管理 Windows 时使用（HTTPS 为 5986）。'
			}
		]
	},
	{
		key: 'base',
		label: '基础网络与认证',
		description: 'DNS、DHCP、目录认证、VPN 与代理',
		entries: [
			{
				service: 'DNS',
				name: '域名解析服务',
				port: 53,
				protocol: 'TCP/UDP',
				hot: true,
				description: '域名系统端口，常规查询走 UDP，区域传送与超长响应走 TCP。',
				note: '开放递归解析会被利用做 DNS 放大攻击，公网 DNS 应只允许可信客户端递归。'
			},
			{
				service: 'DHCP Server',
				name: 'DHCP 服务端',
				port: 67,
				protocol: 'UDP',
				description: 'DHCP 服务端监听端口，负责向客户端分配 IP 地址、网关与 DNS 等参数。'
			},
			{
				service: 'DHCP Client',
				name: 'DHCP 客户端',
				port: 68,
				protocol: 'UDP',
				description: 'DHCP 客户端请求地址时使用的端口。'
			},
			{
				service: 'NTP',
				name: '网络时间同步',
				port: 123,
				protocol: 'UDP',
				description: '网络时间协议端口，服务器与设备通过它校时，集群与证书校验都依赖时间准确。',
				note: '旧版 monlist 查询是常见的放大攻击来源，应升级并限制查询来源。'
			},
			{
				service: 'LDAP',
				name: '轻量目录访问协议',
				port: 389,
				protocol: 'TCP',
				description: 'LDAP 目录服务端口，OpenLDAP 与 Active Directory 的身份查询默认使用它。',
				note: '应关闭匿名绑定，并改用 636 的加密连接。'
			},
			{
				service: 'LDAPS',
				name: 'LDAP over SSL',
				port: 636,
				protocol: 'TCP',
				description: 'LDAP 的 SSL/TLS 加密端口，避免账号口令与目录数据明文传输。'
			},
			{
				service: 'Kerberos',
				name: 'Kerberos 认证服务',
				port: 88,
				protocol: 'TCP/UDP',
				description: 'Kerberos 票据认证服务端口，Windows 域与 Hadoop 安全集群都依赖它。'
			},
			{
				service: 'RADIUS Auth',
				name: 'RADIUS 认证端口',
				port: 1812,
				protocol: 'UDP',
				description: 'RADIUS 认证端口，无线 AP、VPN 与交换机把用户凭证转发到它做统一认证。'
			},
			{
				service: 'RADIUS Accounting',
				name: 'RADIUS 计费端口',
				port: 1813,
				protocol: 'UDP',
				description: 'RADIUS 计费与审计端口，记录用户的在线时长与流量。'
			},
			{
				service: 'Syslog',
				name: '系统日志服务',
				port: 514,
				protocol: 'UDP',
				description: 'Syslog 日志收集端口，网络设备与服务器把日志推送至日志中心。',
				note: '默认无加密与认证，跨公网传输建议使用 TLS 的 6514。'
			},
			{
				service: 'SNMP',
				name: '简单网络管理协议',
				port: 161,
				protocol: 'UDP',
				description: 'SNMP 管理端查询设备指标的端口，监控平台通过它采集交换机、路由器与打印机状态。',
				note: '务必把 public / private 团体字改掉或直接停用 v1/v2c，改用 SNMPv3。'
			},
			{
				service: 'SNMP Trap',
				name: 'SNMP 告警上报',
				port: 162,
				protocol: 'UDP',
				description: '设备主动上报告警（Trap / Inform）时使用的端口。'
			},
			{
				service: 'WHOIS',
				name: '域名信息查询',
				port: 43,
				protocol: 'TCP',
				description: 'WHOIS 查询端口，用于查询域名注册信息与 IP 归属。'
			},
			{
				service: 'BGP',
				name: '边界网关协议',
				port: 179,
				protocol: 'TCP',
				description: 'BGP 邻居建立与路由交换端口，运营商与云网络互联的核心协议。'
			},
			{
				service: 'IPsec IKE',
				name: 'IPsec 密钥协商',
				port: 500,
				protocol: 'UDP',
				description: 'IPsec VPN 的 IKE 阶段一协商端口，用于建立安全联盟。'
			},
			{
				service: 'IPsec NAT-T',
				name: 'IPsec NAT 穿越',
				port: 4500,
				protocol: 'UDP',
				description: 'IPsec 的 NAT 穿越端口，检测到 NAT 设备后 ESP 报文会封装在此端口传输。'
			},
			{
				service: 'OpenVPN',
				name: 'OpenVPN 服务端口',
				port: 1194,
				protocol: 'UDP',
				description: 'OpenVPN 默认监听端口，也常被改为 443 的 TCP 形式以穿透严格防火墙。'
			},
			{
				service: 'WireGuard',
				name: 'WireGuard VPN',
				port: 51820,
				protocol: 'UDP',
				description: 'WireGuard 默认监听端口，配置轻量、基于 UDP 的高性能 VPN 方案。'
			},
			{
				service: 'PPTP',
				name: '点对点隧道协议',
				port: 1723,
				protocol: 'TCP',
				description: 'PPTP VPN 的控制端口，因其加密已被攻破，仅建议兼容老旧设备时使用。'
			},
			{
				service: 'L2TP',
				name: '二层隧道协议',
				port: 1701,
				protocol: 'UDP',
				description: 'L2TP 隧道端口，通常与 IPsec 组合使用（L2TP/IPsec VPN）。'
			},
			{
				service: 'SOCKS Proxy',
				name: 'SOCKS 代理端口',
				port: 1080,
				protocol: 'TCP',
				description: 'SOCKS 代理常用端口，SSH 动态转发（ssh -D）也默认监听它。'
			},
			{
				service: 'HTTP Proxy',
				name: 'Squid 等 HTTP 代理',
				port: 3128,
				protocol: 'TCP',
				description: 'Squid 等正向代理软件的默认端口，浏览器与包管理器通过它访问外网。'
			},
			{
				service: 'Clash Mixed',
				name: '代理工具混合端口',
				port: 7890,
				protocol: 'TCP',
				description: 'Clash 等代理客户端常用的混合入站端口，同时支持 HTTP 与 SOCKS 协议（7891 为 SOCKS 专用）。'
			},
			{
				service: 'RPC Portmapper',
				name: 'RPC 端口映射服务',
				port: 111,
				protocol: 'TCP/UDP',
				description: 'rpcbind / portmap 端口，NFS 等 RPC 服务先向它注册端口，客户端再据此查询。'
			},
			{
				service: 'CUPS / IPP',
				name: '打印服务',
				port: 631,
				protocol: 'TCP/UDP',
				description: 'CUPS 打印系统与 IPP 协议端口，用于共享打印机与提交打印任务。'
			},
			{
				service: 'SANE',
				name: '扫描仪共享服务',
				port: 6566,
				protocol: 'TCP',
				description: 'SANE 网络扫描服务端口，用于跨主机共享扫描仪。'
			}
		]
	},
	{
		key: 'monitor',
		label: '监控与运维',
		description: '指标采集、日志聚合、CI/CD 与代码仓库',
		entries: [
			{
				service: 'Prometheus',
				name: 'Prometheus 服务端口',
				port: 9090,
				protocol: 'TCP',
				hot: true,
				description: 'Prometheus 的 Web UI 与查询 API 端口，可通过 PromQL 查询抓取到的指标。'
			},
			{
				service: 'Grafana',
				name: 'Grafana 可视化面板',
				port: 3000,
				protocol: 'TCP',
				hot: true,
				description: 'Grafana 默认 Web 端口，用于把 Prometheus、Loki 等数据源绘制成监控大盘。',
				note: '默认账号 admin / admin，首次登录必须修改。'
			},
			{
				service: 'Alertmanager',
				name: '告警管理服务',
				port: 9093,
				protocol: 'TCP',
				description: 'Prometheus Alertmanager 的端口，负责告警分组、抑制与通知分发。'
			},
			{
				service: 'Node Exporter',
				name: '主机指标采集',
				port: 9100,
				protocol: 'TCP',
				description: 'Prometheus Node Exporter 暴露主机 CPU、内存、磁盘、网络指标的端口。'
			},
			{
				service: 'cAdvisor',
				name: '容器指标采集',
				port: 8080,
				protocol: 'TCP',
				description: 'cAdvisor 的 Web 端口，采集容器资源使用情况并暴露给 Prometheus。'
			},
			{
				service: 'Zabbix Server',
				name: 'Zabbix 服务端',
				port: 10051,
				protocol: 'TCP',
				description: 'Zabbix Server 接收 Agent 与 Proxy 主动上报数据的端口。'
			},
			{
				service: 'Zabbix Agent',
				name: 'Zabbix 客户端',
				port: 10050,
				protocol: 'TCP',
				description: 'Zabbix Agent 监听端口，服务端通过它拉取主机指标。'
			},
			{
				service: 'NRPE',
				name: 'Nagios 远程执行插件',
				port: 5666,
				protocol: 'TCP',
				description: 'NRPE 端口，Nagios 通过它在被监控主机上执行本地检查脚本。'
			},
			{
				service: 'SkyWalking OAP gRPC',
				name: 'SkyWalking 数据上报',
				port: 11800,
				protocol: 'TCP',
				description: 'Apache SkyWalking OAP 接收探针链路数据的 gRPC 端口（HTTP 为 12800）。'
			},
			{
				service: 'Jaeger UI',
				name: 'Jaeger 链路追踪面板',
				port: 16686,
				protocol: 'TCP',
				description: 'Jaeger 查询服务与 Web UI 端口，用于检索分布式调用链。'
			},
			{
				service: 'Zipkin',
				name: 'Zipkin 链路追踪服务',
				port: 9411,
				protocol: 'TCP',
				description: 'Zipkin 的 HTTP API 与查询界面端口，接收并展示链路数据。'
			},
			{
				service: 'Loki',
				name: '日志聚合服务',
				port: 3100,
				protocol: 'TCP',
				description: 'Grafana Loki 的 HTTP API 端口，负责接收与查询日志，常与 Promtail 搭配。'
			},
			{
				service: 'OpenTelemetry gRPC',
				name: 'OTel Collector gRPC',
				port: 4317,
				protocol: 'TCP',
				description: 'OpenTelemetry Collector 默认的 OTLP gRPC 接收端口（HTTP 为 4318）。'
			},
			{
				service: 'VictoriaMetrics',
				name: 'VictoriaMetrics 单机版',
				port: 8428,
				protocol: 'TCP',
				description: 'VictoriaMetrics 的写入与查询端口，兼容 Prometheus 远程读写协议。'
			},
			{
				service: 'Netdata',
				name: 'Netdata 实时监控',
				port: 19999,
				protocol: 'TCP',
				description: 'Netdata 的 Web 界面端口，提供秒级实时性能监控仪表盘。'
			},
			{
				service: 'Jenkins Web',
				name: 'Jenkins 控制台',
				port: 8080,
				protocol: 'TCP',
				description: 'Jenkins 默认的 Web 控制台端口，构建任务与插件管理均在此操作。'
			},
			{
				service: 'Jenkins Agent',
				name: 'Jenkins 代理通信',
				port: 50000,
				protocol: 'TCP',
				description: 'Jenkins 与 JNLP 方式接入的构建代理通信端口，被防火墙拦截时节点会掉线。'
			},
			{
				service: 'SonarQube',
				name: 'SonarQube 代码质量平台',
				port: 9000,
				protocol: 'TCP',
				description: 'SonarQube 默认 Web 端口，用于查看代码扫描报告与质量门禁。'
			},
			{
				service: 'Sonatype Nexus',
				name: 'Nexus 制品仓库',
				port: 8081,
				protocol: 'TCP',
				description: 'Nexus Repository Manager 的 Web 控制台与仓库服务端口。'
			},
			{
				service: 'GitLab（自定义）',
				name: 'GitLab Web 备用端口',
				port: 8929,
				protocol: 'TCP',
				description: 'GitLab Omnibus 默认占 80 / 443；当端口被占用时，官方常把内置 Nginx 改到 8929。'
			}
		]
	},
	{
		key: 'container',
		label: '容器与编排',
		description: 'Docker、Kubernetes 与容器网络',
		entries: [
			{
				service: 'Docker Remote API',
				name: 'Docker 守护进程（明文）',
				port: 2375,
				protocol: 'TCP',
				hot: true,
				description: 'Docker Daemon 未加密的远程 API 端口，可远程管理镜像与容器。',
				note: '暴露 2375 等于交出宿主机 root 权限，严禁对外开放。'
			},
			{
				service: 'Docker Remote API TLS',
				name: 'Docker 守护进程（TLS）',
				port: 2376,
				protocol: 'TCP',
				description: 'Docker 远程 API 的 TLS 加密端口，需要客户端证书双向认证。'
			},
			{
				service: 'Kubernetes API Server',
				name: 'K8s 集群 API',
				port: 6443,
				protocol: 'TCP',
				hot: true,
				description: 'Kubernetes API Server 的 HTTPS 端口，kubectl、控制器与所有组件都通过它读写集群状态。'
			},
			{
				service: 'Kubelet',
				name: 'K8s 节点代理 API',
				port: 10250,
				protocol: 'TCP',
				description: 'kubelet 暴露的 HTTPS API 端口，kubectl exec / logs / port-forward 最终都落到这里。',
				note: '必须开启认证授权，匿名访问会泄露节点与容器信息。'
			},
			{
				service: 'Kubernetes NodePort',
				name: 'K8s NodePort 范围',
				port: 30000,
				protocol: 'TCP',
				description: 'NodePort 类型 Service 默认分配端口范围 30000-32767，可通过 apiserver 的启动参数调整。'
			},
			{
				service: 'Docker Swarm',
				name: 'Swarm 集群管理',
				port: 2377,
				protocol: 'TCP',
				description: 'Docker Swarm 管理节点的集群管理端口，仅管理节点之间通信使用。'
			},
			{
				service: 'Swarm Gossip',
				name: 'Swarm 节点通信',
				port: 7946,
				protocol: 'TCP/UDP',
				description: 'Swarm 节点之间的容器网络发现与 gossip 通信端口。'
			},
			{
				service: 'VXLAN',
				name: 'Overlay 网络封装',
				port: 4789,
				protocol: 'UDP',
				description: 'Flannel、Calico、Weave 等 CNI 插件封装的 VXLAN 隧道端口，跨节点容器通信依赖它。'
			},
			{
				service: 'Cilium VXLAN',
				name: 'Cilium 隧道端口',
				port: 8472,
				protocol: 'UDP',
				description: 'Cilium 默认使用的 VXLAN 隧道端口，用于跨主机 Pod 通信。'
			},
			{
				service: 'Portainer',
				name: 'Portainer 管理界面',
				port: 9443,
				protocol: 'TCP',
				description: 'Portainer 的 HTTPS 管理界面端口（旧版本 HTTP 为 9000），用于图形化管理容器。'
			},
			{
				service: 'Harbor',
				name: 'Harbor 镜像仓库',
				port: 443,
				protocol: 'TCP',
				description: 'Harbor 默认通过 443 提供镜像仓库与 Web 管理界面（亦常配置为 80 或自定义端口）。'
			}
		]
	},
	{
		key: 'media',
		label: '消息与流媒体',
		description: '音视频传输、物联网消息与实时通信',
		entries: [
			{
				service: 'MQTT',
				name: 'MQTT 消息代理',
				port: 1883,
				protocol: 'TCP',
				hot: true,
				description: 'MQTT 协议默认端口，物联网设备与 EMQX、Mosquitto 等 Broker 通信使用。',
				note: '公网部署需启用 8883 加密与账号认证，否则会被匿名订阅。'
			},
			{
				service: 'MQTT over TLS',
				name: 'MQTT 加密端口',
				port: 8883,
				protocol: 'TCP',
				description: 'MQTT over TLS 端口，物联网生产环境推荐的加密接入方式。'
			},
			{
				service: 'MQTT over WebSocket',
				name: 'MQTT WebSocket 端口',
				port: 8083,
				protocol: 'TCP',
				description: '面向浏览器的 MQTT WebSocket 接入端口（加密版本为 8084）。'
			},
			{
				service: 'RTSP',
				name: '实时流传输协议',
				port: 554,
				protocol: 'TCP',
				description: 'RTSP 端口，IP 摄像头与 NVR 通过它协商音视频流的传输，主流播放器用它拉流。'
			},
			{
				service: 'RTMP',
				name: '实时消息协议',
				port: 1935,
				protocol: 'TCP',
				description: 'RTMP 端口，OBS 等推流软件向直播服务器推流时的默认端口。'
			},
			{
				service: 'RTP',
				name: '实时媒体传输',
				port: 5004,
				protocol: 'UDP',
				description: 'RTP 承载音视频数据的常用端口（伴随 5005 的 RTCP 控制端口），实际端口由信令协商。'
			},
			{
				service: 'SIP',
				name: '会话初始协议',
				port: 5060,
				protocol: 'TCP/UDP',
				description: 'SIP 信令端口，VoIP 电话与呼叫中心建立会话时使用（加密的 SIP over TLS 为 5061）。'
			},
			{
				service: 'STUN / TURN',
				name: 'NAT 穿透与中继',
				port: 3478,
				protocol: 'TCP/UDP',
				description: 'STUN / TURN 服务默认端口，WebRTC 与音视频通话用它发现公网地址或中继媒体流（TLS 为 5349）。'
			},
			{
				service: 'WebRTC 媒体端口',
				name: 'WebRTC 动态 UDP 范围',
				port: 49152,
				protocol: 'UDP',
				description: 'WebRTC 音视频媒体流默认使用的动态 UDP 端口范围 49152-65535，与服务端协商后随机选取。',
				note: '企业防火墙需放通该 UDP 段，否则通话只能走 TURN 中继。'
			},
			{
				service: 'XMPP Client',
				name: 'XMPP 客户端连接',
				port: 5222,
				protocol: 'TCP',
				description: 'XMPP 即时通讯协议的客户端连接端口（服务器之间互通使用 5269）。'
			},
			{
				service: 'IRC',
				name: '互联网中继聊天',
				port: 6667,
				protocol: 'TCP',
				description: 'IRC 协议默认端口，开发者社区与开源项目的实时讨论频道仍在广泛使用。'
			}
		]
	},
	{
		key: 'dev',
		label: '开发与调试',
		description: '本地开发服务器、调试端口与运行时',
		entries: [
			{
				service: 'Vite Dev Server',
				name: 'Vite 开发服务器',
				port: 5173,
				protocol: 'TCP',
				hot: true,
				description: 'Vite 开发服务器默认端口，被占用时会自动递增（5174、5175……）。'
			},
			{
				service: 'Vite Preview',
				name: 'Vite 构建预览',
				port: 4173,
				protocol: 'TCP',
				description: 'vite preview 预览生产构建产物的默认端口。'
			},
			{
				service: 'Next.js / Nuxt / CRA',
				name: '前端框架开发端口',
				port: 3000,
				protocol: 'TCP',
				description: 'Next.js、Nuxt、Create React App 等前端框架开发服务器默认使用的端口。'
			},
			{
				service: 'Angular CLI',
				name: 'Angular 开发服务器',
				port: 4200,
				protocol: 'TCP',
				description: 'Angular CLI（ng serve）默认的开发服务器端口。'
			},
			{
				service: 'webpack-dev-server',
				name: 'Webpack / Vue CLI 开发端口',
				port: 8080,
				protocol: 'TCP',
				description: 'webpack-dev-server 与 Vue CLI 早期版本的默认开发端口。'
			},
			{
				service: 'Astro',
				name: 'Astro 开发服务器',
				port: 4321,
				protocol: 'TCP',
				description: 'Astro 框架开发服务器默认端口。'
			},
			{
				service: 'Django',
				name: 'Django 开发服务器',
				port: 8000,
				protocol: 'TCP',
				description: 'python manage.py runserver 的默认端口。'
			},
			{
				service: 'Flask',
				name: 'Flask 开发服务器',
				port: 5000,
				protocol: 'TCP',
				description: 'Flask 内置开发服务器默认端口。',
				note: 'macOS 的 AirPlay 接收器会占用 5000，冲突时可改用 5001。'
			},
			{
				service: 'Uvicorn / FastAPI',
				name: 'ASGI 开发服务器',
				port: 8000,
				protocol: 'TCP',
				description: 'uvicorn 启动 FastAPI、Starlette 应用时的默认端口。'
			},
			{
				service: 'ASP.NET Core Kestrel',
				name: 'Kestrel 开发端口',
				port: 5000,
				protocol: 'TCP',
				description: '.NET 项目默认的 Kestrel HTTP 端口，HTTPS 通常为 5001（模板中常设为 7000/7001）。'
			},
			{
				service: 'Jupyter Notebook',
				name: 'Jupyter 服务端口',
				port: 8888,
				protocol: 'TCP',
				description: 'Jupyter Notebook / Lab 的 Web 服务端口，启动时会输出带 token 的访问地址。',
				note: '切勿无密码暴露公网，历史上多次出现未授权执行代码的事件。'
			},
			{
				service: 'Chrome DevTools',
				name: '浏览器远程调试',
				port: 9222,
				protocol: 'TCP',
				description: 'Chrome / Edge 远程调试协议端口，自动化测试与 Puppeteer 通过它驱动浏览器。',
				note: '一旦暴露，他人可完全控制浏览器会话与已登录账号。'
			},
			{
				service: 'Node.js Inspector',
				name: 'Node 调试端口',
				port: 9229,
				protocol: 'TCP',
				description: 'node --inspect 默认监听的调试端口，VS Code 断点调试即连接它。'
			},
			{
				service: 'Xdebug',
				name: 'PHP 调试端口',
				port: 9003,
				protocol: 'TCP',
				description: 'Xdebug 3 默认的调试连接端口（Xdebug 2 使用 9000）。'
			},
			{
				service: 'Storybook',
				name: '组件文档服务',
				port: 6006,
				protocol: 'TCP',
				description: 'Storybook 组件开发与文档服务器的默认端口。'
			},
			{
				service: 'Phoenix',
				name: 'Elixir Phoenix 开发端口',
				port: 4000,
				protocol: 'TCP',
				description: 'Phoenix 框架 mix phx.server 默认启动端口。'
			},
			{
				service: 'Spring Boot DevTools',
				name: '热部署 LiveReload',
				port: 35729,
				protocol: 'TCP',
				description: 'Spring Boot DevTools 内置 LiveReload 服务端口，代码变更后自动刷新浏览器。'
			}
		]
	},
	{
		key: 'game',
		label: '游戏与桌面应用',
		description: '常见游戏服务端与客户端通信端口',
		entries: [
			{
				service: 'Minecraft Java',
				name: '我的世界 Java 版',
				port: 25565,
				protocol: 'TCP',
				hot: true,
				description: 'Minecraft Java 版服务端默认端口，玩家通过它加入多人游戏（查询端口为 25565 UDP）。'
			},
			{
				service: 'Minecraft Bedrock',
				name: '我的世界基岩版',
				port: 19132,
				protocol: 'UDP',
				description: 'Minecraft 基岩版（手机 / Win10）服务端默认使用的 UDP 端口，基岩版还常用 19133。'
			},
			{
				service: 'Steam Client',
				name: 'Steam 客户端通信',
				port: 27000,
				protocol: 'UDP',
				description: 'Steam 客户端通信端口范围 27000-27030、27036，用于登录、好友与内容分发。'
			},
			{
				service: 'Source Dedicated Server',
				name: '起源引擎游戏服务器',
				port: 27015,
				protocol: 'TCP/UDP',
				description: 'CS、TF2 等起源引擎游戏服务端默认端口，同时也是 Steam 查询端口。'
			},
			{
				service: 'Battle.net',
				name: '暴雪战网',
				port: 1119,
				protocol: 'TCP',
				description: '暴雪战网客户端登录与游戏通信使用的端口（游戏内还会使用 3724 等端口）。'
			},
			{
				service: 'Valorant',
				name: '无畏契约',
				port: 2099,
				protocol: 'TCP',
				description: 'Valorant 客户端通信端口，对局中的语音与游戏数据使用 5000-5500 的 UDP 端口段。'
			}
		]
	}
];

/** 常用服务默认端口扁平列表（按分组顺序排列） */
export const COMMON_PORTS: CommonPortEntry[] = COMMON_PORT_GROUPS.flatMap((group) => group.entries);

/** 端口号 → 服务条目索引（同一端口可能对应多个服务，如 8080 被多种组件共用） */
export const COMMON_PORT_INDEX: Map<number, CommonPortEntry[]> = (() => {
	const index = new Map<number, CommonPortEntry[]>();
	for (const entry of COMMON_PORTS) {
		const list = index.get(entry.port);
		if (list) list.push(entry);
		else index.set(entry.port, [entry]);
	}
	return index;
})();
