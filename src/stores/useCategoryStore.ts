import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as billApi from '@/services/bill'
import type Category from '@/models/Category'

export const useCategoryStore = defineStore('category', () => {
  const categoryList = ref<Category[]>([])

  const fetchCategories = async () => {
    try {
      const res = await billApi.getCategory({ pageNum: 1, pageSize: 100 })
      categoryList.value = res.data.data.result || []
    } catch (error) {
      console.error('获取分类失败:', error)
    }
  }

  return {
    categoryList,
    fetchCategories,
  }
})
