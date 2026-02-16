export type ThemeMode = 'light' | 'dark' | 'system'

export const getStoredTheme = (): ThemeMode => {
  return (localStorage.getItem('theme') as ThemeMode) || 'system'
}

export const setStoredTheme = (theme: ThemeMode): void => {
  localStorage.setItem('theme', theme)
}

export const getSystemTheme = (): 'light' | 'dark' => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const getEffectiveTheme = (): 'light' | 'dark' => {
  const stored = getStoredTheme()
  if (stored === 'system') {
    return getSystemTheme()
  }
  return stored
}

export const applyTheme = (theme: 'light' | 'dark'): void => {
  const html = document.documentElement
  if (theme === 'dark') {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
}

export const initTheme = (): void => {
  const theme = getEffectiveTheme()
  applyTheme(theme)

  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getStoredTheme() === 'system') {
      applyTheme(getSystemTheme())
    }
  })
}
