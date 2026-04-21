<template>
  <div>
    <div class="dashboard-range-switch">
      <div class="range-chip" :class="{ active: rangeMode === 'month' }" @click="rangeMode = 'month'">
        本月
      </div>
      <div
        class="range-chip"
        :class="{ active: rangeMode === 'quarter' }"
        @click="rangeMode = 'quarter'"
      >
        近 3 月
      </div>
      <div class="range-chip" :class="{ active: rangeMode === 'year' }" @click="rangeMode = 'year'">
        本年
      </div>
    </div>

    <DashboardOverviewCards :data="overviewData" />

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
            @click="skipBill('/bills')"
          >查看账单</span>
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
        <DashboardRecentBills
          :items="recentlyBillList"
          :deleting-ids="deletingIds"
          @edit="handleEdit"
          @delete="handleDelete"
        />
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
import { useThemeStore } from '@/stores/useThemeStore'
import { WarningFilled } from '@element-plus/icons-vue'
import { ElLoading, ElMessage } from 'element-plus'
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import VChart from 'vue-echarts'
import AddBillView from '@/views/AddBillView.vue'
import DashboardOverviewCards from '@/views/dashboard/components/DashboardOverviewCards.vue'
import DashboardRecentBills from '@/views/dashboard/components/DashboardRecentBills.vue'
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
import type {
  DashboardOverviewData,
  BudgetItem,
  ConsumptionChartOption,
  ConsumptionStatisticItem,
  DashboardBillItem,
  RangeMode,
  RawBudgetItem,
  TrendChartOption,
} from '@/views/dashboard/types'
import {
  applyConsumptionChartData,
  applyTrendChartData,
  getBudgetPercent,
  getBudgetPercentClass,
  getRangeParams,
  getTrendPageSize,
  mapBudgetItem,
  mapRecentlyBillList,
  refreshGraphic,
  resetConsumptionChartData,
  resetTrendChartData,
} from '@/views/dashboard/utils'

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

const overviewData: DashboardOverviewData = reactive({
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

const budgetList = ref<Array<BudgetItem>>([])
const themeStore = useThemeStore()
const rangeMode = ref<RangeMode>('month')

const addBillRef = ref()
const deletingIds = ref<Set<number | undefined>>(new Set())

// ECharts graphic 使用 canvas 渲染，不支持 CSS 变量；每次调用时实时读取计算值
const graphicTotal = ref(0)
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
  const { startTime, endTime } = getRangeParams(rangeMode.value)
  billApi
    .getFinanceTransactionsList({
      startTime,
      endTime,
      pageNum: 1,
      pageSize: 3,
    })
    .then((res) => {
      recentlyBillList.value = mapRecentlyBillList(res.data.data.result || [])
    })
}

const fetchOverviewData = () => {
  const { startTime, endTime } = getRangeParams(rangeMode.value)

  return billApi.getCashFlowCard({ startTime, endTime }).then((res) => {
    overviewData.income.amount = 0
    overviewData.expend.amount = 0
    overviewData.balance.amount = 0

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
}

const fetchBudgetList = () => {
  const { startTime, endTime } = getRangeParams(rangeMode.value)

  return billApi
    .getBudgetInfo({ startTime, endTime, pageNum: 1, pageSize: 3 })
    .then((res) => {
      budgetList.value = ((res.data.data as Array<RawBudgetItem>) || []).map(mapBudgetItem)
    })
    .catch((error) => {
      console.error('获取预算失败:', error)
      budgetList.value = []
    })
}

const fetchConsumptionStatistics = () => {
  const { startTime, endTime } = getRangeParams(rangeMode.value)

  return billApi
    .consumptionStatistics({ startTime, endTime })
    .then((res) => {
      graphicTotal.value = applyConsumptionChartData(
        chartOption.value,
        (res.data.data as Array<ConsumptionStatisticItem>) || [],
      )
    })
    .catch((error) => {
      console.error('获取消费分类占比失败:', error)
      resetConsumptionChartData(chartOption.value)
    })
}

const fetchConsumerTrends = () => {
  const { startTime, endTime } = getRangeParams(rangeMode.value)

  return billApi
    .consumerTrends({
      startTime,
      endTime,
      pageNum: 1,
      pageSize: getTrendPageSize(rangeMode.value),
    })
    .then((res) => {
      applyTrendChartData(trendChartOption.value, res.data.data.result || [])
    })
    .catch((error) => {
      console.error('获取消费趋势失败:', error)
      resetTrendChartData(trendChartOption.value)
    })
}

const loadDashboardData = () => {
  const loadingInstance = ElLoading.service({
    fullscreen: true,
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.5)',
  })

  Promise.allSettled([
    fetchOverviewData(),
    refreshRecentlyBill(),
    fetchBudgetList(),
    fetchConsumptionStatistics(),
    fetchConsumerTrends(),
  ]).finally(() => {
    loadingInstance.close()
  })
}

const skipBill = (to: string) => {
  router.push(to)
}

onMounted(() => {
  loadDashboardData()

  systemThemeMedia = window.matchMedia('(prefers-color-scheme: dark)')
  systemThemeMedia.addEventListener('change', handleSystemThemeChange)
})

const handleSystemThemeChange = () => {
  if (themeStore.themeMode === 'system') {
    refreshGraphic(chartOption.value, graphicTotal.value)
  }
}

watch(
  () => themeStore.effectiveTheme,
  () => {
    refreshGraphic(chartOption.value, graphicTotal.value)
  },
)

watch(rangeMode, () => {
  loadDashboardData()
})

let systemThemeMedia: MediaQueryList | null = null
onUnmounted(() => {
  systemThemeMedia?.removeEventListener('change', handleSystemThemeChange)
})
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
   时间维度切换
   =================================================== */
.dashboard-range-switch {
  display: inline-flex;
  gap: 8px;
  margin-bottom: 16px;
  padding: 6px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  box-shadow: var(--shadow-card);
}

.range-chip {
  padding: 6px 12px;
  border-radius: 999px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--motion-fast);
}

.range-chip.active {
  background: var(--color-accent-subtle);
  color: var(--color-accent);
  font-weight: 600;
}

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

.budget-list-empty-state {
  display: flex;
  height: 200px;
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
</style>
