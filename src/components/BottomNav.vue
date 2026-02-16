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
import { EditPen, DataAnalysis, Wallet, PieChart, Setting } from '@element-plus/icons-vue'

const route = useRoute()

const navItems = [
  { path: '/', label: '记账', icon: EditPen },
  { path: '/dashboard', label: '看板', icon: DataAnalysis },
  { path: '/bills', label: '账单', icon: Wallet },
  { path: '/statistics', label: '统计', icon: PieChart },
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
  height: 56px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
}

:deep(.dark) .bottom-nav {
  background: rgba(6, 78, 59, 0.9);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-item:hover {
  color: var(--color-primary);
}

.nav-item.active {
  color: var(--color-primary);
}

.nav-label {
  font-size: 11px;
  margin-top: 2px;
}
</style>
