<template>
  <div class="profile-view">
    <div class="page-header">
      <div class="back-btn" @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="page-title">个人资料</div>
      <span class="page-placeholder"></span>
    </div>

    <el-card class="profile-card">
      <el-form label-position="top">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱" disabled />
        </el-form-item>
        <el-form-item label="头像 URL">
          <el-input v-model="form.avatarUrl" placeholder="https://example.com/avatar.png" />
        </el-form-item>
        <el-form-item label="个人描述">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="介绍一下自己" />
        </el-form-item>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getUserInfo, updateInfo } from '@/services/user'
import { useUserInfoStore } from '@/stores/useUserInfoStore'

const router = useRouter()
const userInfoStore = useUserInfoStore()
const saving = ref(false)

const form = reactive({
  username: '',
  email: '',
  avatarUrl: '',
  description: '',
})

const fillForm = (data: Partial<typeof form>) => {
  Object.assign(form, {
    username: data.username || '',
    email: data.email || '',
    avatarUrl: data.avatarUrl || '',
    description: data.description || '',
  })
}

const fetchProfile = async () => {
  const res = await getUserInfo()
  fillForm(res.data.data || {})
}

const handleSave = async () => {
  if (!form.username.trim()) {
    ElMessage.warning('请输入用户名')
    return
  }

  saving.value = true
  try {
    const payload = {
      username: form.username.trim(),
      avatarUrl: form.avatarUrl.trim(),
      description: form.description.trim(),
    }

    await updateInfo(payload)
    userInfoStore.$patch(payload)
    ElMessage.success('保存成功')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fillForm(userInfoStore.$state)
  fetchProfile()
})
</script>

<style scoped>
.profile-view {
  padding-bottom: 80px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-card);
  transition: all var(--motion-fast);
}

.back-btn:hover {
  background: var(--color-accent);
  color: #fff;
}

.back-btn .el-icon {
  font-size: 18px;
  color: var(--color-text-primary);
}

.back-btn:hover .el-icon {
  color: #fff;
}

.page-title {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.page-placeholder {
  width: 36px;
}

.profile-card {
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  box-shadow: var(--shadow-card);
}
</style>
