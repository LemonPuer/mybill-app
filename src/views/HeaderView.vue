<template>
  <div class="header">
    <el-header>
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
    </el-header>
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
  title: '仪表盘'
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
        type: 'warning'
      }).then(() => {
        userStore.$reset()
        localStorage.clear()
        router.push('/login')
      }).catch(() => {
        // 取消操作
      })
      break
  }
}
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, var(--color-primary) 0%, #7C43E1 100%);
  color: white;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 0.25rem 0.75rem rgba(98, 0, 238, 0.15);
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 15px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  min-height: 3.5rem;
}

.header-title {
  font-size: 1.125rem;
  font-weight: 600;
  transition: transform 0.3s ease;
}

.header-title:hover {
  transform: translateX(0.3125rem);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.username {
  font-size: 0.875rem;
  font-weight: 500;
  transition: opacity 0.3s ease;
}

.user-avatar {
  background-color: #fff;
  color: var(--color-primary);
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.1);
  box-shadow: 0 0.125rem 0.5rem rgba(255, 255, 255, 0.2);
}

@media screen and (max-width: 48rem) {
  .container {
    padding: 0 0.75rem;
  }

  .header-title {
    font-size: 1rem;
  }

  .user-info {
    gap: 0.5rem;
  }
}

@media screen and (max-width: 30rem) {
  .username {
    display: none;
  }
}
</style>
