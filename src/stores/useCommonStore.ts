import type SimpleEnum from '@/models/SimpleEnum'
import { defineStore } from 'pinia'

export const useDictionaryStore = defineStore('dictionary', {
  state: () => {
    return {
      dictionary: {} as Record<string, Array<SimpleEnum>>,
    }
  },
  getters: {
    getDictionary: (state) => {
      // 返回一个函数，接受 type 和 code 参数，从 dictionary 中获取对应的值
      return (type: string, key: number): string | undefined => {
        return state.dictionary[type]?.filter((item) => item.key === key)[0]?.value
      }
    },
    getDictionaryList: (state) => {
      // 返回一个函数，接受 type 参数，从 dictionary 中获取对应的子字典列表
      return (type: string): Array<SimpleEnum> => {
        return state.dictionary[type]
      }
    },
  },
  actions: {
    setDictionary(data: Record<string, Array<SimpleEnum>>) {
      this.dictionary = data
    },
  },
})
