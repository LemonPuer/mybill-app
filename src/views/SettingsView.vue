<template>
  <div class="settings-view">
    <div class="settings-grid">
      <!-- 分类管理 -->
      <div class="settings-card" @click="goToPage('/settings/categories')">
        <div class="settings-icon">🏷️</div>
        <div class="settings-title">分类管理</div>
        <div class="settings-desc">管理收支分类</div>
      </div>

      <!-- 预算管理 -->
      <div class="settings-card" @click="goToPage('/settings/budget')">
        <div class="settings-icon">📊</div>
        <div class="settings-title">预算管理</div>
        <div class="settings-desc">设置每月预算</div>
      </div>

      <!-- 主题设置 -->
      <div class="settings-card">
        <div class="settings-icon">🎨</div>
        <div class="settings-title">主题设置</div>
        <div class="settings-desc">切换深色/浅色模式</div>
        <div class="theme-options">
          <div
            class="theme-option"
            :class="{ active: themeStore.themeMode === 'light' }"
            @click.stop="themeStore.setThemeMode('light')"
          >
            <div class="theme-option-icon">☀️</div>
            <div class="theme-option-label">浅色</div>
          </div>
          <div
            class="theme-option"
            :class="{ active: themeStore.themeMode === 'dark' }"
            @click.stop="themeStore.setThemeMode('dark')"
          >
            <div class="theme-option-icon">🌙</div>
            <div class="theme-option-label">深色</div>
          </div>
          <div
            class="theme-option"
            :class="{ active: themeStore.themeMode === 'system' }"
            @click.stop="themeStore.setThemeMode('system')"
          >
            <div class="theme-option-icon">📱</div>
            <div class="theme-option-label">跟随系统</div>
          </div>
        </div>
      </div>

      <!-- 个人资料 -->
      <div class="settings-card" @click="goToPage('/settings/profile')">
        <div class="settings-icon">👤</div>
        <div class="settings-title">个人资料</div>
        <div class="settings-desc">修改个人信息</div>
      </div>

      <!-- 关于 -->
      <div class="settings-card" @click="showAbout">
        <div class="settings-icon">ℹ️</div>
        <div class="settings-title">关于</div>
        <div class="settings-desc">版本信息 v1.0.0</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useThemeStore } from '@/stores/useThemeStore'

const router = useRouter()
const themeStore = useThemeStore()

const goToPage = (path: string) => {
  ElMessage.info('页面开发中')
}

const showAbout = () => {
  ElMessage.info('mybill-app v1.0.0')
}
</script>

<style scoped>
.settings-view {
  padding-bottom: 20px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 640px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}

.settings-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 20px;
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: all 0.3s ease;
}

.settings-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-button);
}

.settings-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-bottom: 12px;
}

.settings-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.settings-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* 主题选项 */
.theme-options {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.theme-option {
  flex: 1;
  padding: 8px 4px;
  border: 2px solid var(--color-border);
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-option:hover {
  border-color: var(--color-primary-light);
}

.theme-option.active {
  border-color: var(--color-primary);
  background: rgba(20, 184, 166, 0.05);
}

.theme-option-icon {
  font-size: 18px;
  margin-bottom: 2px;
}

.theme-option-label {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.theme-option.active .theme-option-label {
  color: var(--color-primary);
}
</style>
