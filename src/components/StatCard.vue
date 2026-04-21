<template>
  <div class="stat-card" :class="typeClass">
    <div class="stat-icon">
      <el-icon :size="24">
        <component :is="icon" />
      </el-icon>
    </div>
    <div class="stat-info">
      <div class="stat-label">{{ label }}</div>
      <div class="stat-value">{{ value }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { computed } from 'vue'

interface Props {
  label: string
  value: string | number
  icon: Component
  type?: 'default' | 'income' | 'expense' | 'balance'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
})

const typeClass = computed(() => `stat-card--${props.type}`)
</script>

<style scoped>
.stat-card {
  background: var(--glass-bg-raised);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--radius-card);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow-card);
  transition: transform var(--motion-base), box-shadow var(--motion-base);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-accent);
}

.stat-card--income .stat-icon {
  background: rgba(6, 214, 160, 0.12);
  color: var(--color-income);
}

.stat-card--expense .stat-icon {
  background: rgba(220, 38, 38, 0.1);
  color: var(--color-expense);
}

.stat-card--balance .stat-icon {
  background: var(--color-accent-subtle);
  color: var(--color-accent);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-bg-raised);
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}
</style>
