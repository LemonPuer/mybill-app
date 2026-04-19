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
  router.push(path)
}

const showAbout = () => {
  ElMessage.info('mybill-app v1.0.0')
}
</script>

<style scoped>
.settings-view { padding: 4px; }

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.settings-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--radius-card);
  padding: 20px 16px;
  cursor: pointer;
  transition: transform var(--motion-base), box-shadow var(--motion-base),
              border-color var(--motion-fast);
  box-shadow: var(--shadow-card);
}

.settings-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-accent);
  border-color: var(--color-border-hover);
}

.settings-icon {
  font-size: 28px;
  margin-bottom: 10px;
}

.settings-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.settings-desc {
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.theme-options {
  display: flex;
  gap: 6px;
  margin-top: 12px;
}

.theme-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: var(--radius-tag);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all var(--motion-fast);
  background: var(--glass-bg-raised);
}

.theme-option:hover { border-color: var(--color-accent); }

.theme-option.active {
  border-color: var(--color-accent);
  background: var(--color-accent-subtle);
}

.theme-option-icon  { font-size: 16px; }

.theme-option-label {
  font-size: 10px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.theme-option.active .theme-option-label { color: var(--color-accent); }

@media (max-width: 480px) {
  .settings-grid { grid-template-columns: 1fr; }
}
</style>
