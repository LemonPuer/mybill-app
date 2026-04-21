<template>
  <div class="bottom-nav">
    <router-link
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      class="nav-item"
      :class="{ active: isActive(item.path) }"
    >
      <el-icon :size="22">
        <component :is="item.icon" />
      </el-icon>
      <span class="nav-label">{{ item.label }}</span>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { EditPen, DataAnalysis, Wallet, Setting } from '@element-plus/icons-vue'

const route = useRoute()

const navItems = [
  { path: '/', label: '记账', icon: EditPen },
  { path: '/dashboard', label: '看板', icon: DataAnalysis },
  { path: '/bills', label: '账单', icon: Wallet },
  { path: '/settings', label: '设置', icon: Setting },
]

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-top: 1px solid var(--glass-border);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
}

.dark .bottom-nav {
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color var(--motion-fast);
  position: relative;
  padding-top: 4px;
  height: 100%;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 24px;
  height: 2px;
  background: var(--color-accent);
  border-radius: 0 0 4px 4px;
  transition: transform var(--motion-spring);
}

.nav-item:hover {
  color: var(--color-accent);
}

.nav-item.active {
  color: var(--color-accent);
}

.nav-item.active::before {
  transform: translateX(-50%) scaleX(1);
}

.nav-label {
  font-size: 11px;
  margin-top: 3px;
  font-weight: 500;
}
</style>
