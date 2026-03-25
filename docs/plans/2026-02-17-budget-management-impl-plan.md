# 预算管理页面实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现设置页面的预算管理功能，用户可以按分类和时间段设置预算

**Architecture:** 新增预算管理页面，复用分类选择和主题样式，支持快捷时间选项

**Tech Stack:** Vue 3 + TypeScript + Element Plus + Pinia

---

## Task 1: 创建预算管理页面组件

**Files:**

- Create: `src/views/settings/BudgetView.vue`

**Step 1: 创建页面组件**

```vue
<template>
  <div class="budget-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="back-btn" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="page-title">预算管理</div>
      <el-button type="primary" @click="handleAdd">添加预算</el-button>
    </div>

    <!-- 时间筛选 -->
    <div class="filter-bar">
      <div
        v-for="item in timeFilters"
        :key="item.value"
        class="filter-item"
        :class="{ active: currentFilter === item.value }"
        @click="handleFilter(item.value)"
      >
        {{ item.label }}
      </div>
    </div>

    <!-- 预算列表 -->
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="budgetList.length === 0" class="empty-state">
      <el-icon :size="48" class="empty-icon">
        <Money />
      </el-icon>
      <p class="empty-text">暂无预算，点击上方添加</p>
    </div>

    <div v-else class="budget-list">
      <div v-for="item in budgetList" :key="item.id" class="budget-card">
        <div class="budget-info">
          <div class="budget-category">
            <el-icon><component :is="item.icon || 'Folder'" /></el-icon>
            <span>{{ item.categoryName }}</span>
          </div>
          <div class="budget-date">{{ formatDateRange(item.startTime, item.endTime) }}</div>
        </div>
        <div class="budget-progress">
          <div class="progress-text">
            <span>已使用: {{ item.usedAmount || 0 }}元</span>
            <span>预算: {{ item.amount }}元</span>
          </div>
          <el-progress
            :percentage="getPercentage(item.usedAmount, item.amount)"
            :stroke-width="8"
            :color="getProgressColor(item.usedAmount, item.amount)"
          />
        </div>
        <div class="budget-actions">
          <el-button :icon="Edit" circle size="small" @click="handleEdit(item)" />
          <el-button :icon="Delete" circle size="small" type="danger" @click="handleDelete(item)" />
        </div>
      </div>
    </div>

    <!-- 新增/编辑预算弹窗 -->
    <el-dialog
      v-model="showDialog"
      :title="isEdit ? '编辑预算' : '新增预算'"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" label-position="top">
        <el-form-item label="选择分类" required>
          <el-select v-model="formData.categoryId" placeholder="选择分类" style="width: 100%">
            <el-option
              v-for="cat in categoryStore.categoryList"
              :key="cat.id"
              :label="cat.category"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="预算金额" required>
          <el-input-number v-model="formData.amount" :precision="2" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="时间范围" required>
          <div class="quick-options">
            <el-tag @click="setQuickDate('month')" class="quick-tag">当月</el-tag>
            <el-tag @click="setQuickDate('year')" class="quick-tag">当年</el-tag>
          </div>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="x"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Money, Edit, Delete } from '@element-plus/icons-vue'
import * as billApi from '@/services/bill'
import { useCategoryStore } from '@/stores/useCategoryStore'
import { getMonthRangeTimestamps } from '@/utils/commonUtil'

const router = useRouter()
const categoryStore = useCategoryStore()
const loading = ref(false)
const showDialog = ref(false)
const isEdit = ref(false)
const editingId = ref(0)
const currentFilter = ref('month')
const budgetList = ref<any[]>([])
const dateRange = ref<[number, number]>([])

const formData = ref({
  categoryId: 0,
  amount: 0,
  startTime: '',
  endTime: '',
})

const timeFilters = [
  { label: '本月', value: 'month' },
  { label: '本年', value: 'year' },
  { label: '全部', value: 'all' },
]

const getDateParams = () => {
  const { monthStart, monthEnd } = getMonthRangeTimestamps()
  const now = new Date()
  const yearStart = new Date(now.getFullYear(), 0, 1).getTime().toString()
  const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59).getTime().toString()

  if (currentFilter.value === 'month') {
    return { startTime: monthStart, endTime: monthEnd }
  } else if (currentFilter.value === 'year') {
    return { startTime: yearStart, endTime: yearEnd }
  }
  return { startTime: '', endTime: '' }
}

const fetchBudgets = async () => {
  loading.value = true
  try {
    const params = getDateParams()
    const res = await billApi.getBudgetInfo(params)
    budgetList.value = res.data.data.result || []
  } finally {
    loading.value = false
  }
}

const handleFilter = (value: string) => {
  currentFilter.value = value
  fetchBudgets()
}

const handleAdd = () => {
  isEdit.value = false
  formData.value = { categoryId: 0, amount: 0, startTime: '', endTime: '' }
  dateRange.value = []
  showDialog.value = true
}

const handleEdit = (item: any) => {
  isEdit.value = true
  editingId.value = item.id
  formData.value = {
    categoryId: item.categoryId,
    amount: item.amount,
    startTime: item.startTime,
    endTime: item.endTime,
  }
  dateRange.value = [Number(item.startTime), Number(item.endTime)]
  showDialog.value = true
}

const setQuickDate = (type: string) => {
  const now = new Date()
  if (type === 'month') {
    const { monthStart, monthEnd } = getMonthRangeTimestamps()
    dateRange.value = [Number(monthStart), Number(monthEnd)]
  } else if (type === 'year') {
    const yearStart = new Date(now.getFullYear(), 0, 1).getTime()
    const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59).getTime()
    dateRange.value = [yearStart, yearEnd]
  }
}

const handleSubmit = async () => {
  if (!formData.value.categoryId) {
    ElMessage.warning('请选择分类')
    return
  }
  if (!formData.value.amount || formData.value.amount <= 0) {
    ElMessage.warning('请输入有效金额')
    return
  }
  if (!dateRange.value || dateRange.value.length !== 2) {
    ElMessage.warning('请选择时间范围')
    return
  }

  try {
    const payload = {
      categoryId: formData.value.categoryId,
      amount: formData.value.amount,
      startTime: String(dateRange.value[0]),
      endTime: String(dateRange.value[1]),
    }
    if (isEdit.value) {
      await billApi.saveBudget({ ...payload, id: editingId.value })
      ElMessage.success('修改成功')
    } else {
      await billApi.saveBudget(payload)
      ElMessage.success('添加成功')
    }
    showDialog.value = false
    fetchBudgets()
  } catch {
    ElMessage.error('操作失败')
  }
}

const handleDelete = async (item: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该预算吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await billApi.deleteBudget(item.id)
    ElMessage.success('删除成功')
    fetchBudgets()
  } catch {
    // 用户取消
  }
}

const formatDateRange = (start: string, end: string) => {
  const format = (ts: string) => new Date(Number(ts)).toLocaleDateString('zh-CN')
  return `${format(start)} ~ ${format(end)}`
}

const getPercentage = (used: number, total: number) => {
  if (!total) return 0
  return Math.min(Math.round((used / total) * 100), 100)
}

const getProgressColor = (used: number, total: number) => {
  const percent = getPercentage(used, total)
  if (percent >= 90) return '#ef4444'
  if (percent >= 70) return '#f59e0b'
  return '#14b8a6'
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  categoryStore.fetchCategories()
  fetchBudgets()
})
</script>

<style scoped>
.budget-view {
  padding-bottom: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--color-bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-card);
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: var(--color-primary);
  color: #fff;
}

.back-btn .el-icon {
  font-size: 18px;
  color: var(--color-text-primary);
}

.back-btn:hover .el-icon {
  color: #fff;
}

.page-title {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.filter-bar {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 12px 16px;
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
  box-shadow: var(--shadow-card);
}

.filter-item {
  padding: 8px 16px;
  background: var(--color-bg-input);
  border-radius: 20px;
  font-size: 13px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-item.active {
  background: var(--color-primary);
  color: #fff;
}

.budget-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.budget-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 16px;
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  gap: 16px;
}

.budget-info {
  min-width: 120px;
}

.budget-category {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.budget-date {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.budget-progress {
  flex: 1;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.budget-actions {
  display: flex;
  gap: 8px;
}

.budget-actions .el-button {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--color-bg-input);
  border: none;
  color: var(--color-text-secondary);
}

.budget-actions .el-button:hover {
  background: var(--color-primary);
  color: #fff;
}

.quick-options {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.quick-tag {
  cursor: pointer;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 16px;
  color: var(--color-text-secondary);
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.loading-state {
  padding: 20px;
}

@media (max-width: 640px) {
  .budget-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .budget-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
```

**Step 2: 验证类型检查**

Run: `npm run type-check`

---

## Task 2: 添加路由配置

**Files:**

- Modify: `src/router/index.ts`

**Step 1: 添加路由**

在 children 数组中添加:

```typescript
{
  path: '/settings/budget',
  name: 'settings-budget',
  component: () => import('@/views/settings/BudgetView.vue'),
}
```

**Step 2: 验证**

Run: `npm run type-check`

---

## Task 3: 更新设置页面跳转

**Files:**

- Modify: `src/views/SettingsView.vue`

**Step 1: 更新跳转方法**

将 `goToPage` 方法改为实际跳转:

```typescript
const goToPage = (path: string) => {
  router.push(path)
}
```

---

## Task 4: 测试完整流程

**Step 1: 启动开发服务器**

Run: `npm run dev`

**Step 2: 验证功能**

1. 进入设置页面，点击"预算管理"
2. 跳转到 /settings/budget
3. 新增预算（含快捷选项）
4. 编辑预算
5. 删除预算

**Step 3: 运行检查**

Run: `npm run type-check && npm run lint`

---

## 总结

实现完成，需要修改的文件:

1. `src/views/settings/BudgetView.vue` - 新建页面
2. `src/router/index.ts` - 添加路由
3. `src/views/SettingsView.vue` - 已有跳转逻辑
