<template>
  <div class="common-layout">
    <HeaderView :title="title" />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import type SimpleEnum from '@/models/SimpleEnum'
import router from '@/router'
import * as billApi from '@/services/bill'
import { getUserInfo } from '@/services/user'
import { useDictionaryStore } from '@/stores/useCommonStore'
import { useUserInfoStore } from '@/stores/useUserInfoStore'
import BottomNav from '@/components/BottomNav.vue'
import HeaderView from '@/views/HeaderView.vue'
import { ElMessage } from 'element-plus'
import { computed, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'

const userInfoStore = useUserInfoStore()
const dictionaryStore = useDictionaryStore()

const RouteName: Record<string, string> = {
  home: 'AI记账',
  dashboard: '仪表盘',
  bills: '账单详情',
  statistics: '财务统计',
  settings: '个人设置',
}

const route = useRoute()
const title = computed((): string => {
  const routeName = route.name?.toString()
  // 个人设置的特殊配置
  if (route.path && route.path.startsWith('/settings')) {
    return RouteName['settings']
  }
  return RouteName[routeName ?? ''] ?? ''
})

onBeforeMount(async () => {
  try {
    getUserInfo()
      .then((res) => {
        const { username, email, avatarUrl, description } = res.data.data as {
          username: string
          email: string
          avatarUrl: string
          description: string
        }
        userInfoStore.$patch({
          username,
          email,
          avatarUrl,
          description,
        })
      })
      .catch((err) => {
        console.log(err)
        // 只提示用户，不自动清除登录状态
        ElMessage.warning('获取用户信息失败，请刷新页面重试')
      })

    billApi.getDicInfo().then((res) => {
      const dictionaryData = res.data.data as Record<string, Array<SimpleEnum>>
      dictionaryStore.setDictionary(dictionaryData)
    })
  } catch (error) {
    console.error('API 请求失败:', error)
    ElMessage.error('数据加载失败，请重试')
  }
})
</script>

<style scoped>
.common-layout {
  min-height: 100vh;
  background: var(--color-bg-page);
}

.main-content {
  padding: 16px;
  padding-bottom: 72px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-enter-active,
.page-leave-active {
  transition: all 300ms ease-out;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
