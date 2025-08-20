<template>
  <div class="bottom-nav">
    <div class="nav-item" :class="{ active: currentRoute === '/' }" @click="navigateTo('/')">
      <el-icon>
        <HomeFilled />
      </el-icon>
      <div>首页</div>
    </div>
    <div class="nav-item" :class="{ active: currentRoute === '/bill' }" @click="navigateTo('/bill')">
      <el-icon>
        <Document />
      </el-icon>
      <div>账单</div>
    </div>
    <div class="nav-item" :class="{ active: currentRoute === '/manage' }" @click="navigateTo('/manage')">
      <el-icon>
        <PieChart />
      </el-icon>
      <div>管理</div>
    </div>
    <div class="nav-item" :class="{ active: currentRoute === '/profile' }" @click="navigateTo('/profile')">
      <el-icon>
        <User />
      </el-icon>
      <div>我的</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { HomeFilled, Document, PieChart, User } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const currentRoute = ref(route.path)

const navigateTo = (path: string) => {
  router.push(path)
  currentRoute.value = path
}

onMounted(() => {
  currentRoute.value = route.path
})
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--color-text-light);
  transition: all 0.3s ease;
}

.nav-item:hover {
  color: var(--color-primary);
  transform: translateY(-2px);
}

.nav-item.active {
  color: var(--color-primary);
  font-weight: 500;
}

.nav-item .el-icon {
  font-size: 1.5rem;
}

.nav-item div {
  font-size: 0.75rem;
}

@media (max-width: 480px) {
  .bottom-nav {
    height: 3.5rem;
  }

  .nav-item .el-icon {
    font-size: 1.25rem;
  }

  .nav-item div {
    font-size: 0.7rem;
  }
}
</style>
