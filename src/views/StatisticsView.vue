<template>
  <div class="statistics-view">
    <!-- 时间切换 -->
    <div class="time-switch" style="margin-bottom: 16px">
      <div
        class="time-option"
        :class="{ active: timeType === 'month' }"
        @click="timeType = 'month'"
      >
        按月
      </div>
      <div class="time-option" :class="{ active: timeType === 'year' }" @click="timeType = 'year'">
        按年
      </div>
    </div>

    <!-- 统计网格 -->
    <div class="statistics-grid">
      <!-- 收支趋势 -->
      <div class="dashboard-card stat-card-full">
        <div class="card-header">
          <span class="card-title">收支趋势</span>
        </div>
        <div class="chart-container">
          <span class="chart-placeholder-text">折线图区域 - 收支趋势</span>
        </div>
        <div class="data-summary">
          <div class="summary-item">
            <div class="summary-label">总收入</div>
            <div class="summary-value income">+{{ totalIncome.toLocaleString() }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">总支出</div>
            <div class="summary-value expense">-{{ totalExpense.toLocaleString() }}</div>
          </div>
        </div>
      </div>

      <!-- 分类占比 -->
      <div class="dashboard-card">
        <div class="card-header">
          <span class="card-title">分类占比</span>
        </div>
        <div class="chart-container">
          <span class="chart-placeholder-text">饼图区域</span>
        </div>
      </div>

      <!-- 分类对比 -->
      <div class="dashboard-card">
        <div class="card-header">
          <span class="card-title">分类对比</span>
        </div>
        <div class="chart-container">
          <span class="chart-placeholder-text">柱状图区域</span>
        </div>
      </div>

      <!-- 预算执行 -->
      <div class="dashboard-card stat-card-full">
        <div class="card-header">
          <span class="card-title">预算执行情况</span>
        </div>
        <div class="budget-list">
          <div v-for="item in budgetList" :key="item.name" class="budget-item">
            <div class="budget-header">
              <span class="budget-label">{{ item.name }}</span>
              <span class="budget-value">
                {{ item.spent }} / {{ item.budget }} 元 ({{ item.percent }}%)
              </span>
            </div>
            <div class="budget-bar">
              <div
                class="budget-progress"
                :style="{ width: `${Math.min(item.percent, 100)}%` }"
                :class="{ over: item.percent > 100 }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const timeType = ref<'month' | 'year'>('month')
const totalIncome = ref(12580)
const totalExpense = ref(4320)

const budgetList = ref([
  { name: '餐饮', spent: 680, budget: 1000, percent: 68 },
  { name: '购物', spent: 850, budget: 800, percent: 106 },
  { name: '交通', spent: 200, budget: 300, percent: 67 },
  { name: '娱乐', spent: 150, budget: 500, percent: 30 },
])
</script>

<style scoped>
.statistics-view {
  padding-bottom: 20px;
}

/* 时间切换 */
.time-switch {
  display: flex;
  background: var(--glass-bg-raised);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 2px;
  width: fit-content;
}

.time-option {
  padding: 8px 16px;
  font-size: 13px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-text-secondary);
}

.time-option.active {
  background: var(--color-accent);
  color: #fff;
}

/* 统计网格 */
.statistics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 640px) {
  .statistics-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card-full {
  grid-column: span 2;
}

@media (max-width: 640px) {
  .stat-card-full {
    grid-column: span 1;
  }
}

.dashboard-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-card);
  padding: 16px;
  box-shadow: var(--shadow-card);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.chart-container {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder-text {
  color: var(--color-text-secondary);
  font-size: 14px;
}

/* 数据摘要 */
.data-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.summary-item {
  text-align: center;
  padding: 12px;
  background: var(--glass-bg-raised);
  border-radius: 12px;
}

.summary-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.summary-value {
  font-size: 18px;
  font-weight: 600;
}

.summary-value.income {
  color: var(--color-success);
}

.summary-value.expense {
  color: var(--color-danger);
}

/* 预算进度 */
.budget-list {
  padding: 8px 0;
}

.budget-item {
  margin-bottom: 16px;
}

.budget-item:last-child {
  margin-bottom: 0;
}

.budget-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.budget-label {
  font-size: 13px;
  color: var(--color-text-primary);
}

.budget-value {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.budget-bar {
  height: 8px;
  background: var(--glass-bg-raised);
  border-radius: 4px;
  overflow: hidden;
}

.budget-progress {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-primary-light));
  border-radius: 4px;
  transition: width 0.3s ease;
}

.budget-progress.over {
  background: linear-gradient(90deg, var(--color-danger), #f87171);
}
</style>
