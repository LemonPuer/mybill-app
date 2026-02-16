<template>
  <div class="bills-view">
    <!-- 顶部筛选栏 -->
    <div class="filter-bar">
      <div class="filter-row">
        <span class="filter-label">类型:</span>
        <div class="filter-options">
          <div
            v-for="item in typeFilters"
            :key="item.value"
            class="filter-item"
            :class="{ active: currentTypeFilter === item.value }"
            @click="handleTypeFilter(item.value)"
          >
            {{ item.label }}
          </div>
        </div>
      </div>
      <div class="filter-row">
        <span class="filter-label">时间:</span>
        <div class="filter-options">
          <div
            v-for="item in timeFilters"
            :key="item.value"
            class="filter-item"
            :class="{ active: currentTimeFilter === item.value }"
            @click="handleTimeFilter(item.value)"
          >
            {{ item.label }}
          </div>
        </div>
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
            <div class="bill-icon" :class="{ income: item.type === 1 }">
              <el-icon>
                <component :is="item.icon || 'Wallet'" />
              </el-icon>
            </div>
            <div class="bill-info">
              <div class="bill-note">{{ item.category || '未分类' }}</div>
              <div class="bill-note" v-if="item.note">{{ item.note }}</div>
              <div class="bill-date">{{ item.transactionDate }}</div>
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

    <!-- 编辑账单弹窗 -->
    <AddBillView
      ref="addBillRef"
      title="编辑账单"
      :show-type="true"
      :show-category="true"
      @success="refreshBills"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FolderOpened, Edit, Delete } from '@element-plus/icons-vue'
import * as billApi from '@/services/bill'
import {
  getMonthRangeTimestamps,
  getDayRangeTimestamps,
  formatFriendlyTime,
} from '@/utils/commonUtil'
import AddBillView from '@/views/AddBillView.vue'

const loading = ref(false)
const loadingMore = ref(false)
const billList = ref<any[]>([])
const currentTypeFilter = ref('all')
const currentTimeFilter = ref('all')
const pageNum = ref(1)
const pageSize = ref(20)
const hasMore = ref(true)
const addBillRef = ref<InstanceType<typeof AddBillView>>()

const typeFilters = [
  { label: '全部', value: 'all' },
  { label: '支出', value: 'expense' },
  { label: '收入', value: 'income' },
]

const timeFilters = [
  { label: '全部', value: 'all' },
  { label: '今天', value: 'today' },
  { label: '本月', value: 'month' },
  { label: '上月', value: 'lastMonth' },
]

const getDateParams = () => {
  const { monthStart, monthEnd } = getMonthRangeTimestamps() as {
    monthStart: string
    monthEnd: string
  }

  if (currentTimeFilter.value === 'today') {
    const { dayStart, dayEnd } = getDayRangeTimestamps() as {
      dayStart: string
      dayEnd: string
    }
    return { startTime: dayStart, endTime: dayEnd }
  } else if (currentTimeFilter.value === 'month') {
    return { startTime: monthStart, endTime: monthEnd }
  } else if (currentTimeFilter.value === 'lastMonth') {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthStart = String(lastMonth.getTime())
    const lastMonthEnd = String(new Date(now.getFullYear(), now.getMonth(), 0).getTime())
    return { startTime: lastMonthStart, endTime: lastMonthEnd }
  }
  return {}
}

const groupedBills = computed(() => {
  const groups: Record<string, any[]> = {}
  billList.value.forEach((item) => {
    let dateStr = item.transactionDate
    // 如果是时间戳格式，转换为日期字符串
    if (dateStr && /^\d+$/.test(String(dateStr))) {
      dateStr = new Date(Number(dateStr)).toLocaleString('zh-CN')
    }
    const date = dateStr?.split(' ')[0] || '未知日期'
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

    if (currentTypeFilter.value === 'expense') {
      params.type = 2
    } else if (currentTypeFilter.value === 'income') {
      params.type = 1
    }

    const dateParams = getDateParams()
    Object.assign(params, dateParams)

    const res = await billApi.getFinanceTransactionsList(params)
    const newList = res.data.data.result || []

    // 格式化时间戳
    newList.forEach((item: any) => {
      item.transactionDate = formatFriendlyTime(item.transactionDate)
    })

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

const handleTypeFilter = (value: string) => {
  currentTypeFilter.value = value
  fetchBills(true)
}

const handleTimeFilter = (value: string) => {
  currentTimeFilter.value = value
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
  addBillRef.value?.open({
    id: item.id,
    type: item.type,
    amount: item.amount,
    categoryId: item.categoryId,
    transactionDate: item.transactionDate,
    note: item.note,
  })
}

const handleDelete = async (item: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这条账单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await billApi.deleteFinanceTransactions(item.id)
    ElMessage.success('删除成功')
    fetchBills(true)
  } catch {
    // 用户取消或删除失败
  }
}

const refreshBills = () => {
  fetchBills(true)
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
  box-shadow: var(--shadow-card);
}

.filter-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-right: 12px;
  white-space: nowrap;
}

.filter-options {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--color-bg-input);
  border-radius: 16px;
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
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.2s ease;
}

.bill-item-with-actions:hover {
  background-color: var(--color-bg-input);
}

.bill-item-with-actions:last-child {
  border-bottom: none;
}

.bill-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 18px;
  flex-shrink: 0;
}

.bill-icon.income {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
}

.bill-info {
  flex: 1;
  min-width: 0;
}

.bill-note {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bill-date {
  font-size: 11px;
  color: var(--color-text-disabled);
  margin-top: 2px;
}

.bill-amount {
  font-size: 17px;
  font-weight: 700;
  margin-right: 16px;
  min-width: 70px;
  text-align: right;
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
  flex-shrink: 0;
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
