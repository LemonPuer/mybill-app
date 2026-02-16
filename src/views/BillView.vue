<template>
  <div class="bills-view">
    <!-- 顶部筛选栏 -->
    <div class="filter-bar">
      <div
        v-for="item in filterItems"
        :key="item.value"
        class="filter-item"
        :class="{ active: currentFilter === item.value }"
        @click="handleFilter(item.value)"
      >
        {{ item.label }}
      </div>
    </div>

    <!-- 账单列表 -->
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="billList.length === 0" class="empty-state">
      <el-icon :size="48" class="empty-icon">
        <FolderOpened />
      </el-icon>
      <p class="empty-text">暂无数据</p>
    </div>

    <div v-else class="bill-groups">
      <div v-for="group in groupedBills" :key="group.date" class="bill-group">
        <div class="bill-group-header">{{ group.date }}</div>
        <div class="bill-group-list">
          <div v-for="item in group.items" :key="item.id" class="bill-item-with-actions">
            <div class="bill-icon">{{ item.icon || '💰' }}</div>
            <div class="bill-info">
              <div class="bill-note">{{ item.note }}</div>
              <div class="bill-date">{{ item.category }}</div>
            </div>
            <div class="bill-amount" :class="item.type === 1 ? 'income' : 'expense'">
              {{ item.type === 1 ? '+' : '-' }}{{ item.amount }}
            </div>
            <div class="bill-actions">
              <button class="action-btn" title="编辑" @click="handleEdit(item)">
                <el-icon><Edit /></el-icon>
              </button>
              <button class="action-btn delete" title="删除" @click="handleDelete(item)">
                <el-icon><Delete /></el-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore" class="load-more">
      <el-button :loading="loadingMore" @click="loadMore">加载更多</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FolderOpened, Edit, Delete } from '@element-plus/icons-vue'
import * as billApi from '@/services/bill'

const loading = ref(false)
const loadingMore = ref(false)
const billList = ref<any[]>([])
const currentFilter = ref('all')
const pageNum = ref(1)
const pageSize = ref(20)
const hasMore = ref(true)

const filterItems = [
  { label: '全部', value: 'all' },
  { label: '今天', value: 'today' },
  { label: '本月', value: 'month' },
  { label: '上月', value: 'lastMonth' },
  { label: '支出', value: 'expense' },
  { label: '收入', value: 'income' },
]

const groupedBills = computed(() => {
  const groups: Record<string, any[]> = {}
  billList.value.forEach((item) => {
    const date = item.transactionDate?.split(' ')[0] || '未知日期'
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(item)
  })
  return Object.entries(groups).map(([date, items]) => ({
    date,
    items,
  }))
})

const fetchBills = async (reset = false) => {
  if (reset) {
    pageNum.value = 1
    billList.value = []
  }

  loading.value = true
  try {
    const params: any = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    }

    if (currentFilter.value === 'expense') {
      params.type = 2
    } else if (currentFilter.value === 'income') {
      params.type = 1
    }

    const res = await billApi.getFinanceTransactionsList(params)
    const newList = res.data.data.result || []

    if (reset) {
      billList.value = newList
    } else {
      billList.value = [...billList.value, ...newList]
    }

    hasMore.value = newList.length >= pageSize.value
  } finally {
    loading.value = false
  }
}

const handleFilter = (value: string) => {
  currentFilter.value = value
  fetchBills(true)
}

const loadMore = async () => {
  pageNum.value++
  loadingMore.value = true
  try {
    await fetchBills(false)
  } finally {
    loadingMore.value = false
  }
}

const handleEdit = (item: any) => {
  ElMessage.info('编辑功能开发中')
}

const handleDelete = async (item: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这条账单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  fetchBills(true)
})
</script>

<style scoped>
.bills-view {
  padding-bottom: 20px;
}

/* 筛选栏 */
.filter-bar {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 12px 16px;
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
  overflow-x: auto;
  box-shadow: var(--shadow-card);
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--color-bg-input);
  border-radius: 20px;
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-item:hover,
.filter-item.active {
  background: var(--color-primary);
  color: #fff;
}

/* 加载状态 */
.loading-state {
  padding: 20px;
}

/* 账单分组 */
.bill-group {
  margin-bottom: 16px;
}

.bill-group-header {
  font-size: 13px;
  color: var(--color-text-secondary);
  padding: 8px 0;
}

.bill-group-list {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.bill-item-with-actions {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
}

.bill-item-with-actions:last-child {
  border-bottom: none;
}

.bill-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--color-bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 18px;
}

.bill-info {
  flex: 1;
}

.bill-note {
  font-size: 14px;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.bill-date {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.bill-amount {
  font-size: 15px;
  font-weight: 600;
  margin-right: 12px;
}

.bill-amount.income {
  color: var(--color-success);
}

.bill-amount.expense {
  color: var(--color-danger);
}

.bill-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--color-bg-input);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: var(--color-text-secondary);
}

.action-btn:hover {
  background: var(--color-primary);
  color: #fff;
}

.action-btn.delete:hover {
  background: var(--color-danger);
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 20px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  color: var(--color-text-secondary);
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
}
</style>
