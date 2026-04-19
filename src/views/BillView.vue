<template>
  <div class="bills-view">
    <!-- 顶部操作栏 -->
    <div class="action-bar">
      <!-- 筛选栏 -->
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
    </div>

    <!-- 添加按钮 -->
    <div class="add-btn-bar">
      <el-button type="primary" @click="handleAdd">新增账单</el-button>
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
              <button
                class="action-btn delete"
                title="删除"
                :disabled="deletingIds.has(item.id)"
                @click="handleDelete(item)"
              >
                <el-icon v-if="!deletingIds.has(item.id)"><Delete /></el-icon>
                <el-icon v-else class="is-loading"><Loading /></el-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 账单弹窗 -->
    <AddBillView
      ref="addBillRef"
      :title="isEditing ? '编辑账单' : '新增账单'"
      :showType="true"
      :showCategory="true"
      @success="refreshBills"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FolderOpened, Edit, Delete, Loading } from '@element-plus/icons-vue'
import * as billApi from '@/services/bill'
import {
  getMonthRangeTimestamps,
  getDayRangeTimestamps,
  formatFriendlyTime,
} from '@/utils/commonUtil'
import AddBillView from '@/views/AddBillView.vue'

const loading = ref(false)
const loadingMore = ref(false)
const isEditing = ref(false) // 是否在编辑模式
const deletingIds = ref<Set<number>>(new Set()) // 正在删除的账单ID集合
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

const handleAdd = () => {
  isEditing.value = false
  addBillRef.value?.open()
}

const handleEdit = (item: any) => {
  isEditing.value = true
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
  // 防止重复删除
  if (deletingIds.value.has(item.id)) return

  try {
    await ElMessageBox.confirm('确定要删除这条账单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 标记为正在删除
    deletingIds.value.add(item.id)

    await billApi.deleteFinanceTransactions(item.id)
    ElMessage.success('删除成功')
    fetchBills(true)
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error(error?.response?.data?.msg || '删除失败，请稍后重试')
    }
  } finally {
    deletingIds.value.delete(item.id)
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
  padding: 0 4px;
}

.action-bar {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--radius-card);
  padding: 12px 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-card);
}

.filter-bar { display: flex; flex-direction: column; gap: 8px; }
.filter-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.filter-label { font-size: 13px; color: var(--color-text-muted); white-space: nowrap; }

.filter-options { display: flex; gap: 6px; flex-wrap: wrap; }

.filter-item {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  color: var(--color-text-secondary);
  background: var(--glass-bg-raised);
  border: 1px solid var(--color-border);
  transition: all var(--motion-fast);
}

.filter-item:hover { border-color: var(--color-accent); color: var(--color-accent); }

.filter-item.active {
  background: var(--color-accent-subtle);
  border-color: var(--color-accent);
  color: var(--color-accent);
  font-weight: 600;
}

.add-btn-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.bill-group {
  margin-bottom: 16px;
}

.bill-group-header {
  font-size: 13px;
  color: var(--color-text-muted);
  font-weight: 600;
  padding: 4px 8px;
  margin-bottom: 8px;
}

.bill-group-list {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.bill-item-with-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  transition: background var(--motion-fast);
}

.bill-item-with-actions:last-child { border-bottom: none; }
.bill-item-with-actions:hover { background: var(--color-accent-subtle); }

.bill-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(220, 38, 38, 0.1);
  color: var(--color-expense);
  flex-shrink: 0;
}

.bill-icon.income {
  background: rgba(6, 214, 160, 0.1);
  color: var(--color-income);
}

.bill-info { flex: 1; min-width: 0; }

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
  color: var(--color-text-muted);
  margin-top: 2px;
}

.bill-amount {
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
  margin-right: 8px;
}

.bill-amount.income  { color: var(--color-income); }
.bill-amount.expense { color: var(--color-expense); }

.bill-actions { display: flex; gap: 4px; flex-shrink: 0; }

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-tag);
  background: var(--glass-bg-raised);
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--motion-fast);
}

.action-btn:hover        { background: var(--color-accent-subtle); color: var(--color-accent); }
.action-btn.delete:hover { background: rgba(220, 38, 38, 0.1);     color: var(--color-expense); }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--color-text-muted);
}

.empty-icon  { margin-bottom: 12px; color: var(--color-text-disabled); }
.empty-text  { font-size: 14px; }

.loading-state { padding: 20px; }

.pagination-bar {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}
</style>
