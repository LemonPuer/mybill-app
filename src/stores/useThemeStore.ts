import { defineStore } from 'pinia'
import { ref } from 'vue'
import { type ThemeMode, getEffectiveTheme, applyTheme, setStoredTheme } from '@/utils/themeUtil'

export const useThemeStore = defineStore('theme', () => {
  const themeMode = ref<ThemeMode>((localStorage.getItem('theme') as ThemeMode) || 'system')
  const effectiveTheme = ref<'light' | 'dark'>(getEffectiveTheme())

  const setThemeMode = (mode: ThemeMode) => {
    themeMode.value = mode
    setStoredTheme(mode)
    const effective =
      mode === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : mode
    effectiveTheme.value = effective
    applyTheme(effective)
  }

  // 初始化时应用主题
  applyTheme(effectiveTheme.value)

  return {
    themeMode,
    effectiveTheme,
    setThemeMode,
  }
})
