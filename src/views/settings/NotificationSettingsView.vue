<template>
  <div class="notification-settings-view">
    <div class="page-header">
      <div class="back-btn" @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="page-title">通知设置</div>
      <span class="page-placeholder"></span>
    </div>

    <el-card class="notification-card">
      <el-form label-position="top">
        <el-form-item label="提醒邮箱">
          <el-input v-model="form.email" placeholder="请输入接收提醒的邮箱" />
        </el-form-item>
        <el-form-item label="催记账邮件">
          <el-switch v-model="form.emailReminderEnabled" />
        </el-form-item>
        <el-form-item label="月度摘要邮件">
          <el-switch v-model="form.monthlySummaryEnabled" />
        </el-form-item>
        <el-form-item label="发送时间（整点 0-23）">
          <el-input-number v-model="form.reminderSendHour" :min="0" :max="23" style="width: 100%" />
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

const router = useRouter()
const saving = ref(false)

const form = reactive({
  email: '',
  emailReminderEnabled: false,
  monthlySummaryEnabled: false,
  reminderSendHour: 20,
})

const fetchSettings = async () => {
  const res = await getUserInfo()
  Object.assign(form, {
    email: res.data.data?.email || '',
    emailReminderEnabled: Boolean(res.data.data?.emailReminderEnabled),
    monthlySummaryEnabled: Boolean(res.data.data?.monthlySummaryEnabled),
    reminderSendHour: Number(res.data.data?.reminderSendHour ?? 20),
  })
}

const handleSave = async () => {
  if (!form.email.trim()) {
    ElMessage.warning('请输入提醒邮箱')
    return
  }

  saving.value = true
  try {
    await updateInfo({
      email: form.email.trim(),
      emailReminderEnabled: form.emailReminderEnabled,
      monthlySummaryEnabled: form.monthlySummaryEnabled,
      reminderSendHour: form.reminderSendHour,
    })
    ElMessage.success('保存成功')
  } finally {
    saving.value = false
  }
}

onMounted(fetchSettings)
</script>

<style scoped>
.notification-settings-view {
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

.notification-card {
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  box-shadow: var(--shadow-card);
}
</style>
