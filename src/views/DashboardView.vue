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
      <!-- 近期账单：全宽 -->
      <el-card
        class="dashboard-grid-card recently-bill card-full-width"
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
                <div class="bill-date">{{ item.displayDate }}</div>
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

      <!-- 预算执行情况：左列 -->
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

      <!-- 消费分类占比：右列 -->
      <el-card
        class="dashboard-grid-card Consumption-pie"
        :header-class="'recently-bill-card-header'"
      >
        <template #header>
          <strong class="card-header-title">消费分类占比</strong>
          <el-link class="card-header-link" @click.prevent="skipBill('/statistics')" underline="never"
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

      <!-- 消费趋势：全宽 -->
      <el-card
        class="dashboard-grid-card trend-card card-full-width"
        :header-class="'recently-bill-card-header'"
      >
        <template #header>
          <strong class="card-header-title">消费趋势</strong>
        </template>
        <div class="consumption-trend-chart" v-if="trendChartOption.xAxis.data.length === 0">
          <div class="common-empty-state">
            <strong>暂无趋势数据</strong>
          </div>
        </div>
        <div class="consumption-trend-chart" v-else>
          <v-chart :option="trendChartOption" />
        </div>
      </el-card>

      <!-- 类型管理：全宽 -->
      <el-card
        class="dashboard-grid-card category-list-card card-full-width"
        :header-class="'recently-bill-card-header'"
      >
        <template #header>
          <strong class="card-header-title">类型管理</strong>
          <el-link
            class="card-header-link"
            @click.prevent="skipBill('/settings/categories')"
            underline="never"
            >管理分类</el-link
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
                <span>新增</span>
              </div>
            </li>
          </ol>
        </div>
      </el-card>
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
import { BarChart, LineChart, PieChart } from 'echarts/charts'
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
import { use } from 'echarts/core'

use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  BarChart,
  LineChart,
  PieChart,
  CanvasRenderer,
])

interface DashboardBillItem extends FinanceTransactions {
  displayDate: string
}

interface ConsumptionStatisticItem {
  category: string
  consumption: number
}

interface ConsumerTrendItem {
  month: string
  totalIncome: number
  totalExpense: number
  totalBalance: number
}

interface ConsumptionChartOption {
  tooltip: {
    trigger: string
    formatter: string
  }
  legend: {
    orient: string
    right: string
    top: string
    data: Array<string>
  }
  series: [
    {
      name: string
      type: string
      radius: string
      center: Array<string>
      avoidLabelOverlap: boolean
      label: {
        show: boolean
      }
      labelLine: {
        show: boolean
      }
      data: Array<{
        value: number
        name: string
      }>
      emphasis: {
        itemStyle: {
          shadowBlur: number
          shadowOffsetX: number
          shadowColor: string
        }
      }
    },
  ]
}

interface TrendChartOption {
  tooltip: {
    trigger: string
  }
  legend: {
    top: number
    data: Array<string>
  }
  grid: {
    left: string
    right: string
    bottom: string
    containLabel: boolean
  }
  xAxis: {
    type: string
    data: Array<string>
  }
  yAxis: {
    type: string
  }
  series: Array<{
    name: string
    type: string
    smooth: boolean
    data: Array<number>
  }>
}

interface RawBudgetItem {
  id?: number
  category?: string
  categoryName?: string
  amount?: number | string
  cost?: number | string
  spent?: number | string
}

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

const recentlyBillList = ref<Array<DashboardBillItem>>([])

const chartOption = ref<ConsumptionChartOption>({
  color: ['#d8b4fe', '#a78bfa', '#6ee7b7', '#fca5a5', '#fcd34d', '#93c5fd'],
  tooltip: {
    trigger: 'item',
    formatter: '{a}<br/>{b}: {c}元 ({d}%)',
  },
  legend: {
    orient: 'vertical',
    right: '5%',
    top: 'center',
    data: [],
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
      data: [],
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

const trendChartOption = ref<TrendChartOption>({
  color: ['#6ee7b7', '#fca5a5', '#d8b4fe'],
  tooltip: {
    trigger: 'axis',
  },
  legend: {
    top: 0,
    data: ['收入', '支出', '结余'],
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: [] as Array<string>,
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      name: '收入',
      type: 'line',
      smooth: true,
      data: [] as Array<number>,
    },
    {
      name: '支出',
      type: 'line',
      smooth: true,
      data: [] as Array<number>,
    },
    {
      name: '结余',
      type: 'line',
      smooth: true,
      data: [] as Array<number>,
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

// 预算列表
interface BudgetItem {
  id?: number
  categoryName: string
  amount: number
  spent: number
}
const budgetList = ref<Array<BudgetItem>>([])

const addBillRef = ref()
const deletingIds = ref<Set<number | undefined>>(new Set()) // 正在删除的账单ID集合

const mapRecentlyBillList = (items: Array<FinanceTransactions>) => {
  return items.map((item) => ({
    ...item,
    displayDate: formatFriendlyTime(item.transactionDate),
  }))
}

const applyConsumptionChartData = (items: Array<ConsumptionStatisticItem>) => {
  chartOption.value.legend.data = items.map((item) => item.category || '未分类')
  chartOption.value.series[0].data = items.map((item) => ({
    value: item.consumption,
    name: item.category || '未分类',
  }))
}

const resetConsumptionChartData = () => {
  chartOption.value.legend.data = []
  chartOption.value.series[0].data = []
}

const applyTrendChartData = (items: Array<ConsumerTrendItem>) => {
  const sortedItems = [...items].sort((a, b) => a.month.localeCompare(b.month))
  trendChartOption.value.xAxis.data = sortedItems.map((item) => item.month)
  trendChartOption.value.series[0].data = sortedItems.map((item) => item.totalIncome)
  trendChartOption.value.series[1].data = sortedItems.map((item) => item.totalExpense)
  trendChartOption.value.series[2].data = sortedItems.map((item) => item.totalBalance)
}

const resetTrendChartData = () => {
  trendChartOption.value.xAxis.data = []
  trendChartOption.value.series[0].data = []
  trendChartOption.value.series[1].data = []
  trendChartOption.value.series[2].data = []
}

const mapBudgetItem = (item: RawBudgetItem): BudgetItem => ({
  id: item.id,
  categoryName: item.categoryName || item.category || '未分类',
  amount: Number(item.amount || 0),
  spent: Number(item.spent || item.cost || 0),
})

const getRecentMonthRange = (monthCount: number) => {
  const endDate = new Date()
  const startDate = new Date(endDate)
  startDate.setMonth(startDate.getMonth() - (monthCount - 1), 1)
  startDate.setHours(0, 0, 0, 0)

  return {
    startTime: startDate.getTime().toString(),
    endTime: endDate.getTime().toString(),
  }
}

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
    .catch((error: unknown) => {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请稍后重试')
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
      recentlyBillList.value = mapRecentlyBillList(res.data.data.result || [])
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
  const { monthStart, monthEnd } = getMonthRangeTimestamps() as {
    monthStart: string
    monthEnd: string
  }
  const { startTime: trendStart, endTime: trendEnd } = getRecentMonthRange(6)

  Promise.allSettled([
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
    }),
    billApi
      .getFinanceTransactionsList({
        startTime: monthStart,
        endTime: monthEnd,
        pageNum: 1,
        pageSize: 3,
      })
      .then((res) => {
        recentlyBillList.value = mapRecentlyBillList(res.data.data.result || [])
      })
      .catch((error) => {
        console.error('获取近期账单失败:', error)
        recentlyBillList.value = []
      }),
    billApi
      .getBudgetInfo({ startTime: monthStart, endTime: monthEnd, pageNum: 1, pageSize: 3 })
      .then((res) => {
        budgetList.value = ((res.data.data as Array<RawBudgetItem>) || []).map(mapBudgetItem)
      })
      .catch((error) => {
        console.error('获取预算失败:', error)
        budgetList.value = []
      }),
    billApi
      .consumptionStatistics({ startTime: monthStart, endTime: monthEnd })
      .then((res) => {
        applyConsumptionChartData((res.data.data as Array<ConsumptionStatisticItem>) || [])
      })
      .catch((error) => {
        console.error('获取消费分类占比失败:', error)
        resetConsumptionChartData()
      }),
    billApi
      .consumerTrends({
        startTime: trendStart,
        endTime: trendEnd,
        pageNum: 1,
        pageSize: 6,
      })
      .then((res) => {
        applyTrendChartData(res.data.data.result || [])
      })
      .catch((error) => {
        console.error('获取消费趋势失败:', error)
        resetTrendChartData()
      }),
    flashCategory(),
  ]).finally(() => {
    loadingInstance.close()
  })
})

//刷新分类（全宽卡片展示更多分类，pageSize 增大到 8）
const flashCategory = () => {
  return billApi.getCategory({ pageNum: 1, pageSize: 8 }).then((res) => {
    categoryList.value = res.data.data.result
  })
}
</script>

<style>
.recently-bill-card-header {
  padding: 10px;
  display: flex;
  border: 0;
}
</style>

<style scoped>
/* 图标选择 */
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
  border-radius: var(--radius-tag);
  background: var(--color-accent-subtle);
  transition: background var(--motion-fast);
  margin: 0 0 10px 0;
}

.icon-item:hover,
.icon-item.is-active {
  background: var(--color-accent);
  color: #fff;
}

.icon-item .el-icon {
  font-size: 24px;
}

.el-button--large {
  --el-button-size: 43px;
  font-size: 20px;
}

/* 仪表盘网格 */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.card-full-width {
  grid-column: span 2;
}

/* 玻璃卡片 */
.dashboard-grid-card {
  border-radius: var(--radius-card);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  box-shadow: var(--shadow-card);
}

/* 空状态 */
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

.budget-list-empty-state {
  display: flex;
  height: 200px;
}

/* 卡片标题 */
.card-header-title {
  flex: 70%;
  text-align: left;
  padding: 0 10px;
  color: var(--color-text-primary);
  font-weight: 600;
}

.card-header-link {
  flex: auto;
  text-align: center;
  color: var(--color-accent);
  background: transparent;
  font-size: 13px;
}

.card-header-link:hover {
  opacity: 0.75;
}

/* 统计概览 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

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
  transform: translateY(-3px);
  box-shadow: var(--shadow-accent);
}

.stat-card.income-card  { border-left: 3px solid var(--color-income); }
.stat-card.expense-card { border-left: 3px solid var(--color-expense); }
.stat-card.balance-card { border-left: 3px solid var(--color-accent); }

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.income-card  .stat-icon { background: rgba(6, 214, 160, 0.12); color: var(--color-income); }
.expense-card .stat-icon { background: rgba(220, 38, 38, 0.1);  color: var(--color-expense); }
.balance-card .stat-icon { background: var(--color-accent-subtle); color: var(--color-accent); }

.stat-info { flex: 1; min-width: 0; }

.stat-label {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
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
  transition: background var(--motion-fast);
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

.bill-info { display: flex; flex-direction: column; min-width: 0; }

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
  min-width: 70px;
  text-align: right;
}

.bill-amount.is-income { color: var(--color-income); }

.bill-actions { display: flex; gap: 8px; }

.bill-actions .el-button {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-tag);
  background: var(--color-accent-subtle);
  border: none;
}

.bill-actions .el-button:hover {
  background: var(--color-accent);
  color: #fff;
}

/* 预算 */
.budget-list-content { padding: 4px 0; }

.budget-item {
  margin-bottom: 14px;
  padding: 10px;
  background: var(--glass-bg-raised);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
}

.budget-item:last-child { margin-bottom: 0; }

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
  height: 6px;
  background: var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.budget-progress {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-strong));
  border-radius: 4px;
  transition: width var(--motion-slow);
}

.budget-progress.over {
  background: linear-gradient(90deg, var(--color-expense), #f87171);
}

/* 分类管理 */
.category-list-state {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 4px 0;
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
  color: var(--color-text-secondary);
}

/* 图表容器 */
.consumption-pie-chart {
  display: flex;
  height: 180px;
}

.consumption-trend-chart {
  display: flex;
  height: 220px;
}

/* Deep: el-card body padding */
:deep(.recently-bill .el-card__body) {
  padding: 0 10px 10px;
  height: 260px;
}

:deep(.budget-list-card .el-card__body) {
  padding: 8px 12px;
  min-height: 120px;
  max-height: 200px;
  overflow-y: auto;
}

:deep(.Consumption-pie .el-card__body) {
  padding: 0;
  height: 180px;
}

:deep(.trend-card .el-card__body) {
  padding: 0;
  height: 220px;
}

:deep(.category-list-card .el-card__body) {
  padding: 10px 12px 12px;
  height: auto;
}

/* 响应式 */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .card-full-width { grid-column: span 1; }
  .stat-card       { padding: 14px; }
  .stat-value      { font-size: 14px; }

  .recently-bill-item       { padding: 10px 4px; }
  .recently-bill-item-left  { gap: 10px; }
  .bill-icon                { width: 36px; height: 36px; font-size: 16px; }
  .recently-bill-item-right { gap: 10px; }
  .bill-amount              { font-size: 15px; min-width: 60px; }

  .bill-actions .el-button  { width: 28px; height: 28px; }
  .consumption-pie-chart    { height: 160px; }
  .consumption-trend-chart  { height: 180px; }

  :deep(.recently-bill .el-card__body),
  :deep(.budget-list-card .el-card__body),
  :deep(.Consumption-pie .el-card__body),
  :deep(.trend-card .el-card__body) {
    height: auto;
  }
}

@media (max-width: 480px) {
  .stats-overview { grid-template-columns: 1fr; gap: 10px; }
  .stat-card      { padding: 14px 16px; }
  .stat-value     { font-size: 16px; }
}
</style>
