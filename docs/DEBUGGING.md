# 项目问题排查指南

本文档记录项目中遇到的问题及解决方案，供后续开发参考。

---

## 1. 登录接口不调用问题

### 问题描述

点击登录按钮后，代码执行到调用 API 处但请求未发出，控制台无报错。

### 排查过程

1. ✅ 添加调试日志确认 `handleLogin` 函数正常执行
2. ✅ 确认表单验证通过 (`validate result: true`)
3. ✅ 确认 `login()` 函数被调用
4. ❌ 发现 `await login()` 没有抛出错误，也没有返回结果

### 根本原因

`src/services/base.ts` 中的 axios 请求拦截器在初始化时调用了 `useUserInfoStore()`：

```typescript
// base.ts - 有问题的代码
api.interceptors.request.use(async (config) => {
  const userInfoStore = useUserInfoStore() // ❌ 此时 Pinia 可能未初始化
  // ...
})
```

由于 Pinia 在 `main.ts` 中的初始化顺序问题，在登录页面早期加载时，Axios 拦截器中的 `useUserInfoStore()` 会抛出错误，导致整个请求被吞掉。

### 解决方案

将 `src/services/user.ts` 中的登录接口改为直接使用原生 axios，绕过有问题的拦截器：

```typescript
// user.ts - 修复后
import axios from 'axios'

export const login = (data: { username: string; password: string }) => {
  return axios.post('/api/user/login', {
    data: {
      username: data.username,
      password: data.password,
    },
  })
}
```

### 后续建议

1. 修复 `base.ts` 中的 store 获取方式，使用 `try-catch` 包裹
2. 考虑将 Pinia 初始化移到 axios 拦截器注册之前

---

## 2. 路由守卫 token 过期检查问题

### 问题描述

项目启动时，即使 token 已过期，用户也能看到需要登录的页面内容。

### 原因

原路由守卫只检查 token 是否存在，未检查是否过期：

```typescript
// 原来的代码 - 有问题
const isAuthenticated = localStorage.getItem('accessToken')
if (to.meta.requiresAuth && !isAuthenticated) {
  next('/login')
}
```

### 解决方案

```typescript
// 修复后的代码
router.beforeEach((to, from, next) => {
  const accessToken = localStorage.getItem('accessToken')
  const expireTime = localStorage.getItem('expireTime')

  // 检查 token 是否存在且未过期
  const isAuthenticated = accessToken && expireTime && BigInt(Date.now()) < BigInt(expireTime)

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})
```

---

## 3. UI 按钮样式不生效问题

### 问题描述

在 `theme.css` 中定义的 Element Plus 按钮样式覆盖不生效。

### 原因

样式加载顺序错误，主题变量在 Element Plus 样式之前引入，导致 CSS 变量被覆盖。

### 解决方案

调整 `main.ts` 中的样式引入顺序：

```typescript
// main.ts
import 'element-plus/dist/index.css' // 先引入 Element Plus 样式
import './assets/styles/theme.css' // 后引入主题变量
```

---

## 4. 通用排查流程

当遇到类似"接口不调用"、"代码不执行"等问题时：

### 4.1 确认函数是否执行

```typescript
const handleLogin = async () => {
  console.log('1. 函数开始') // 添加调试日志
  // ...
}
```

### 4.2 确认条件判断

```typescript
if (!loginFormRef.value || loading.value) {
  console.log('2. 提前返回', { loginFormRef: !!loginFormRef.value, loading: loading.value })
  return
}
```

### 4.3 确认异步操作

```typescript
try {
  console.log('3. 开始调用 API')
  const response = await login(...)
  console.log('4. API 返回', response)
} catch (error) {
  console.error('5. API 错误', error)
}
```

### 4.4 检查边界情况

- Pinia/Vue 初始化顺序
- 拦截器中的副作用
- 模块循环依赖

---

## 5. 最佳实践

### 5.1 API 请求规范

- 避免在 axios 拦截器中直接调用 Pinia store
- 使用 try-catch 包裹 store 获取
- 登录接口优先使用原生 axios，确认后再集成拦截器

### 5.2 路由守卫规范

- 同时检查 token 存在性和过期时间
- 处理已登录用户访问登录页的情况

### 5.3 样式覆盖规范

- 确保覆盖样式在 Element Plus 之后引入
- 使用具体选择器 + `!important` 确保优先级
