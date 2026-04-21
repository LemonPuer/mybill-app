import type FinanceTransactions from '@/models/FinanceTransactions'

export interface DashboardBillItem extends FinanceTransactions {
  displayDate: string
}

export interface DashboardOverviewData {
  income: { amount: number; type: number; ratio: string; ratioType: number }
  expend: { amount: number; type: number; ratio: string; ratioType: number }
  balance: { amount: number; type: number; ratio: string; ratioType: number }
}

export interface ConsumptionStatisticItem {
  category: string
  consumption: number
}

export interface ConsumerTrendItem {
  month: string
  totalIncome: number
  totalExpense: number
  totalBalance: number
}

export interface ChartLegendTextStyle {
  fontSize: number
}

export interface ChartLegendOption {
  orient: string
  right?: string
  top?: string
  bottom?: number
  left?: string
  type?: string
  itemWidth?: number
  itemHeight?: number
  itemGap?: number
  textStyle?: ChartLegendTextStyle
  data: Array<string>
}

export interface GraphicTextStyle {
  text: string
  textAlign: 'center'
  fill: string
  fontSize: number
  fontWeight?: 'bold'
}

export interface GraphicTextItem {
  type: 'text'
  left: string
  top: string
  style: GraphicTextStyle
}

export interface GradientColorStop {
  offset: number
  color: string
}

export interface LinearGradientColor {
  type: 'linear'
  x: number
  y: number
  x2: number
  y2: number
  colorStops: Array<GradientColorStop>
}

export interface TrendAreaStyle {
  color: LinearGradientColor
  opacity: number
}

export interface ConsumptionChartOption {
  color?: string[]
  tooltip: {
    trigger: string
    formatter: string
  }
  legend: ChartLegendOption
  graphic: Array<GraphicTextItem>
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

export interface TrendSeriesItem {
  name: string
  type: string
  smooth: boolean
  areaStyle: TrendAreaStyle
  data: Array<number>
}

export interface TrendChartOption {
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

export interface RawBudgetItem {
  id?: number
  category?: string
  categoryName?: string
  icon?: string
  amount?: number | string
  cost?: number | string
  spent?: number | string
}

export interface BudgetItem {
  id?: number
  categoryName: string
  icon?: string
  amount: number
  spent: number
}

export type RangeMode = 'month' | 'quarter' | 'year'
