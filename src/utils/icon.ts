// 自定义图标工具：判断图标值是图片还是 Iconify 图标名，并校验上传的图标文件

/** 自定义图标允许的扩展名 */
const ICON_EXTENSIONS = ['png', 'jpg', 'jpeg', 'ico', 'svg', 'webp', 'gif', 'avif'];

/** 自定义图标体积上限（256 KB，避免配置体积过大） */
export const ICON_MAX_SIZE = 256 * 1024;

/** 文件选择框 accept 值（image/* 覆盖 png/jpg/svg/webp/gif，另补 ico 扩展名） */
export const ICON_ACCEPT = `image/*,.${ICON_EXTENSIONS.join(',.')}`;

/** 自定义图标的体积提示文案 */
export const ICON_SIZE_HINT = 'png / jpg / ico / svg / webp，≤ 256 KB';

/**
 * 判断图标值是否为图片：
 * 自定义上传的 Data URL、http(s) 图片地址或站内相对图片路径都按图片渲染，
 * 其余（如 "mdi:github"）按 Iconify 图标名渲染。
 */
export function isImageIcon(value: string): boolean {
	if (!value) return false;
	if (/^data:image\//i.test(value)) return true;
	const ext = ICON_EXTENSIONS.join('|');
	if (new RegExp(`^https?://.+\\.(${ext})(\\?.*)?(#.*)?$`, 'i').test(value)) return true;
	return new RegExp(`^[./].+\\.(${ext})$`, 'i').test(value);
}

/** 校验图标文件类型与体积，合法时返回空串，否则返回错误提示 */
export function validateIconFile(file: File): string {
	const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
	const isImage = file.type.startsWith('image/') || ICON_EXTENSIONS.includes(ext);
	if (!isImage) return `仅支持 ${ICON_SIZE_HINT} 等图片格式`;
	if (file.size > ICON_MAX_SIZE) return `图标体积需小于 256 KB（当前 ${(file.size / 1024).toFixed(0)} KB）`;
	return '';
}
