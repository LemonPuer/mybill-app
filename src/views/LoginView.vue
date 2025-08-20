<template>
  <div class="login-container">
    <!-- 装饰元素 -->
    <div class="decoration"></div>
    <div class="decoration"></div>
    <div class="decoration"></div>

    <div class="login-box">
      <div class="logo">
        <el-icon class="logo-icon">
          <Wallet />
        </el-icon>
        <h1>个人账单</h1>
      </div>

      <div class="tabs">
        <div class="tab" :class="{ active: activeTab === 'login' }" @click="activeTab = 'login'">
          登录
        </div>
        <div class="tab" :class="{ active: activeTab === 'register' }" @click="activeTab = 'register'">
          注册
        </div>
      </div>

      <!-- 登录表单 -->
      <div v-show="activeTab === 'login'" class="form-container">
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-position="top">
          <el-form-item label="用户名/手机号" prop="username">
            <el-input v-model="loginForm.username" placeholder="请输入用户名或手机号" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password />
          </el-form-item>
          <el-button type="primary" class="submit-btn" :loading="loading" @click="handleLogin">
            登录
          </el-button>
          <div class="links">
            <a href="#" @click.prevent="activeTab = 'forgot'">忘记密码？</a>
          </div>
        </el-form>
      </div>

      <!-- 注册表单 -->
      <div v-show="activeTab === 'register'" class="form-container">
        <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" label-position="top">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="registerForm.username" placeholder="请设置用户名" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="registerForm.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="registerForm.password" type="password" placeholder="请设置密码" show-password />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" show-password />
          </el-form-item>
          <el-button type="primary" class="submit-btn" :loading="loading" @click="handleRegister">
            注册
          </el-button>
        </el-form>
      </div>

      <!-- 忘记密码表单 -->
      <div v-show="activeTab === 'forgot'" class="form-container">
        <el-form ref="forgotFormRef" :model="forgotForm" :rules="forgotRules" label-position="top">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="forgotForm.email" placeholder="请输入注册邮箱" />
          </el-form-item>
          <el-form-item label="验证码" prop="verificationCode">
            <div class="verification-code">
              <el-input v-model="forgotForm.verificationCode" placeholder="请输入验证码" />
              <el-button :disabled="!!countdown" @click="handleSendCode">
                {{ countdown ? `${countdown}s后重试` : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input v-model="forgotForm.newPassword" type="password" placeholder="请设置新密码" show-password />
          </el-form-item>
          <el-button type="primary" class="submit-btn" :loading="loading" @click="handleResetPassword">
            重置密码
          </el-button>
          <div class="links">
            <a href="#" @click.prevent="activeTab = 'login'">返回登录</a>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import '@/assets/styles/login.css'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { onBeforeMount, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { login, register } from '../services/user'
import { useUserInfoStore } from '../stores/useUserInfoStore'

const router = useRouter()
const loading = ref(false)
const countdown = ref(0)
const activeTab = ref('login')
const userInfoStore = useUserInfoStore();

onBeforeMount(() => {
  const token = userInfoStore.accessToken;
  if (token) {
    router.push('/')
  }
})

// 登录表单
const loginFormRef = ref<FormInstance>()
const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
})

// 注册表单
const registerFormRef = ref<FormInstance>()
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const registerRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// 忘记密码表单
const forgotFormRef = ref<FormInstance>()
const forgotForm = reactive({
  email: '',
  verificationCode: '',
  newPassword: ''
})

const forgotRules = reactive<FormRules>({
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  verificationCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
})

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  try {
    const valid = await loginFormRef.value.validate()
    if (valid) {
      const response = await login({
        username: loginForm.username,
        password: loginForm.password
      })
      const { expireTime, refreshToken } = response.data.data;
      const token = response.headers.authorization;
      if (!token) {
        throw new Error('服务器异常，获取Token失败！');
      }
      userInfoStore.$patch({
        refreshToken,
        expireTime,
        accessToken: token
      })
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('expireTime', expireTime);
      ElMessage.success('登录成功');
      router.push('/');
    }
  } catch (error) {
    console.error('登录失败:', error)
  }
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return
  try {
    const valid = await registerFormRef.value.validate()
    if (valid) {
      const response = await register({
        username: registerForm.username,
        password: registerForm.password,
        email: registerForm.email
      })
      if (response.data.code === 200) {
        ElMessage.success('注册成功')
        window.location.reload()
      } else {
        throw new Error(`'注册失败,响应：${response.data}`)
      }
    }
  } catch (error) {
    console.error('注册失败:', error)
  }
}

// 处理发送验证码
const handleSendCode = async () => {
  if (!forgotForm.email) {
    ElMessage.warning('请先输入邮箱')
    return
  }
  try {
    // 这里应该调用发送验证码的接口
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
    ElMessage.success('验证码已发送')
  } catch (error) {
    console.error('发送验证码失败:', error)
  }
}

// 处理重置密码
const handleResetPassword = async () => {
  if (!forgotFormRef.value) return
  await forgotFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        // 这里应该调用重置密码的接口
        ElMessage.success('密码重置成功')
        activeTab.value = 'login'
      } catch (error) {
        console.error('密码重置失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped></style>
