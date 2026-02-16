import type Account from '@/models/Account.ts'
import type BasePage from '@/models/BasePage.ts'
import { api } from './base.ts'

/**
 * 获取字典
 * @returns
 */
export const getDicInfo = () => {
  return api.post('/common/getDicInfo')
}

/**
 * 获取收支卡片
 * @returns
 */
export const getCashFlowCard = (data: { startTime: string; endTime: string }) => {
  return api.post('/app/getCashFlowCard', {
    data: {
      ...data,
    },
  })
}

/**
 * 查询账单列表
 * @returns
 */
export const getFinanceTransactionsList = (data: {
  type?: number
  categoryId?: number
  accountId?: number
  startTime?: string
  endTime?: string
  pageNum: number
  pageSize: number
}) => {
  return api.post('/app/getFinanceTransactionsList', {
    data: {
      ...data,
    },
  })
}

/**
 * 获取预算列表
 */
export const getBudgetInfo = (data: { startTime: string; endTime: string }) => {
  return api.post('/app/getBudgetInfo', {
    data: {
      ...data,
    },
  })
}

/**
 * 保存/编辑账单
 * @param data
 * @returns
 */
export const saveFinanceTransactions = (data: {
  id?: number
  type: number
  amount: number
  categoryId: number
  transactionDate: string
  accountId: number
  note?: string
}) => {
  return api.post('/app/saveFinanceTransactions', {
    data: {
      ...data,
    },
  })
}

/**
 * 获取分类列表
 * @param data
 * @returns
 */
export const getCategory = (data: BasePage) => {
  return api.post('/app/getCategory', {
    data: {
      ...data,
    },
  })
}

/**
 * 新增/编辑分类
 * @param data
 * @returns
 */
export const saveCategory = (data: { id?: number; category: string; icon: string }) => {
  return api.post('/app/saveCategory', {
    data: {
      ...data,
    },
  })
}

/**
 * 获取财务目标
 * @param data
 * @returns
 */
export const financialObjectives = (data: BasePage) => {
  return api.post('/app/financialObjectives', {
    data: {
      ...data,
    },
  })
}

/**
 * 新增/编辑账户
 * @param data
 * @returns
 */
export const saveAccount = (data: Account) => {
  return api.post('/app/saveAccount', {
    data: {
      ...data,
    },
  })
}

/**
 * 获取账户列表
 * @param data
 * @returns
 */
export const getAccounts = (data: { pid: number }) => {
  return api.post('/app/getAccounts', {
    data: {
      ...data,
    },
  })
}

/**
 * 获取账户树，用于级联选择
 * @param data
 * @returns
 */
export const getAccountTree = () => {
  return api.post('/app/getAccounts', {
    data: {},
  })
}

/**
 * 智能解析账单文本
 * @param data
 * @returns
 */
export const parseBillText = (message: string) => {
  return api.post('/app/analysis', {
    data: { message },
  })
}

/**
 * 删除账单
 * @param id
 * @returns
 */
export const deleteFinanceTransactions = (id: number) => {
  return api.post('/app/delFinanceTransactions', {
    data: { id },
  })
}
