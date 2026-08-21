// UUID 生成器相关类型

/** UUID 版本号（v2 依赖宿主 POSIX UID/GID，浏览器端无法有意义地生成，故未提供） */
export type UuidVersion = 'v1' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7';

/** RFC 4122 预定义命名空间 */
export type NamespacePreset = 'dns' | 'url' | 'oid' | 'x500';

/** 命名空间选择：预定义项或自定义 UUID */
export type NamespaceKey = NamespacePreset | 'custom';
