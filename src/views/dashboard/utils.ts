import type FinanceTransactions from '@/models/FinanceTransactions'
import { formatFriendlyTime, getMonthRangeTimestamps } from '@/utils/commonUtil'
import type {
  BudgetItem,
  ConsumptionChartOption,
  ConsumptionStatisticItem,
  ConsumerTrendItem,
  DashboardBillItem,
  GraphicTextItem,
  RangeMode,
  RawBudgetItem,
  TrendChartOption,
} from './types'

export const mapRecentlyBillList = (items: Array<FinanceTransactions>): Array<DashboardBillItem> => {
  return items.map((item) => ({
    ...item,
    displayDate: formatFriendlyTime(item.transactionDate),
  }))
}

export const buildGraphic = (total: number): Array<GraphicTextItem> => {
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

export const refreshGraphic = (chartOption: ConsumptionChartOption, graphicTotal: number) => {
  if (chartOption.graphic.length > 0) {
    chartOption.graphic = buildGraphic(graphicTotal)
  }
}

export const applyConsumptionChartData = (
  chartOption: ConsumptionChartOption,
  items: Array<ConsumptionStatisticItem>,
) => {
  chartOption.legend.data = items.map((item) => item.category || '未分类')
  chartOption.series[0].data = items.map((item) => ({
    value: item.consumption,
    name: item.category || '未分类',
  }))

  const total = items.reduce((sum, item) => sum + (item.consumption || 0), 0)
  chartOption.graphic = buildGraphic(total)

  return total
}

export const resetConsumptionChartData = (chartOption: ConsumptionChartOption) => {
  chartOption.legend.data = []
  chartOption.series[0].data = []
  chartOption.graphic = []
}

export const applyTrendChartData = (trendChartOption: TrendChartOption, items: Array<ConsumerTrendItem>) => {
  const sortedItems = [...items].sort((a, b) => a.month.localeCompare(b.month))
  trendChartOption.xAxis.data = sortedItems.map((item) => item.month)
  trendChartOption.series[0].data = sortedItems.map((item) => item.totalIncome)
  trendChartOption.series[1].data = sortedItems.map((item) => item.totalExpense)
  trendChartOption.series[2].data = sortedItems.map((item) => item.totalBalance)
}

export const resetTrendChartData = (trendChartOption: TrendChartOption) => {
  trendChartOption.xAxis.data = []
  trendChartOption.series[0].data = []
  trendChartOption.series[1].data = []
  trendChartOption.series[2].data = []
}

export const getBudgetPercent = (spent: number, amount: number) =>
  amount > 0 ? Math.min(Math.round((spent / amount) * 100), 999) : 0

export const getBudgetPercentClass = (spent: number, amount: number) => {
  const p = amount > 0 ? (spent / amount) * 100 : 0
  if (p >= 100) return 'percent-danger'
  if (p >= 70) return 'percent-warn'
  return 'percent-normal'
}

export const mapBudgetItem = (item: RawBudgetItem): BudgetItem => ({
  id: item.id,
  categoryName: item.categoryName || item.category || '未分类',
  icon: item.icon,
  amount: Number(item.amount || 0),
  spent: Number(item.spent || item.cost || 0),
})

export const getRecentMonthRange = (monthCount: number) => {
  const endDate = new Date()
  const startDate = new Date(endDate)
  startDate.setMonth(startDate.getMonth() - (monthCount - 1), 1)
  startDate.setHours(0, 0, 0, 0)

  return {
    startTime: startDate.getTime().toString(),
    endTime: endDate.getTime().toString(),
  }
}

export const getRangeParams = (rangeMode: RangeMode) => {
  const now = new Date()

  if (rangeMode === 'year') {
    return {
      startTime: String(new Date(now.getFullYear(), 0, 1).getTime()),
      endTime: String(new Date(now.getFullYear() + 1, 0, 0, 23, 59, 59, 999).getTime()),
    }
  }

  if (rangeMode === 'quarter') {
    return getRecentMonthRange(3)
  }

  const { monthStart, monthEnd } = getMonthRangeTimestamps() as {
    monthStart: string
    monthEnd: string
  }

  return {
    startTime: monthStart,
    endTime: monthEnd,
  }
}

export const getTrendPageSize = (rangeMode: RangeMode) => {
  if (rangeMode === 'year') {
    return 12
  }

  if (rangeMode === 'quarter') {
    return 6
  }

  return 6
}
