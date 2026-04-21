<template>
  <div class="recentlyBill-empty-state" v-if="items.length === 0">
    <div class="common-empty-state">
      <strong>当月暂无账单</strong>
    </div>
  </div>
  <div class="recently-bill-list" v-else>
    <div
      v-for="(item, index) in items"
      :key="item.id"
      class="recently-bill-item"
      :class="{ 'no-border': index === items.length - 1 }"
    >
      <div class="recently-bill-item-left">
        <div class="bill-icon" :class="{ 'is-income': item.type === 1 }">
          <el-icon>
            <component :is="item.icon || 'Wallet'" />
          </el-icon>
        </div>
        <div class="bill-info">
          <div class="bill-category">{{ item.category || '未分类' }}</div>
          <div class="bill-note" v-if="item.note">{{ item.note }}</div>
          <div class="bill-date">{{ item.displayDate }}</div>
        </div>
      </div>
      <div class="recently-bill-item-right">
        <span class="bill-amount" :class="{ 'is-income': item.type === 1 }">
          {{ item.type === 1 ? '+' : '-' }}{{ item.amount }}
        </span>
        <div class="bill-actions">
          <el-button :icon="Edit" circle size="small" text @click="$emit('edit', item)" />
          <el-button
            :icon="deletingIds.has(item.id) ? Loading : Delete"
            circle
            size="small"
            text
            type="danger"
            :disabled="deletingIds.has(item.id)"
            @click="$emit('delete', item)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Delete, Edit, Loading } from '@element-plus/icons-vue'
import type FinanceTransactions from '@/models/FinanceTransactions'
import type { DashboardBillItem } from '@/views/dashboard/types'

defineProps<{
  items: Array<DashboardBillItem>
  deletingIds: Set<number | undefined>
}>()

defineEmits<{
  edit: [item: FinanceTransactions]
  delete: [item: FinanceTransactions]
}>()
</script>

<style scoped>
.common-empty-state {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: var(--color-text-muted);
  flex: 1;
}

.recentlyBill-empty-state {
  display: flex;
  height: 250px;
}

.recently-bill-list {
  display: flex;
  flex-direction: column;
}

.recently-bill-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 8px;
  border-radius: 0;
  border-bottom: 1px solid var(--glass-border);
  transition: background var(--motion-fast);
}

.recently-bill-item.no-border {
  border-bottom: none;
}

.recently-bill-item:hover {
  background: var(--color-accent-subtle);
}

.recently-bill-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.bill-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(220, 38, 38, 0.1);
  color: var(--color-expense);
  font-size: 18px;
  flex-shrink: 0;
}

.bill-icon.is-income {
  background: rgba(6, 214, 160, 0.1);
  color: var(--color-income);
}

.bill-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.bill-category {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bill-note {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bill-date {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.recently-bill-item-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.bill-amount {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-expense);
  font-variant-numeric: tabular-nums;
  min-width: 80px;
  text-align: right;
}

.bill-amount.is-income { color: var(--color-income); }

.bill-actions { display: flex; gap: 8px; }

.bill-actions :deep(.el-button) {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-tag);
  background: var(--color-accent-subtle);
  border: none;
  opacity: 0;
  pointer-events: none;
  transition: opacity 150ms ease-out, background var(--motion-fast);
}

.recently-bill-item:hover .bill-actions :deep(.el-button) {
  opacity: 1;
  pointer-events: auto;
}

.bill-actions :deep(.el-button:hover) {
  background: var(--color-accent);
  color: #fff;
}

@media (max-width: 768px) {
  .recently-bill-item { padding: 10px 4px; }
  .recently-bill-item-left { gap: 10px; }
  .bill-icon { width: 36px; height: 36px; font-size: 16px; }
  .recently-bill-item-right { gap: 10px; }
  .bill-amount { font-size: 15px; min-width: 80px; }

  .bill-actions :deep(.el-button) {
    width: 28px;
    height: 28px;
    opacity: 1;
    pointer-events: auto;
  }
}
</style>
