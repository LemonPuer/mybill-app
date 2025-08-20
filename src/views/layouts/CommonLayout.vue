<template>
  <div>
    <HeaderView :title="title" />
    <div class="container main-container">
      <router-view />
      <AddBillView />
    </div>
    <FooterView />
  </div>

</template>

<script setup lang="ts">
import type SimpleEnum from '@/models/SimpleEnum';
import router from '@/router';
import * as billApi from '@/services/bill';
import { getUserInfo } from '@/services/user';
import { useDictionaryStore } from '@/stores/useCommonStore';
import { useUserInfoStore } from '@/stores/useUserInfoStore';
import AddBillView from '@/views/AddBillView.vue';
import FooterView from '@/views/FooterView.vue';
import HeaderView from '@/views/HeaderView.vue';
import { ElMessage } from 'element-plus';
import { computed, onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';



const userInfoStore = useUserInfoStore();
const dictionaryStore = useDictionaryStore();

const RouteName = {
  home: '仪表盘',
  bill: '账单',
  manage: '管理',
}

const route = useRoute()
const title = computed((): string => {
  const routeName = route.name?.toString()
  // 直接通过对象属性访问并添加默认值
  return RouteName[routeName as keyof typeof RouteName] ?? ''
})


onBeforeMount(async() => {
  try {
    // 获取用户信息
    getUserInfo().then((res) => {
      const { username, email, avatarUrl, description } = res.data.data as { username: string; email: string; avatarUrl: string; description: string };
      userInfoStore.$patch({
        username,
        email,
        avatarUrl,
        description
      })
    }).catch((err) => {
      console.log(err);
      ElMessage.error('获取用户信息失败,请重新登录！');
      localStorage.clear();
      userInfoStore.$reset();
      router.push('/login');
    });

    // 获取字典信息
    billApi.getDicInfo().then((res) => {
      const dictionaryData = res.data.data as Record<string, Array<SimpleEnum>>;
      dictionaryStore.setDictionary(dictionaryData);
    });
  } catch (error) {
    console.error('API 请求失败:', error);
    ElMessage.error('数据加载失败，请重试');

  }
});

</script>
