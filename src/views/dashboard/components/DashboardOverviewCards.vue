<template>
  <div class="stats-overview">
    <div class="stat-card income-card">
      <div class="stat-icon income-icon">
        <el-icon><ArrowDownBold /></el-icon>
      </div>
      <div class="stat-info">
        <div class="stat-label">本月收入</div>
        <div class="stat-value">{{ data.income.amount ? data.income.amount : '-' }} 元</div>
        <div class="stat-sub">本月</div>
      </div>
    </div>

    <div class="stat-card expense-card">
      <div class="stat-icon expense-icon">
        <el-icon><ArrowUpBold /></el-icon>
      </div>
      <div class="stat-info">
        <div class="stat-label">本月支出</div>
        <div class="stat-value">{{ data.expend.amount ? data.expend.amount : '-' }} 元</div>
        <div class="stat-sub">本月</div>
      </div>
    </div>

    <div class="stat-card balance-card">
      <div class="stat-icon balance-icon">
        <el-icon><Wallet /></el-icon>
      </div>
      <div class="stat-info">
        <div class="stat-label">本月结余</div>
        <div class="stat-value">{{ data.balance.amount ? data.balance.amount : '-' }} 元</div>
        <div class="stat-sub">本月</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowDownBold, ArrowUpBold, Wallet } from '@element-plus/icons-vue'
import type { DashboardOverviewData } from '@/views/dashboard/types'

defineProps<{
  data: DashboardOverviewData
}>()
</script>

<style scoped>
.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat-card {
  background: var(--glass-bg-raised);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: var(--radius-card);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 90px;
  box-shadow:
    0 4px 24px rgba(124, 58, 237, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transition: transform var(--motion-base), box-shadow var(--motion-base);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-accent);
}

.stat-card.income-card { border-left: 4px solid var(--color-income); }
.stat-card.expense-card { border-left: 4px solid var(--color-expense); }
.stat-card.balance-card { border-left: 4px solid var(--color-accent); }

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 22px;
}

.income-icon {
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.2), rgba(6, 214, 160, 0.1));
  color: var(--color-income);
}

.expense-icon {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(248, 113, 113, 0.1));
  color: var(--color-expense);
}

.balance-icon {
  background: linear-gradient(135deg, var(--color-accent-subtle), rgba(124, 58, 237, 0.05));
  color: var(--color-accent);
}

.stat-info { flex: 1; min-width: 0; }

.stat-label {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.stat-sub {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 3px;
}

@media (max-width: 1024px) and (min-width: 769px) {
  .stat-value { font-size: 20px; }
}

@media (max-width: 768px) {
  .stat-card {
    padding: 14px;
  }

  .stat-value {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .stats-overview {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .stat-card {
    padding: 14px 16px;
  }

  .stat-value {
    font-size: 20px;
  }
}
</style>
