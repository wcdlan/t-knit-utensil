import { reactive } from 'vue'
import defaultConfig from '../../site.config.json'

export interface FooterConfig {
  copyright: string
  icp: string
  icpUrl: string
  poweredBy: string
}

export interface AuthConfig {
  password: string
}

export interface SiteConfig {
  siteName: string
  siteDescription: string
  footer: FooterConfig
  auth: AuthConfig
}

export const siteConfig = reactive<SiteConfig>({ ...defaultConfig })
export const isDev = import.meta.env.DEV
export const configLoaded = isDev ? false : true

export async function loadConfig() {
  if (!isDev) return
  try {
    const res = await fetch('/api/config')
    const data = await res.json()
    Object.assign(siteConfig, data)
  } catch {
    // use default config
  }
}

export async function saveConfig(): Promise<boolean> {
  if (!isDev) return false
  try {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(siteConfig),
    })
    return res.ok
  } catch {
    return false
  }
}
