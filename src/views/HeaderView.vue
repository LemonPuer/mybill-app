<template>
  <div class="header">
    <div class="container">
      <div class="header-content">
        <div class="header-title">{{ props.title }}</div>
        <div class="user-info">
          <span class="username">{{ userStore.username }}</span>
          <el-dropdown trigger="click" @command="handleCommand">
            <el-avatar :size="32" class="user-avatar" :src="userStore.avatarUrl">
              {{ userInitial }}
            </el-avatar>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserInfoStore } from '@/stores/useUserInfoStore'
import { ElMessageBox } from 'element-plus'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '仪表盘',
})

const router = useRouter()
const userStore = useUserInfoStore()
const userInitial = computed(() => {
  return userStore.username ? userStore.username.charAt(0).toUpperCase() : 'U'
})

const handleCommand = (command: string) => {
  switch (command) {
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          userStore.$reset()
          localStorage.clear()
          router.push('/login')
        })
        .catch(() => {
          // 取消操作
        })
      break
  }
}
</script>

<style scoped>
.header {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-bottom: 1px solid var(--glass-border);
  box-shadow: var(--shadow-card);
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  max-width: 100%;
  margin: 0 auto;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
  padding: 0 16px;
}

.header-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.user-avatar {
  background-color: var(--color-accent-subtle);
  color: var(--color-accent);
  font-weight: bold;
  cursor: pointer;
  transition: var(--motion-base);
  border: 2px solid var(--color-border);
}

.user-avatar:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-accent);
  border-color: var(--color-accent);
}

@media (max-width: 480px) {
  .username {
    display: none;
  }
}
</style>
