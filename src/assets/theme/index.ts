// 蓝色系主题（淡色版） — naive-ui themeOverrides
// Tailwind Blue palette: 300=#93c5fd  400=#60a5fa  500=#3b82f6  600=#2563eb

export const themeOverrides = {
	common: {
		// ---- 主色 (Blue) ----
		primaryColor: '#60a5fa',
		primaryColorHover: '#3b82f6',
		primaryColorPressed: '#2563eb',
		primaryColorSuppl: '#60a5fa',

		// ---- 信息色 (同 Blue 系) ----
		infoColor: '#60a5fa',
		infoColorHover: '#3b82f6',
		infoColorPressed: '#2563eb',
		infoColorSuppl: '#60a5fa',

		// ---- 成功色 (Emerald) ----
		successColor: '#34d399',
		successColorHover: '#10b981',
		successColorPressed: '#059669',
		successColorSuppl: '#34d399',

		// ---- 警告色 (Amber) ----
		warningColor: '#fbbf24',
		warningColorHover: '#f59e0b',
		warningColorPressed: '#d97706',
		warningColorSuppl: '#fbbf24',

		// ---- 错误色 (Red) ----
		errorColor: '#f87171',
		errorColorHover: '#ef4444',
		errorColorPressed: '#dc2626',
		errorColorSuppl: '#f87171',

		// ---- Typography ----
		fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
		fontFamilyMono: '"JetBrains Mono", "Fira Code", "SF Mono", "Cascadia Code", Consolas, monospace',
		fontSize: '14px',
		fontSizeSmall: '12px',
		fontSizeLarge: '16px',
		fontSizeHuge: '18px',

		// ---- Border radius ----
		borderRadius: '8px',
		borderRadiusSmall: '6px',

		// ---- Height / Sizing ----
		heightSmall: '28px',
		heightMedium: '34px',
		heightLarge: '40px',

		// ---- Elevation shadows ----
		boxShadow1: '0 1px 2px 0 rgba(0,0,0,0.05)',
		boxShadow2: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)',
		boxShadow3: '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)'
	},

	// ---- Button ----
	Button: {
		borderRadiusSmall: '6px',
		borderRadiusMedium: '8px',
		borderRadiusLarge: '10px',
		fontWeight: '500'
	},

	// ---- Card ----
	Card: {
		borderRadius: '12px',
		paddingSmall: '12px',
		paddingMedium: '20px',
		paddingLarge: '24px',
		titleFontSizeSmall: '15px',
		titleFontSizeMedium: '17px',
		titleFontSizeLarge: '19px',
		titleFontWeight: '600',
		borderColor: '#e5e7eb'
	},

	// ---- Message ----
	Message: {
		borderRadius: '10px',
		padding: '10px 16px',
		boxShadow: '0 4px 12px -2px rgba(0,0,0,0.08), 0 2px 6px -2px rgba(0,0,0,0.04)',

		// info
		colorInfo: '#dbeafe',
		textColorInfo: '#1e40af',
		iconColorInfo: '#3b82f6',

		// success
		colorSuccess: '#d1fae5',
		textColorSuccess: '#065f46',
		iconColorSuccess: '#10b981',

		// warning
		colorWarning: '#fef3c7',
		textColorWarning: '#92400e',
		iconColorWarning: '#f59e0b',

		// error
		colorError: '#fee2e2',
		textColorError: '#991b1b',
		iconColorError: '#ef4444',

		// loading
		colorLoading: '#e0f2fe',
		textColorLoading: '#075985',
		iconColorLoading: '#0ea5e9',

		// close
		closeColorHover: 'rgba(0,0,0,0.06)',
		closeColorPressed: 'rgba(0,0,0,0.1)',
		closeIconColor: 'rgba(0,0,0,0.45)',
		closeIconColorHover: 'rgba(0,0,0,0.75)',
		closeIconColorPressed: 'rgba(0,0,0,0.75)'
	},

	// ---- Input ----
	Input: {
		borderRadius: '8px',
		border: '1px solid #e5e7eb',
		borderFocus: '1px solid #60a5fa',
		borderHover: '1px solid #93c5fd',
		boxShadowFocus: '0 0 0 3px rgba(96,165,250,0.15)',
		placeholderColor: '#9ca3af',
		paddingMedium: '0 12px',
		heightMedium: '38px'
	},

	// ---- Menu ----
	Menu: {
		itemHeight: '38px',
		borderRadius: '6px',
		itemTextColor: '#4b5563',
		itemTextColorHover: '#1f2937',
		itemColorHover: 'rgba(96,165,250,0.08)',
		itemTextColorActive: '#2563eb',
		itemColorActive: 'rgba(96,165,250,0.12)',
		groupTextColor: '#6b7280'
	},

	// ---- Layout ----
	Layout: {
		siderToggleButtonColor: '#ffffff',
		siderToggleButtonBorder: '1px solid #e2e8f0',
		siderToggleButtonIconColor: '#2563eb'
	},

	// ---- Tag ----
	Tag: {
		borderRadius: '5px'
	},

	// ---- Progress ----
	Progress: {
		borderRadius: '4px',
		height: '6px',
		fillColor: '#60a5fa',
		railColor: '#e5e7eb'
	},

	// ---- Alert ----
	Alert: {
		borderRadius: '8px',
		padding: '12px 16px'
	},

	// ---- Collapse ----
	Collapse: {
		titleFontSize: '14px',
		titleFontWeight: '500',
		arrowColor: '#9ca3af'
	}
};
