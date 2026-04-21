# P0 核心闭环 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 删除独立统计页，并补齐账单整理、个人资料、通知设置、分类删除这几个 P0 核心闭环。

**Architecture:** 以现有 Vue 单页应用结构为基础，不新增新的业务域。路由与设置入口负责把能力接起来，`BillView` 承担账单整理中心，`DashboardView` 只保留轻量复盘，用户资料和通知偏好复用 `user` 服务层，不引入账户体系。

**Tech Stack:** Vue 3, TypeScript, Vue Router, Pinia, Element Plus, Axios, Vite

---

## Scope Check

原始 spec 覆盖 P0、P1、P2 三个阶段，已经跨了多个独立子系统。本计划只覆盖第一个可执行切片：`P0 核心闭环`。邮件提醒、月度摘要、忘记密码、数据导出留到后续单独计划，避免把前端页面闭环和后端任务系统混在一轮实现里。

---

## 文件改动总览

| 文件 | 操作 | 责任 |
|------|------|------|
| `src/router/index.ts` | 修改 | 删除统计页路由，新增 `profile` / `notifications` 子路由 |
| `src/components/BottomNav.vue` | 修改 | 删除底部统计入口 |
| `src/views/layouts/CommonLayout.vue` | 修改 | 删除统计页标题映射 |
| `src/views/DashboardView.vue` | 修改 | 新增时间维度切换，移除跳转统计页入口，保留轻量复盘 |
| `src/views/BillView.vue` | 修改 | 增加关键词搜索、分类筛选、加载更多与结束态 |
| `src/views/SettingsView.vue` | 修改 | 增加通知设置入口，保持总设置页只做导航 |
| `src/views/settings/ProfileView.vue` | 新建 | 个人资料查看与保存 |
| `src/views/settings/NotificationSettingsView.vue` | 新建 | 通知偏好查看与保存 |
| `src/views/settings/CategoriesView.vue` | 修改 | 对接真实分类删除接口并展示失败原因 |
| `src/services/user.ts` | 修改 | 补充 `updateInfo` 及相关请求类型 |
| `src/services/bill.ts` | 修改 | 分类删除接口命名对齐，账单查询类型补关键词字段 |
| `src/stores/useUserInfoStore.ts` | 可能修改 | 若通知偏好需前端缓存，则扩展用户状态；如仅页面内回填则保持不动 |

---

## Verification Strategy

仓库当前没有前端测试框架，本计划不引入新的测试依赖。每个任务完成后用以下方式验证：

- 静态检查：`npm run lint`
- 类型检查：`npm run type-check`
- 关键回归：`npm run build`
- 手动验证：`npm run dev` 后访问对应页面

---

### Task 1: 删除统计页入口并补齐设置路由骨架

**Files:**
- Modify: `src/router/index.ts`
- Modify: `src/components/BottomNav.vue`
- Modify: `src/views/layouts/CommonLayout.vue`
- Modify: `src/views/SettingsView.vue`

- [ ] **Step 1: 更新路由，删除统计页并新增设置子页路由**

将 `src/router/index.ts` 中的子路由改成下面这段结构，重点是删除 `/statistics`，新增 `/settings/profile` 和 `/settings/notifications`：

```ts
children: [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
  },
  {
    path: '/bills',
    name: 'bills',
    component: () => import('@/views/BillView.vue'),
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
  },
  {
    path: '/settings/profile',
    name: 'settings-profile',
    component: () => import('@/views/settings/ProfileView.vue'),
  },
  {
    path: '/settings/notifications',
    name: 'settings-notifications',
    component: () => import('@/views/settings/NotificationSettingsView.vue'),
  },
  {
    path: '/settings/categories',
    name: 'settings-categories',
    component: () => import('@/views/settings/CategoriesView.vue'),
  },
  {
    path: '/settings/budget',
    name: 'settings-budget',
    component: () => import('@/views/settings/BudgetView.vue'),
  },
]
```

- [ ] **Step 2: 删除底部导航的统计入口**

把 `src/components/BottomNav.vue` 的导航数组改成只保留 4 个入口，并移除 `PieChart` 导入：

```ts
import { EditPen, DataAnalysis, Wallet, Setting } from '@element-plus/icons-vue'

const navItems = [
  { path: '/', label: '记账', icon: EditPen },
  { path: '/dashboard', label: '看板', icon: DataAnalysis },
  { path: '/bills', label: '账单', icon: Wallet },
  { path: '/settings', label: '设置', icon: Setting },
]
```

- [ ] **Step 3: 删除 CommonLayout 中对 statistics 的标题映射**

将 `src/views/layouts/CommonLayout.vue` 的 `RouteName` 改为：

```ts
const RouteName: Record<string, string> = {
  home: 'AI记账',
  dashboard: '仪表盘',
  bills: '账单详情',
  settings: '个人设置',
}
```

- [ ] **Step 4: 在设置首页增加通知设置卡片**

在 `src/views/SettingsView.vue` 中，把设置卡片列表调整为包含通知设置入口，保持总设置页只导航不承载复杂表单：

```vue
<div class="settings-card" @click="goToPage('/settings/profile')">
  <div class="settings-icon">👤</div>
  <div class="settings-title">个人资料</div>
  <div class="settings-desc">修改个人信息</div>
</div>

<div class="settings-card" @click="goToPage('/settings/notifications')">
  <div class="settings-icon">✉️</div>
  <div class="settings-title">通知设置</div>
  <div class="settings-desc">配置邮箱与提醒偏好</div>
</div>
```

- [ ] **Step 5: 运行类型检查确认路由和入口无残留引用**

Run: `npm run type-check`

Expected: 命令通过；不存在 `statistics` 路由或 `PieChart` 残留引用导致的类型错误。

---

### Task 2: 为资料页和通知页补齐 user 服务层

**Files:**
- Modify: `src/services/user.ts`

- [ ] **Step 1: 在 user 服务层中补充请求类型和更新接口**

将 `src/services/user.ts` 扩展为下面这种结构，保留现有 `getUserInfo`，补 `updateInfo`：

```ts
import { api } from './base.ts'

export interface UserInfoPayload {
  username: string
  email: string
  avatarUrl: string
  description: string
  emailReminderEnabled?: boolean
  monthlySummaryEnabled?: boolean
  reminderSendHour?: number
}

export const register = (data: { username: string; password: string; email: string }) => {
  return api.post('/user/register', {
    data: {
      username: data.username,
      password: data.password,
      email: data.email,
    },
  })
}

export const login = (data: { username: string; password: string }) => {
  return api.post('/user/login', {
    data: {
      username: data.username,
      password: data.password,
    },
  })
}

export const getUserInfo = () => {
  return api.post('/user/getUserInfo')
}

export const updateInfo = (data: Partial<UserInfoPayload>) => {
  return api.post('/user/updateInfo', {
    data: {
      ...data,
    },
  })
}
```

- [ ] **Step 2: 运行 lint，确认服务层格式和 import 正常**

Run: `npm run lint`

Expected: `src/services/user.ts` 无格式或语法报错。

---

### Task 3: 实现个人资料页并与用户信息 store 回填联动

**Files:**
- Create: `src/views/settings/ProfileView.vue`
- Modify: `src/views/layouts/CommonLayout.vue`
- Modify: `src/stores/useUserInfoStore.ts`（仅当页面需要直接存回通知字段时；本任务先不改）

- [ ] **Step 1: 新建个人资料页组件**

创建 `src/views/settings/ProfileView.vue`，使用现有设置子页风格和返回按钮，最小实现如下：

```vue
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
    await updateInfo({
      username: form.username.trim(),
      avatarUrl: form.avatarUrl.trim(),
      description: form.description.trim(),
    })
    userInfoStore.$patch({
      username: form.username.trim(),
      avatarUrl: form.avatarUrl.trim(),
      description: form.description.trim(),
    })
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
```

- [ ] **Step 2: 保持 CommonLayout 首屏拉取用户资料逻辑不变，只确认字段可回填 Profile 页面**

保留 `src/views/layouts/CommonLayout.vue` 现有 `getUserInfo()` 调用；如果字段名变化，仅把 `res.data.data` 的解构改成下面这样：

```ts
const { username, email, avatarUrl, description } = res.data.data as {
  username: string
  email: string
  avatarUrl: string
  description: string
}
```

- [ ] **Step 3: 启动开发服务器手动验证个人资料页**

Run: `npm run dev`

Expected:
- 访问 `/settings/profile` 可以打开页面
- 页面初始值能读取当前用户信息
- 修改用户名/头像/描述后点击保存可以成功提示
- 刷新页面后内容仍保持更新后的值

---

### Task 4: 实现通知设置页，复用 user/updateInfo 保存偏好

**Files:**
- Create: `src/views/settings/NotificationSettingsView.vue`
- Modify: `src/services/user.ts`

- [ ] **Step 1: 新建通知设置页面**

创建 `src/views/settings/NotificationSettingsView.vue`，采用与 `CategoriesView` 相同的子页头部风格，表单最小实现如下：

```vue
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
```

- [ ] **Step 2: 手动验证通知设置页的回填与保存**

Run: `npm run dev`

Expected:
- 访问 `/settings/notifications` 可以打开页面
- 页面能回填邮箱和通知开关默认值
- 修改后点击保存有成功提示
- 刷新页面后仍能看到最新配置

---

### Task 5: 将 BillView 提升为账单整理中心

**Files:**
- Modify: `src/views/BillView.vue`
- Modify: `src/services/bill.ts`

- [ ] **Step 1: 扩展账单查询服务类型，增加关键词字段**

在 `src/services/bill.ts` 中把 `getFinanceTransactionsList` 的参数类型改成：

```ts
export const getFinanceTransactionsList = (data: {
  type?: number
  categoryId?: number
  keyword?: string
  startTime?: string
  endTime?: string
  pageNum: number
  pageSize: number
}) => {
  return api.post('/app/getFinanceTransactionsList', {
    data: {
      ...data,
    },
  })
}
```

同时保留 `accountId` 不再作为本轮调用参数传递，避免继续扩散账户体系。

- [ ] **Step 2: 在 BillView 中新增分类筛选与关键词搜索状态**

在 `src/views/BillView.vue` 的 `<script setup>` 中补以下状态：

```ts
import { ref, computed, onMounted } from 'vue'
import { useCategoryStore } from '@/stores/useCategoryStore'

const categoryStore = useCategoryStore()
const currentCategoryId = ref<number | null>(null)
const keyword = ref('')

const categoryOptions = computed(() => [
  { label: '全部分类', value: null },
  ...categoryStore.categoryList.map((item) => ({
    label: item.category,
    value: item.id ?? null,
  })),
])
```

在 `fetchBills` 构造参数时增加：

```ts
if (currentCategoryId.value) {
  params.categoryId = currentCategoryId.value
}

if (keyword.value.trim()) {
  params.keyword = keyword.value.trim()
}
```

- [ ] **Step 3: 在 BillView 模板中增加搜索栏、分类筛选和加载更多状态**

在现有筛选区下方加入：

```vue
<div class="search-row">
  <el-input
    v-model="keyword"
    placeholder="搜索备注或分类"
    clearable
    @keyup.enter="fetchBills(true)"
    @clear="fetchBills(true)"
  />
  <el-select v-model="currentCategoryId" clearable placeholder="全部分类" @change="fetchBills(true)">
    <el-option
      v-for="item in categoryOptions"
      :key="String(item.value)"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</div>
```

在列表底部加入加载更多和结束态：

```vue
<div v-if="billList.length > 0" class="load-more-wrapper">
  <el-button v-if="hasMore" :loading="loadingMore" @click="loadMore">加载更多</el-button>
  <span v-else class="load-more-end">没有更多账单了</span>
</div>
```

空态文案区分无数据和搜索无结果：

```vue
<p class="empty-text">{{ keyword || currentCategoryId ? '没有符合条件的账单' : '暂无数据' }}</p>
```

- [ ] **Step 4: 在初始化时预取分类并保证筛选重置逻辑完整**

在 `onMounted` 中补充：

```ts
onMounted(() => {
  categoryStore.fetchCategories()
  fetchBills(true)
})
```

新增两个辅助方法，避免筛选切换时分页状态错乱：

```ts
const resetAndFetch = () => {
  hasMore.value = true
  fetchBills(true)
}

const handleCategoryFilter = (value: number | null) => {
  currentCategoryId.value = value
  resetAndFetch()
}
```

- [ ] **Step 5: 运行 lint 和 type-check 验证账单整理页**

Run: `npm run lint`

Expected: `BillView.vue` 和 `bill.ts` 无 ESLint 报错。

Run: `npm run type-check`

Expected: `BillView` 中的 `null` 分类值、分页状态和搜索状态类型均通过。

- [ ] **Step 6: 手动验证账单整理闭环**

Run: `npm run dev`

Expected:
- 账单页可以按分类筛选
- 输入关键词后可以刷新列表
- 搜索无结果时显示“没有符合条件的账单”
- 点击“加载更多”时追加数据，没数据后显示结束态
- 编辑或删除后列表状态不丢失

---

### Task 6: 收敛 Dashboard 为轻量复盘页

**Files:**
- Modify: `src/views/DashboardView.vue`

- [ ] **Step 1: 增加时间维度切换状态和时间范围计算**

在 `src/views/DashboardView.vue` 中新增一个时间维度状态，统一驱动各统计接口：

```ts
const rangeMode = ref<'month' | 'quarter' | 'year'>('month')

const getRangeParams = () => {
  const now = new Date()

  if (rangeMode.value === 'year') {
    return {
      startTime: String(new Date(now.getFullYear(), 0, 1).getTime()),
      endTime: String(new Date(now.getFullYear() + 1, 0, 0, 23, 59, 59, 999).getTime()),
    }
  }

  if (rangeMode.value === 'quarter') {
    return {
      startTime: String(new Date(now.getFullYear(), now.getMonth() - 2, 1).getTime()),
      endTime: String(now.getTime()),
    }
  }

  return getMonthRangeTimestamps() as { startTime: string; endTime: string }
}
```

原来所有 `getMonthRangeTimestamps()` 的调用统一替换为 `getRangeParams()`。

- [ ] **Step 2: 在 Dashboard 顶部加时间切换按钮组**

在模板统计区前增加：

```vue
<div class="dashboard-range-switch">
  <div class="range-chip" :class="{ active: rangeMode === 'month' }" @click="rangeMode = 'month'">本月</div>
  <div class="range-chip" :class="{ active: rangeMode === 'quarter' }" @click="rangeMode = 'quarter'">近 3 月</div>
  <div class="range-chip" :class="{ active: rangeMode === 'year' }" @click="rangeMode = 'year'">本年</div>
</div>
```

并在 `watch(rangeMode, ...)` 中重新拉取看板数据：

```ts
watch(rangeMode, () => {
  fetchOverviewData()
  fetchBudgetList()
  fetchConsumptionStatistics()
  fetchConsumerTrends()
  fetchRecentlyBill()
})
```

- [ ] **Step 3: 删除所有跳往 /statistics 的入口，改成账单或设置跳转**

将原消费分类卡片右上角 CTA 从：

```vue
@click="skipBill('/statistics')"
```

改成：

```vue
@click="skipBill('/bills')"
```

CTA 文案改为：

```vue
查看账单
```

如果看板中还有其他统计详情入口，也统一改到 `Bills`、`/settings/budget` 或 `/settings/categories`，不要再保留独立统计页跳转。

- [ ] **Step 4: 运行 build，验证 Dashboard 改造后整体仍可构建**

Run: `npm run build`

Expected: 构建成功；`DashboardView.vue` 中 ECharts 数据和新时间范围状态没有类型错误。

---

### Task 7: 对接真实分类删除接口并保留失败原因

**Files:**
- Modify: `src/services/bill.ts`
- Modify: `src/views/settings/CategoriesView.vue`

- [ ] **Step 1: 将分类删除接口命名对齐后端约定**

把 `src/services/bill.ts` 中的删除分类接口从：

```ts
export const deleteCategory = (id: number) => {
  return api.post('/app/deleteCategory', {
    data: { id },
  })
}
```

改成：

```ts
export const deleteCategory = (id: number) => {
  return api.post('/app/delCategory', {
    data: { id },
  })
}
```

- [ ] **Step 2: 在 CategoriesView 中只把取消操作吞掉，业务失败走接口返回提示**

将 `handleDelete` 改成下面这种结构，避免把真实删除失败也当作“用户取消”：

```ts
const handleDelete = async (item: Category) => {
  try {
    await ElMessageBox.confirm('确定要删除该分类吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }

  try {
    await billApi.deleteCategory(item.id!)
    ElMessage.success('删除成功')
    fetchCategories()
    categoryStore.fetchCategories()
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || '删除失败，请稍后重试')
  }
}
```

- [ ] **Step 3: 最终回归验证 P0 核心闭环**

Run: `npm run lint`

Expected: 前端代码格式和静态规则通过。

Run: `npm run type-check`

Expected: 新路由、新页面、账单筛选和 Dashboard 时间状态类型通过。

Run: `npm run build`

Expected: 生产构建成功。

手动检查：
- `/statistics` 不能再访问到业务页面
- 底部导航不再显示“统计”
- `/settings/profile` 与 `/settings/notifications` 可进入并保存
- `BillView` 支持搜索、分类筛选、加载更多
- 分类删除成功会刷新，失败会显示后端返回的原因

---

## Self-Review

### Spec coverage

- `4.3.1 Dashboard 统计增强` 对应 Task 6
- `4.3.2 统计页下线` 对应 Task 1 + Task 6
- `4.3.3 账单整理增强` 对应 Task 5
- `4.3.4 个人资料闭环` 对应 Task 3
- `4.3.5 通知设置闭环` 对应 Task 4
- `4.3.6 分类删除对接` 对应 Task 7

### Placeholder scan

- 本计划没有 `TODO`、`TBD`、`implement later` 之类占位词
- 所有任务都落到了具体文件和具体命令

### Type consistency

- 通知偏好字段统一使用 `emailReminderEnabled`、`monthlySummaryEnabled`、`reminderSendHour`
- 用户资料字段统一使用 `username`、`email`、`avatarUrl`、`description`
- 账单整理关键词统一使用 `keyword`
