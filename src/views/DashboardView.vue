<template>
  <div>
    <!-- 顶部数据概览 -->
    <div class="stats-overview">
      <div class="stat-card income-card">
        <div class="stat-icon">
          <el-icon>
            <ArrowDownBold />
          </el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">本月收入</div>
          <div class="stat-value">
            {{ overviewData.income.amount ? overviewData.income.amount : '-' }} 元
          </div>
        </div>
      </div>

      <div class="stat-card expense-card">
        <div class="stat-icon">
          <el-icon>
            <ArrowUpBold />
          </el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">本月支出</div>
          <div class="stat-value">
            {{ overviewData.expend.amount ? overviewData.expend.amount : '-' }} 元
          </div>
        </div>
      </div>

      <div class="stat-card balance-card">
        <div class="stat-icon">
          <el-icon>
            <Wallet />
          </el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">本月结余</div>
          <div class="stat-value">
            {{ overviewData.balance.amount ? overviewData.balance.amount : '-' }} 元
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- 左侧列 -->
      <div class="grid-column">
        <!-- 近期账单 -->
        <el-card
          class="dashboard-grid-card recently-bill"
          :header-class="'recently-bill-card-header'"
        >
          <template #header>
            <strong class="card-header-title">近期账单</strong>
            <el-link class="card-header-link" @click.prevent="skipBill('/bills')" underline="never"
              >查看全部</el-link
            >
          </template>
          <div class="recentlyBill-empty-state" v-if="recentlyBillList.length === 0">
            <div class="common-empty-state">
              <strong>当月暂无账单</strong>
            </div>
          </div>
          <div class="recently-bill-list" v-else>
            <div v-for="item in recentlyBillList" :key="item.id" class="recently-bill-item">
              <div class="recently-bill-item-left">
                <div class="bill-icon" :class="{ 'is-income': item.type === 1 }">
                  <el-icon>
                    <component :is="item.icon || 'Wallet'" />
                  </el-icon>
                </div>
                <div class="bill-info">
                  <div class="bill-category">{{ item.category || '未分类' }}</div>
                  <div class="bill-note" v-if="item.note">{{ item.note }}</div>
                  <div class="bill-date">{{ item.transactionDate }}</div>
                </div>
              </div>
              <div class="recently-bill-item-right">
                <span class="bill-amount" :class="{ 'is-income': item.type === 1 }">
                  {{ item.type === 1 ? '+' : '-' }}{{ item.amount }}
                </span>
                <div class="bill-actions">
                  <el-button :icon="Edit" circle size="small" text @click="handleEdit(item)" />
                  <el-button
                    :icon="deletingIds.has(item.id) ? Loading : Delete"
                    circle
                    size="small"
                    text
                    type="danger"
                    :disabled="deletingIds.has(item.id)"
                    @click="handleDelete(item)"
                  />
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 消费分类占比 -->
        <el-card
          class="dashboard-grid-card Consumption-pie"
          :header-class="'recently-bill-card-header'"
        >
          <template #header>
            <strong class="card-header-title">消费分类占比</strong>
            <el-link class="card-header-link" @click.prevent="skipBill('/bills')" underline="never"
              >查看详情</el-link
            >
          </template>
          <div class="consumption-pie-chart" v-if="chartOption.series[0].data.length === 0">
            <div class="common-empty-state">
              <strong>本月暂无数据</strong>
            </div>
          </div>
          <div class="consumption-pie-chart" v-else>
            <v-chart :option="chartOption" />
          </div>
        </el-card>

        <!-- 财务目标 -->
        <el-card
          class="dashboard-grid-card Financial-list-card"
          :header-class="'recently-bill-card-header'"
        >
          <template #header>
            <strong class="card-header-title">财务目标</strong>
            <el-link
              class="card-header-link"
              @click.prevent="skipBill('/settings/budget')"
              underline="never"
              >管理目标</el-link
            >
          </template>
          <div class="consumption-pie-chart" v-if="financialObjectives.length === 0">
            <div class="common-empty-state">
              <strong>暂未设置目标</strong>
            </div>
          </div>
          <div class="consumption-pie-chart" v-else>
            <!-- todo: 财务目标 -->
            <ol>
              <li v-for="(item, index) in financialObjectives" :key="index">
                <el-card shadow="never">
                  <div class="card-content">
                    <div class="card-title">
                      <div class="card-icon">
                        <img :src="item.icon" alt="" />
                      </div>
                      <div class="card-text">
                        <div class="card-text-title">{{ item.objective }}</div>
                      </div>
                    </div>
                  </div>
                </el-card>
              </li>
            </ol>
          </div>
        </el-card>
      </div>
      <!-- 右侧列 -->
      <div class="grid-column">
        <!-- 预算执行情况 -->
        <el-card
          class="dashboard-grid-card budget-list-card"
          :header-class="'recently-bill-card-header'"
        >
          <template #header>
            <strong class="card-header-title">预算执行情况</strong>
            <el-link
              class="card-header-link"
              @click.prevent="skipBill('/settings/budget')"
              underline="never"
              >查看全部</el-link
            >
          </template>
          <div class="budget-list-empty-state" v-if="budgetList.length === 0">
            <div class="common-empty-state">
              <strong>暂未设置预算</strong>
            </div>
          </div>
          <div v-else class="budget-list-content">
            <div v-for="item in budgetList" :key="item.id" class="budget-item">
              <div class="budget-header">
                <span class="budget-label">{{ item.categoryName }}</span>
                <span class="budget-value"> {{ item.spent || 0 }} / {{ item.amount }} 元 </span>
              </div>
              <div class="budget-bar">
                <div
                  class="budget-progress"
                  :style="{ width: `${Math.min(((item.spent || 0) / item.amount) * 100, 100)}%` }"
                  :class="{ over: (item.spent || 0) > item.amount }"
                ></div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 类型管理 -->
        <el-card
          class="dashboard-grid-card category-list-card"
          :header-class="'recently-bill-card-header'"
        >
          <template #header>
            <strong class="card-header-title">类型管理</strong>
            <el-link
              class="card-header-link"
              @click.prevent="skipBill('/settings/budget')"
              underline="never"
              >查看全部</el-link
            >
          </template>
          <div>
            <ol class="category-list-state">
              <li v-for="item in categoryList" :key="item.id">
                <div class="button-with-text">
                  <el-button
                    :icon="item.icon"
                    circle
                    size="large"
                    @click="openCategoryDialog(true, item)"
                  />
                  <span>{{ item.category }}</span>
                </div>
              </li>
              <li>
                <div class="button-with-text">
                  <el-button
                    :icon="ElIcons.Plus"
                    type="primary"
                    circle
                    size="large"
                    @click="openCategoryDialog(false, null)"
                  />
                  <span>更多</span>
                </div>
              </li>
            </ol>
          </div>
        </el-card>

        <!-- 消费趋势 -->
      </div>
    </div>

    <!-- 新增/编辑分类弹窗 -->
    <el-dialog
      v-model="showCategoryDialog"
      :title="isEditCategory ? '编辑分类' : '新增分类'"
      center
      :append-to-body="true"
    >
      <el-form
        ref="categoryFormRef"
        :model="category"
        @submit.prevent="submitCategory"
        label-position="top"
        :rules="newCategoryRules"
      >
        <el-form-item label="分类名称" prop="category">
          <el-input v-model="category.category" placeholder="请输入分类名称" />
        </el-form-item>

        <!-- 图标选择 -->
        <el-form-item label="选择图标" prop="icon">
          <el-scrollbar>
            <el-radio-group v-model="category.icon">
              <div class="icon-list">
                <el-radio-button
                  class="icon-item"
                  v-for="icon in iconOptions"
                  :key="icon.name"
                  :value="icon.name"
                >
                  <el-icon>
                    <component :is="icon.component" />
                  </el-icon>
                </el-radio-button>
              </div>
            </el-radio-group>
          </el-scrollbar>
        </el-form-item>

        <div style="text-align: center">
          <el-button @click="showCategoryDialog = false">取消</el-button>
          <el-button type="primary" native-type="submit">提交</el-button>
        </div>
      </el-form>
    </el-dialog>

    <!-- 账单编辑弹窗 -->
    <AddBillView
      ref="addBillRef"
      title="编辑账单"
      :showType="true"
      :showCategory="true"
      @success="refreshRecentlyBill"
    />
  </div>
</template>
<script setup lang="ts">
import router from '@/router'
import * as billApi from '@/services/bill'
import { formatFriendlyTime, getMonthRangeTimestamps } from '@/utils/commonUtil'
import * as ElIcons from '@element-plus/icons-vue'
import { Delete, Edit, Loading } from '@element-plus/icons-vue'
import { ElLoading, ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import VChart from 'vue-echarts'
import AddBillView from '@/views/AddBillView.vue'
// 引入需要的图表类型
import { BarChart, PieChart } from 'echarts/charts'
// 引入必要的组件（如 tooltip、legend 等）
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
// 引入 Canvas 渲染器（必须）
import { CanvasRenderer } from 'echarts/renderers'
// 局部注册需要的图表类型
import Category from '@/models/Category'
import type FinanceTransactions from '@/models/FinanceTransactions'
import type FinancialObjectives from '@/models/FinancialObjectives'
import { use } from 'echarts/core'

use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  BarChart,
  PieChart,
  CanvasRenderer,
])

// 控制弹窗显示
const showCategoryDialog = ref(false)
const overviewData: {
  income: {
    amount: number
    type: number
    ratio: string
    ratioType: number
  }
  expend: {
    amount: number
    type: number
    ratio: string
    ratioType: number
  }
  balance: {
    amount: number
    type: number
    ratio: string
    ratioType: number
  }
} = reactive({
  income: {
    amount: 0,
    type: 0,
    ratio: '0%',
    ratioType: 0,
  },
  expend: {
    amount: 0,
    type: 0,
    ratio: '0%',
    ratioType: 0,
  },
  balance: {
    amount: 0,
    type: 0,
    ratio: '0%',
    ratioType: 0,
  },
})

const recentlyBillList = ref<Array<FinanceTransactions>>([])

const chartOption = ref({
  tooltip: {
    trigger: 'item',
    formatter: '{a}<br/>{b}: {c}元 ({d}%)',
  },
  legend: {
    orient: 'vertical',
    right: '5%',
    top: 'center',
    data: ['餐饮', '交通', '购物', '娱乐', '其他'],
  },
  series: [
    {
      name: '消费分类',
      type: 'pie',
      radius: '80%',
      center: ['30%', '50%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
      },
      labelLine: {
        show: false,
      },
      data: [
        { value: 1048, name: '餐饮' },
        { value: 732, name: '交通' },
        { value: 530, name: '购物' },
        { value: 310, name: '娱乐' },
        { value: 274, name: '其他' },
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    },
  ],
})

// 图标选项列表
const iconOptions = Object.keys(ElIcons).map((key) => ({
  name: key,
  component: ElIcons[key as keyof typeof ElIcons],
}))

const newCategoryRules = reactive<FormRules<Category>>({
  category: [{ required: true, message: '请输入分类名', trigger: ['blur'] }],
  icon: [{ required: true, message: '请选择图标', trigger: ['blur'] }],
})

const categoryList = ref<Array<Category>>([])

const isEditCategory = ref(false)
const categoryFormRef = ref<FormInstance>()
const category = ref(new Category('', '', 0))

const financialObjectives = ref<Array<FinancialObjectives>>([])

// 预算列表
interface BudgetItem {
  id: number
  categoryId: number
  categoryName: string
  amount: number
  spent: number
}
const budgetList = ref<Array<BudgetItem>>([])

const addBillRef = ref()
const deletingIds = ref<Set<number | undefined>>(new Set()) // 正在删除的账单ID集合

const handleEdit = (item: FinanceTransactions) => {
  addBillRef.value.open({
    id: item.id,
    type: item.type,
    amount: item.amount,
    categoryId: item.categoryId,
    transactionDate: item.transactionDate,
    note: item.note,
  })
}

const handleDelete = (item: FinanceTransactions) => {
  if (!item.id || deletingIds.value.has(item.id)) return

  // 标记为正在删除
  deletingIds.value.add(item.id)

  billApi
    .deleteFinanceTransactions(item.id)
    .then(() => {
      ElMessage.success('删除成功')
      refreshRecentlyBill()
    })
    .catch((error: any) => {
      console.error('删除失败:', error)
      ElMessage.error(error?.response?.data?.msg || '删除失败，请稍后重试')
    })
    .finally(() => {
      deletingIds.value.delete(item.id)
    })
}

const refreshRecentlyBill = () => {
  const { monthStart, monthEnd } = getMonthRangeTimestamps() as {
    monthStart: string
    monthEnd: string
  }
  billApi
    .getFinanceTransactionsList({
      startTime: monthStart,
      endTime: monthEnd,
      pageNum: 1,
      pageSize: 3,
    })
    .then((res) => {
      recentlyBillList.value = res.data.data.result
      recentlyBillList.value.forEach((item) => {
        item.transactionDate = formatFriendlyTime(item.transactionDate)
      })
    })
}

//打开编辑/新增分类弹窗
const openCategoryDialog = (isEdit: boolean, item: Category | null) => {
  isEditCategory.value = isEdit
  if (isEdit && item) {
    category.value = new Category(item.category, item.icon, item.id)
  } else {
    category.value = Category.getCategory()
  }
  categoryFormRef.value?.resetFields()
  // 打开弹窗
  showCategoryDialog.value = true
}

// 提交分类的方法
const submitCategory = () => {
  // 这里可以调用 API 或者触发父组件事件
  categoryFormRef.value?.validate((valid) => {
    if (!valid) {
      ElMessage.error('请检查必填项是否填写完整！')
      return
    }
    const payload = (({ id, category, icon }) =>
      id ? { category, icon, id } : { category, icon })(category.value)
    billApi.saveCategory(payload).then(() => {
      ElMessage.success('添加成功')
      // 提交后清空数据
      category.value.category = ''
      category.value.icon = ''
      category.value.id = 0
      flashCategory()
      showCategoryDialog.value = false
    })
  })
}

const skipBill = (to: string) => {
  router.push(to)
}

onMounted(() => {
  // 显示加载动画
  const loadingInstance = ElLoading.service({
    fullscreen: true,
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.5)',
  })
  try {
    const { monthStart, monthEnd } = getMonthRangeTimestamps() as {
      monthStart: string
      monthEnd: string
    }
    // 获取渲染数据
    // 顶部数据概览
    billApi.getCashFlowCard({ startTime: monthStart, endTime: monthEnd }).then((res) => {
      const dataList = res.data.data as Array<{
        amount: number
        type: number
        ratio: string
        ratioType: number
      }>
      dataList.forEach((item) => {
        if (item.type === 1) {
          overviewData.income.amount = item.amount
          overviewData.income.ratio = item.ratio || '0%'
          overviewData.income.ratioType = item.ratioType
        } else if (item.type === 2) {
          overviewData.expend.amount = item.amount
          overviewData.expend.ratio = item.ratio || '0%'
          overviewData.expend.ratioType = item.ratioType
        } else if (item.type === 3) {
          overviewData.balance.amount = item.amount
          overviewData.balance.ratio = item.ratio || '0%'
          overviewData.balance.ratioType = item.ratioType
        }
      })
    })

    // 近期账单
    billApi
      .getFinanceTransactionsList({
        startTime: monthStart,
        endTime: monthEnd,
        pageNum: 1,
        pageSize: 3,
      })
      .then((res) => {
        recentlyBillList.value = res.data.data.result
        recentlyBillList.value.forEach((item) => {
          item.transactionDate = formatFriendlyTime(item.transactionDate)
        })
      })

    //预算执行情况
    billApi
      .getBudgetInfo({ startTime: monthStart, endTime: monthEnd, pageNum: 1, pageSize: 3 })
      .then((res) => {
        console.log('预算数据:', res.data.data)
        budgetList.value = res.data.data.result || []
      })
      .catch((err) => {
        console.error('获取预算失败:', err)
      })

    //消费分类占比

    //类型管理
    flashCategory()

    //财务目标
    billApi.financialObjectives({ pageNum: 1, pageSize: 2 }).then((res) => {
      financialObjectives.value = res.data.data.result
    })
  } catch (error) {
    console.error('API 请求失败:', error)
    ElMessage.error('数据加载失败，请重试')
  } finally {
    loadingInstance.close()
  }
})

//刷新分类
const flashCategory = () => {
  billApi.getCategory({ pageNum: 1, pageSize: 4 }).then((res) => {
    categoryList.value = res.data.data.result
  })
}
</script>

<style>
/* 近期账单 */
.recently-bill-card-header {
  padding: 10px;
  display: flex;
  border: 0cap;
}
</style>

<style scoped>
.icon-list {
  display: flex;
  gap: 10px;
  padding: 0;
  margin: 0;
}

.icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background-color: var(--color-bg-input);
  transition: all 0.3s ease;
  margin: 0px 0px 10px 0px;
}

.icon-item:hover,
.icon-item.is-active {
  background-color: var(--color-primary-light);
}

.icon-item .el-icon {
  font-size: 24px;
}

.el-button--large {
  --el-button-size: 43px;
  font-size: 20px;
}

/* 网格布局 */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.grid-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.common-empty-state {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: var(--color-text-secondary);
  flex: 1;
}

.recentlyBill-empty-state {
  display: flex;
  height: 250px;
}

.budget-list-empty-state {
  display: flex;
  height: 200px;
}

.budget-list-content {
  padding: 4px 0;
}

.budget-item {
  margin-bottom: 14px;
  padding: 10px;
  background: var(--color-bg-input);
  border-radius: 12px;
}

.budget-item:last-child {
  margin-bottom: 0;
}

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.budget-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.budget-value {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.budget-bar {
  height: 8px;
  background: var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.budget-progress {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
  border-radius: 4px;
  transition: width 0.3s ease;
}

.budget-progress.over {
  background: linear-gradient(90deg, var(--color-danger), #f87171);
}

.category-list-state {
  display: flex;
  height: 60px;
  gap: 10px;
}

.category-list-state li {
  justify-content: center;
  align-items: center;
  display: flex;
}

.button-with-text {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.button-with-text span {
  margin-top: 5px;
  font-size: 12px;
}

.consumption-pie-chart {
  display: flex;
  height: 180px;
}

.card-header-title {
  flex: 70%;
  text-align: left;
  padding: 0px 10px;
}

.card-header-link {
  flex: auto;
  text-align: center;
  color: var(--color-primary);
  background-color: transparent;
}

.card-header-link:hover {
  opacity: 0.7;
}

.dashboard-grid-card {
  border-radius: var(--radius-card);
  background: var(--color-bg-card);
}

:deep(.recently-bill .el-card__body) {
  padding: 0px 10px 10px 10px;
  height: 260px;
}

:deep(.budget-list-card .el-card__body) {
  padding: 8px 12px;
  min-height: 120px;
  max-height: 200px;
  overflow-y: auto;
}

:deep(.Consumption-pie .el-card__body) {
  padding: 0px;
  height: 180px;
}

:deep(.category-list-card .el-card__body) {
  padding: 0px 10px 10px 10px;
  height: 70px;
}

:deep(.stat-card .el-card__body) {
  padding: 0px;
  display: flex;
  width: 150px;
  height: 45px;
}

/* 顶部数据概览 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

/* 统计卡片基础样式 */
.stat-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow-card);
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-button);
}

/* 收入卡片 */
.stat-card.income-card {
  border-left-color: var(--color-success);
}

.stat-card.income-card .stat-icon {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
}

/* 支出卡片 */
.stat-card.expense-card {
  border-left-color: var(--color-danger);
}

.stat-card.expense-card .stat-icon {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
}

/* 结余卡片 */
.stat-card.balance-card {
  border-left-color: var(--color-primary);
}

.stat-card.balance-card .stat-icon {
  background: rgba(20, 184, 166, 0.1);
  color: var(--color-primary);
}

/* 图标 */
.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* 文字信息 */
.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 近期账单列表 */
.recently-bill-list {
  display: flex;
  flex-direction: column;
}

.recently-bill-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 8px;
  border-radius: 12px;
  transition: background-color 0.2s ease;
}

.recently-bill-item:hover {
  background-color: var(--color-bg-input);
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
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
  font-size: 18px;
  flex-shrink: 0;
}

.bill-icon.is-income {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
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
  color: var(--color-text-disabled);
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
  color: var(--color-danger);
  min-width: 70px;
  text-align: right;
}

.bill-amount.is-income {
  color: var(--color-success);
}

.bill-actions {
  display: flex;
  gap: 8px;
}

.bill-actions .el-button {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--color-bg-input);
  border: none;
}

.bill-actions .el-button:hover {
  background: var(--color-primary);
  color: #fff;
}

/* 响应式 */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .stats-overview {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .stat-card {
    padding: 14px;
  }

  .stat-value {
    font-size: 14px;
  }

  .recently-bill-item {
    padding: 10px 4px;
  }

  .recently-bill-item-left {
    gap: 10px;
  }

  .bill-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .recently-bill-item-right {
    gap: 10px;
  }

  .bill-amount {
    font-size: 15px;
    min-width: 60px;
  }

  .bill-actions .el-button {
    width: 28px;
    height: 28px;
  }

  .category-list-state {
    flex-wrap: wrap;
    height: auto;
    justify-content: flex-start;
  }

  .consumption-pie-chart {
    height: 160px;
  }

  :deep(.recently-bill .el-card__body),
  :deep(.budget-list-card .el-card__body),
  :deep(.Consumption-pie .el-card__body),
  :deep(.category-list-card .el-card__body) {
    height: auto;
  }
}
</style>
