<template>
  <div>
    <!-- 顶部数据概览（Task 3: 统计概览行 3 列） -->
    <div class="stats-overview">
      <!-- 收入卡片 -->
      <div class="stat-card income-card">
        <div class="stat-icon income-icon">
          <el-icon><ArrowDownBold /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">本月收入</div>
          <div class="stat-value">
            {{ overviewData.income.amount ? overviewData.income.amount : '-' }} 元
          </div>
          <div class="stat-sub">本月</div>
        </div>
      </div>

      <!-- 支出卡片 -->
      <div class="stat-card expense-card">
        <div class="stat-icon expense-icon">
          <el-icon><ArrowUpBold /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">本月支出</div>
          <div class="stat-value">
            {{ overviewData.expend.amount ? overviewData.expend.amount : '-' }} 元
          </div>
          <div class="stat-sub">本月</div>
        </div>
      </div>

      <!-- 结余卡片 -->
      <div class="stat-card balance-card">
        <div class="stat-icon balance-icon">
          <el-icon><Wallet /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">本月结余</div>
          <div class="stat-value">
            {{ overviewData.balance.amount ? overviewData.balance.amount : '-' }} 元
          </div>
          <div class="stat-sub">本月</div>
        </div>
      </div>
    </div>

    <!-- 主网格布局（Task 3: 新 Grid 布局顺序） -->
    <div class="dashboard-grid">
      <!-- 预算执行情况：左列（Task 4/6） -->
      <el-card
        class="dashboard-grid-card budget-list-card"
        :header-class="'dashboard-card-header'"
      >
        <template #header>
          <strong class="card-header-title">预算执行情况</strong>
          <span
            class="card-header-pill"
            @click="skipBill('/settings/budget')"
          >查看全部</span>
        </template>
        <div class="budget-list-empty-state" v-if="budgetList.length === 0">
          <div class="common-empty-state">
            <strong>暂未设置预算</strong>
          </div>
        </div>
        <div v-else class="budget-list-content">
          <div v-for="item in budgetList" :key="item.id" class="budget-item">
            <div class="budget-header">
              <!-- 分类图标：有图标则显示，否则显示首字母缩写圆圈（Task 6） -->
              <div class="budget-category-icon">
                <template v-if="item.icon">
                  <el-icon><component :is="item.icon" /></el-icon>
                </template>
                <template v-else>
                  <span class="budget-abbr">{{ (item.categoryName || '?')[0] }}</span>
                </template>
              </div>
              <span class="budget-label">{{ item.categoryName }}</span>
              <!-- 超支标记（Task 6） -->
              <template v-if="(item.spent || 0) > item.amount">
                <el-icon class="over-budget-icon"><WarningFilled /></el-icon>
                <span class="over-budget-text">超支</span>
              </template>
              <span
                class="budget-percent"
                :class="getBudgetPercentClass(item.spent || 0, item.amount)"
              >{{ getBudgetPercent(item.spent || 0, item.amount) }}%</span>
            </div>
            <!-- 进度条（Task 6） -->
            <div class="budget-bar">
              <div
                class="budget-progress"
                :style="{ width: `${Math.min(((item.spent || 0) / item.amount) * 100, 100)}%` }"
                :class="{ over: (item.spent || 0) > item.amount }"
              ></div>
            </div>
            <div class="budget-value">{{ item.spent || 0 }} / {{ item.amount }} 元</div>
          </div>
        </div>
      </el-card>

      <!-- 消费分类占比：右列（Task 8: Donut 环形图） -->
      <el-card
        class="dashboard-grid-card consumption-pie"
        :header-class="'dashboard-card-header'"
      >
        <template #header>
          <strong class="card-header-title">消费分类占比</strong>
          <span
            class="card-header-pill"
            @click="skipBill('/statistics')"
          >查看详情</span>
        </template>
        <div class="consumption-pie-chart" v-if="chartOption.series[0].data.length === 0">
          <div class="common-empty-state">
            <strong>本月暂无数据</strong>
          </div>
        </div>
        <div class="consumption-pie-chart" v-else>
          <v-chart :option="chartOption" autoresize />
        </div>
      </el-card>

      <!-- 近期账单：全宽（Task 5/7） -->
      <el-card
        class="dashboard-grid-card recently-bill card-full-width"
        :header-class="'dashboard-card-header'"
      >
        <template #header>
          <strong class="card-header-title">近期账单</strong>
          <span
            class="card-header-pill"
            @click="skipBill('/bills')"
          >查看全部</span>
        </template>
        <div class="recentlyBill-empty-state" v-if="recentlyBillList.length === 0">
          <div class="common-empty-state">
            <strong>当月暂无账单</strong>
          </div>
        </div>
        <div class="recently-bill-list" v-else>
          <div
            v-for="(item, index) in recentlyBillList"
            :key="item.id"
            class="recently-bill-item"
            :class="{ 'no-border': index === recentlyBillList.length - 1 }"
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

      <!-- 消费趋势：全宽（Task 9: 面积图） -->
      <el-card
        class="dashboard-grid-card trend-card card-full-width"
        :header-class="'dashboard-card-header'"
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
          <v-chart :option="trendChartOption" autoresize />
        </div>
      </el-card>
    </div>

    <!-- 账单编辑弹窗（保留，Task 2 只移除分类管理弹窗） -->
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
import { ArrowDownBold, ArrowUpBold, Delete, Edit, Loading, Wallet, WarningFilled } from '@element-plus/icons-vue'
import { ElLoading, ElMessage } from 'element-plus'
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import VChart from 'vue-echarts'
import AddBillView from '@/views/AddBillView.vue'
// 引入需要的图表类型
import { BarChart, LineChart, PieChart } from 'echarts/charts'
// 引入必要的组件（如 tooltip、legend 等）
import {
  GraphicComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
// 引入 Canvas 渲染器（必须）
import { CanvasRenderer } from 'echarts/renderers'
import type FinanceTransactions from '@/models/FinanceTransactions'
import { use } from 'echarts/core'

use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  GraphicComponent,
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
  color?: string[]
  tooltip: {
    trigger: string
    formatter: string
  }
  legend: {
    orient: string
    right?: string
    top?: string
    bottom?: number
    left?: string
    type?: string
    itemWidth?: number
    itemHeight?: number
    itemGap?: number
    textStyle?: Record<string, unknown>
    data: Array<string>
  }
  graphic: Array<Record<string, unknown>>
  series: [
    {
      name: string
      type: string
      radius: string | string[]
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

interface TrendSeriesItem {
  name: string
  type: string
  smooth: boolean
  areaStyle: {
    color: {
      type: string
      x: number
      y: number
      x2: number
      y2: number
      colorStops: Array<{ offset: number; color: string }>
    }
    opacity: number
  }
  data: Array<number>
}

interface TrendChartOption {
  color?: string[]
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
  series: Array<TrendSeriesItem>
}

interface RawBudgetItem {
  id?: number
  category?: string
  categoryName?: string
  icon?: string
  amount?: number | string
  cost?: number | string
  spent?: number | string
}

const overviewData: {
  income: { amount: number; type: number; ratio: string; ratioType: number }
  expend: { amount: number; type: number; ratio: string; ratioType: number }
  balance: { amount: number; type: number; ratio: string; ratioType: number }
} = reactive({
  income: { amount: 0, type: 0, ratio: '0%', ratioType: 0 },
  expend: { amount: 0, type: 0, ratio: '0%', ratioType: 0 },
  balance: { amount: 0, type: 0, ratio: '0%', ratioType: 0 },
})

const recentlyBillList = ref<Array<DashboardBillItem>>([])

// ─── 消费分类饼图（Task 8: Donut 环形图）───
const chartOption = ref<ConsumptionChartOption>({
  color: ['#d8b4fe', '#a78bfa', '#6ee7b7', '#fca5a5', '#fcd34d', '#93c5fd'],
  tooltip: {
    trigger: 'item',
    formatter: '{a}<br/>{b}: {c}元 ({d}%)',
  },
  legend: {
    orient: 'vertical',
    right: '15%',
    top: 'middle',
    type: 'scroll',
    data: [],
    itemWidth: 15,
    itemHeight: 15,
    itemGap: 15,
    textStyle: { fontSize: 15 },
  },
  graphic: [],
  series: [
    {
      name: '消费分类',
      type: 'pie',
      radius: ['46%', '85%'],
      center: ['41%', '50%'],
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

// ─── 消费趋势面积图（Task 9）───
const trendColors = ['#6ee7b7', '#fca5a5', '#d8b4fe']

const trendChartOption = ref<TrendChartOption>({
  color: trendColors,
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
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(110, 231, 183, 0.3)' },
            { offset: 1, color: 'rgba(110, 231, 183, 0)' },
          ],
        },
        opacity: 1,
      },
      data: [] as Array<number>,
    },
    {
      name: '支出',
      type: 'line',
      smooth: true,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(252, 165, 165, 0.3)' },
            { offset: 1, color: 'rgba(252, 165, 165, 0)' },
          ],
        },
        opacity: 1,
      },
      data: [] as Array<number>,
    },
    {
      name: '结余',
      type: 'line',
      smooth: true,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(216, 180, 254, 0.3)' },
            { offset: 1, color: 'rgba(216, 180, 254, 0)' },
          ],
        },
        opacity: 1,
      },
      data: [] as Array<number>,
    },
  ],
})

// 预算列表
interface BudgetItem {
  id?: number
  categoryName: string
  icon?: string
  amount: number
  spent: number
}
const budgetList = ref<Array<BudgetItem>>([])

const addBillRef = ref()
const deletingIds = ref<Set<number | undefined>>(new Set())

// ─── 数据处理函数（不可改动）───
const mapRecentlyBillList = (items: Array<FinanceTransactions>) => {
  return items.map((item) => ({
    ...item,
    displayDate: formatFriendlyTime(item.transactionDate),
  }))
}

// ECharts graphic 使用 canvas 渲染，不支持 CSS 变量；每次调用时实时读取计算值
const graphicTotal = ref(0)

const buildGraphic = (total: number): Array<Record<string, unknown>> => {
  const rootStyle = getComputedStyle(document.documentElement)
  const primaryColor = rootStyle.getPropertyValue('--color-text-primary').trim() || '#ffffff'
  const mutedColor = rootStyle.getPropertyValue('--color-text-muted').trim() || '#9ca3af'
  return [
    {
      type: 'text',
      left: '38%',
      top: '42%',
      style: { text: `${total}`, textAlign: 'center', fill: primaryColor, fontSize: 18, fontWeight: 'bold' },
    },
    {
      type: 'text',
      left: '38%',
      top: '53%',
      style: { text: '总支出', textAlign: 'center', fill: mutedColor, fontSize: 11 },
    },
  ]
}

const applyConsumptionChartData = (items: Array<ConsumptionStatisticItem>) => {
  chartOption.value.legend.data = items.map((item) => item.category || '未分类')
  chartOption.value.series[0].data = items.map((item) => ({
    value: item.consumption,
    name: item.category || '未分类',
  }))
  graphicTotal.value = items.reduce((sum, item) => sum + (item.consumption || 0), 0)
  chartOption.value.graphic = buildGraphic(graphicTotal.value)
}

const resetConsumptionChartData = () => {
  chartOption.value.legend.data = []
  chartOption.value.series[0].data = []
  chartOption.value.graphic = []
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

const getBudgetPercent = (spent: number, amount: number) =>
  amount > 0 ? Math.min(Math.round((spent / amount) * 100), 999) : 0

const getBudgetPercentClass = (spent: number, amount: number) => {
  const p = amount > 0 ? (spent / amount) * 100 : 0
  if (p >= 100) return 'percent-danger'
  if (p >= 70) return 'percent-warn'
  return 'percent-normal'
}

const mapBudgetItem = (item: RawBudgetItem): BudgetItem => ({
  id: item.id,
  categoryName: item.categoryName || item.category || '未分类',
  icon: item.icon,
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

// ─── 业务逻辑（不可改动）───
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

const skipBill = (to: string) => {
  router.push(to)
}

onMounted(() => {
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
  ]).finally(() => {
    loadingInstance.close()
  })

  // 监听主题切换，实时刷新 graphic 颜色（canvas 不支持 CSS 变量）
  themeObserver = new MutationObserver(() => {
    if (chartOption.value.graphic.length > 0) {
      chartOption.value.graphic = buildGraphic(graphicTotal.value)
    }
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

let themeObserver: MutationObserver | null = null
onUnmounted(() => themeObserver?.disconnect())
</script>

<!-- 全局样式：el-card header -->
<style>
.dashboard-card-header {
  padding: 10px 14px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--glass-border);
}
</style>

<style scoped>
/* ===================================================
   仪表盘网格（Task 3）
   =================================================== */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.card-full-width {
  grid-column: span 2;
}

/* ===================================================
   玻璃卡片通用样式（Task 5）
   =================================================== */
.dashboard-grid-card {
  border-radius: var(--radius-card);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow:
    0 4px 24px rgba(124, 58, 237, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

/* 深色模式内层阴影（Task 5） */
:global(.dark) .dashboard-grid-card {
  box-shadow:
    0 4px 24px rgba(124, 58, 237, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

/* ===================================================
   卡片标题（Task 5）
   =================================================== */
.card-header-title {
  flex: 1;
  text-align: left;
  padding: 0 4px;
  color: var(--color-text-primary);
  font-size: 15px;
  font-weight: 600;
}

/* pill 小按钮（Task 5） */
.card-header-pill {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  background: var(--color-accent-subtle);
  color: var(--color-accent);
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  transition: background var(--motion-fast), color var(--motion-fast);
  white-space: nowrap;
  user-select: none;
}

.card-header-pill:hover {
  background: var(--color-accent);
  color: #fff;
}

/* ===================================================
   空状态
   =================================================== */
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

/* ===================================================
   统计概览（Task 2/4）
   =================================================== */
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

/* 左侧彩色竖条 4px（Task 4） */
.stat-card.income-card  { border-left: 4px solid var(--color-income); }
.stat-card.expense-card { border-left: 4px solid var(--color-expense); }
.stat-card.balance-card { border-left: 4px solid var(--color-accent); }

/* 图标区 48×48px 圆角 14px（Task 4） */
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

/* 数字 24px 800（Task 4） */
.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

/* 「本月」固定标签（Task 4） */
.stat-sub {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 3px;
}

/* ===================================================
   近期账单（Task 7）
   =================================================== */
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

/* 最后一行不显示分隔线（Task 7） */
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

/* 金额列（Task 7） */
.bill-amount {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-expense);
  font-variant-numeric: tabular-nums;
  min-width: 80px;
  text-align: right;
}

.bill-amount.is-income { color: var(--color-income); }

/* 操作按钮：默认隐藏，hover 时显示（Task 7） */
.bill-actions { display: flex; gap: 8px; }

.bill-actions .el-button {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-tag);
  background: var(--color-accent-subtle);
  border: none;
  opacity: 0;
  pointer-events: none;
  transition: opacity 150ms ease-out, background var(--motion-fast);
}

.recently-bill-item:hover .bill-actions .el-button {
  opacity: 1;
  pointer-events: auto;
}

.bill-actions .el-button:hover {
  background: var(--color-accent);
  color: #fff;
}

/* ===================================================
   预算（Task 4/6）
   =================================================== */
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
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

/* 分类图标 16px（Task 6） */
.budget-category-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
  color: var(--color-accent);
}

.budget-abbr {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-accent-subtle);
  color: var(--color-accent);
  font-size: 10px;
  font-weight: 600;
}

.budget-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  flex: 1;
}

.budget-value {
  font-size: 11px;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
  margin-top: 4px;
  text-align: right;
}

.budget-percent {
  margin-left: auto;
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  min-width: 40px;
  text-align: right;
}
.percent-normal { color: var(--color-accent); }
.percent-warn   { color: #f59e0b; }
.percent-danger { color: var(--color-expense); }

/* 超支标记（Task 6） */
.over-budget-icon {
  color: var(--color-expense);
  font-size: 14px;
}

.over-budget-text {
  font-size: 11px;
  color: var(--color-expense);
  font-weight: 600;
}

/* 进度条 10px 圆角 6px（Task 6） */
.budget-bar {
  position: relative;
  height: 10px;
  background: var(--color-border);
  border-radius: 6px;
  overflow: visible;
}

.budget-progress {
  position: relative;
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-strong));
  border-radius: 6px;
  transition: width var(--motion-slow);
  overflow: visible;
}

/* 正常状态：进度末端白色光点（Task 6） */
.budget-progress:not(.over)::after {
  content: '';
  position: absolute;
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 6px rgba(124, 58, 237, 0.6);
}

.budget-progress.over {
  background: linear-gradient(90deg, var(--color-expense), #f87171);
}

/* ===================================================
   图表容器（Task 10: 响应式高度）
   =================================================== */
.consumption-pie-chart {
  display: flex;
  height: 240px;
}

.consumption-trend-chart {
  display: flex;
  height: 260px;
}

/* ===================================================
   el-card 内部 padding（Deep）
   =================================================== */
:deep(.recently-bill .el-card__body) {
  padding: 0 10px 10px;
}

:deep(.budget-list-card .el-card__body) {
  padding: 8px 12px;
  min-height: 120px;
  max-height: 260px;
  overflow-y: auto;
}

:deep(.consumption-pie .el-card__body) {
  padding: 0;
  height: 240px;
}

:deep(.trend-card .el-card__body) {
  padding: 0;
  height: 260px;
}

/* ===================================================
   自定义滚动条 — 紫罗兰玻璃态风格
   作用域：预算执行卡片的 el-card__body（overflow-y: auto）
   =================================================== */

/* Firefox */
:deep(.budget-list-card .el-card__body) {
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
}

/* Webkit（Chrome / Safari / Edge）*/
:deep(.budget-list-card .el-card__body)::-webkit-scrollbar {
  width: 4px;
}

:deep(.budget-list-card .el-card__body)::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
  border-radius: 4px;
}

:deep(.budget-list-card .el-card__body)::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 4px;
  transition: background 150ms ease-out;
}

:deep(.budget-list-card .el-card__body)::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}

/* ===================================================
   响应式（Task 10）
   =================================================== */

/* 768px – 1024px：2 列网格，数字 20px，饼图 180px，趋势 220px */
@media (max-width: 1024px) and (min-width: 769px) {
  .stat-value { font-size: 20px; }

  .consumption-pie-chart { height: 220px; }
  .consumption-trend-chart { height: 220px; }

  :deep(.consumption-pie .el-card__body) { height: 220px; }
  :deep(.trend-card .el-card__body) { height: 220px; }
}

/* ≤768px：单列，数字 18px，饼图 160px，趋势 180px */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .card-full-width { grid-column: span 1; }
  .stat-card       { padding: 14px; }
  .stat-value      { font-size: 18px; }

  .recently-bill-item       { padding: 10px 4px; }
  .recently-bill-item-left  { gap: 10px; }
  .bill-icon                { width: 36px; height: 36px; font-size: 16px; }
  .recently-bill-item-right { gap: 10px; }
  .bill-amount              { font-size: 15px; min-width: 80px; }

  /* 移动端按钮始终可见，28×28px（Task 7） */
  .bill-actions .el-button {
    width: 28px;
    height: 28px;
    opacity: 1;
    pointer-events: auto;
  }

  .consumption-pie-chart  { height: 200px; }
  .consumption-trend-chart { height: 180px; }

  :deep(.recently-bill .el-card__body),
  :deep(.budget-list-card .el-card__body) {
    height: auto;
    max-height: none;
  }

  :deep(.consumption-pie .el-card__body) { height: 200px; }
  :deep(.trend-card .el-card__body) { height: 180px; }
}

/* ≤480px：单列竖排，数字 20px（Task 10） */
@media (max-width: 480px) {
  .stats-overview {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .stat-card  { padding: 14px 16px; }
  .stat-value { font-size: 20px; }
}
</style>
