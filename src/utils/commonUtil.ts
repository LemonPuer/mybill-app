import {
  endOfMonth,
  format,
  isToday,
  isTomorrow,
  startOfMonth,
  startOfDay,
  endOfDay,
} from 'date-fns'

/**
 * 获取月初、月末时间戳
 * @param date
 * @returns
 */
export const getMonthRangeTimestamps = (
  date: Date = new Date(),
): { monthStart: string; monthEnd: string } => {
  const monthStart = startOfMonth(date).getTime().toString()
  const monthEnd = endOfMonth(date).getTime().toString()

  return {
    monthStart,
    monthEnd,
  }
}

/**
 * 获取今日开始、结束时间戳
 * @param date
 * @returns
 */
export const getDayRangeTimestamps = (
  date: Date = new Date(),
): { dayStart: string; dayEnd: string } => {
  const dayStart = startOfDay(date).getTime().toString()
  const dayEnd = endOfDay(date).getTime().toString()

  return {
    dayStart,
    dayEnd,
  }
}

/**
 * 将时间戳转为友好显示（今天、明天、具体日期）
 * @param timestamp 毫秒级时间戳
 * @returns 友好的日期字符串
 */
export function formatFriendlyTime(timestamp: string): string {
  const date = new Date(timestamp)

  if (isToday(date)) {
    return '今天'
  } else if (isTomorrow(date)) {
    return '明天'
  } else {
    return format(date, 'yyyy-MM-dd HH:mm:ss')
  }
}
