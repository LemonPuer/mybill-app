# mybill-app UI 重构实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 将现有 UI 重构为符合设计规范的现代简约风格，实现完整页面功能和交互

**Architecture:**

- 先建立主题系统（CSS变量 + 深浅模式）
- 然后实现公共组件（导航、布局）
- 最后实现各页面功能

**Tech Stack:** Vue 3 + TypeScript + Element Plus + ECharts + Pinia

---

## 任务概览

| 阶段               | 任务数 |
| ------------------ | ------ |
| 阶段一：主题系统   | 3      |
| 阶段二：公共组件   | 4      |
| 阶段三：页面实现   | 5      |
| 阶段四：路由与集成 | 2      |

---

## 阶段一：主题系统

### Task 1: 创建主题 CSS 变量文件

**Files:**

- Create: `src/assets/styles/theme.css`

**Step 1: 创建浅色/深色 CSS 变量**

```css
/* 浅色模式变量（默认） */
:root {
  /* 主色系 */
  --color-primary: #14b8a6;
  --color-primary-light: #2dd4bf;
  --color-primary-dark: #0f766e;

  /* 背景色 */
  --color-bg-page: #f0fdfa;
  --color-bg-card: #ffffff;
  --color-bg-input: #f5f5f5;

  /* 文字色 */
  --color-text-primary: #134e4a;
  --color-text-secondary: #64748b;
  --color-text-disabled: #cbd5e1;

  /* 边框色 */
  --color-border: #e2e8f0;
  --color-border-hover: #14b8a6;

  /* 功能色 */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #3b82f6;

  /* 阴影 */
  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.08);
  --shadow-button: 0 8px 24px rgba(20, 184, 166, 0.3);
  --shadow-modal: 0 20px 50px rgba(0, 0, 0, 0.15);

  /* 圆角 */
  --radius-button: 20px;
  --radius-card: 20px;
  --radius-input: 16px;
  --radius-modal: 24px;
}

/* 深色模式 */
.dark {
  --color-primary: #2dd4bf;
  --color-primary-light: #5eead4;
  --color-primary-dark: #14b8a6;

  --color-bg-page: #052e16;
  --color-bg-card: #064e3b;
  --color-bg-input: #1e293b;

  --color-text-primary: #f0fdfa;
  --color-text-secondary: #94a3b8;
  --color-text-disabled: #475569;

  --color-border: #334155;
  --color-border-hover: #2dd4bf;

  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.4);
  --shadow-button: 0 8px 24px rgba(45, 212, 191, 0.25);
  --shadow-modal: 0 20px 50px rgba(0, 0, 0, 0.5);
}
```

**Step 2: 更新 base.css 引用主题**

Modify: `src/assets/styles/base.css:1`
添加:

```css
@import './theme.css';
```

**Step 3: 提交**

```bash
git add src/assets/styles/theme.css src/assets/styles/base.css
git commit -m "feat: add theme CSS variables for light/dark mode"
```

---

### Task 2: 创建主题切换工具

**Files:**

- Create: `src/utils/themeUtil.ts`

**Step 1: 编写主题工具函数**

```typescript
export type ThemeMode = 'light' | 'dark' | 'system'

export const getStoredTheme = (): ThemeMode => {
  return (localStorage.getItem('theme') as ThemeMode) || 'system'
}

export const setStoredTheme = (theme: ThemeMode): void => {
  localStorage.setItem('theme', theme)
}

export const getSystemTheme = (): 'light' | 'dark' => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const getEffectiveTheme = (): 'light' | 'dark' => {
  const stored = getStoredTheme()
  if (stored === 'system') {
    return getSystemTheme()
  }
  return stored
}

export const applyTheme = (theme: 'light' | 'dark'): void => {
  const html = document.documentElement
  if (theme === 'dark') {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
}

export const initTheme = (): void => {
  const theme = getEffectiveTheme()
  applyTheme(theme)

  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getStoredTheme() === 'system') {
      applyTheme(getSystemTheme())
    }
  })
}
```

**Step 2: 提交**

```bash
git add src/utils/themeUtil.ts
git commit -m "feat: add theme utility for theme switching"
```

---

### Task 3: 创建主题 Store

**Files:**

- Create: `src/stores/useThemeStore.ts`

**Step 1: 编写主题 Store**

```typescript
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { type ThemeMode, getEffectiveTheme, applyTheme, setStoredTheme } from '@/utils/themeUtil'

export const useThemeStore = defineStore('theme', () => {
  const themeMode = ref<ThemeMode>((localStorage.getItem('theme') as ThemeMode) || 'system')
  const effectiveTheme = ref<'light' | 'dark'>(getEffectiveTheme())

  const setThemeMode = (mode: ThemeMode) => {
    themeMode.value = mode
    setStoredTheme(mode)
    const effective =
      mode === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : mode
    effectiveTheme.value = effective
    applyTheme(effective)
  }

  // 初始化时应用主题
  applyTheme(effectiveTheme.value)

  return {
    themeMode,
    effectiveTheme,
    setThemeMode,
  }
})
```

**Step 2: 提交**

```bash
git add src/stores/useThemeStore.ts
git commit -m "feat: add theme store for theme state management"
```

---

## 阶段二：公共组件

### Task 4: 创建底部导航栏组件

**Files:**

- Create: `src/components/BottomNav.vue`

**Step 1: 创建底部导航组件**

```vue
<template>
  <div class="bottom-nav">
    <router-link
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      class="nav-item"
      :class="{ active: isActive(item.path) }"
    >
      <el-icon :size="22">
        <component :is="item.icon" />
      </el-icon>
      <span class="nav-label">{{ item.label }}</span>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { EditPen, DataAnalysis, Wallet, PieChart, Setting } from '@element-plus/icons-vue'

const route = useRoute()

const navItems = [
  { path: '/', label: '记账', icon: EditPen },
  { path: '/dashboard', label: '看板', icon: DataAnalysis },
  { path: '/bills', label: '账单', icon: Wallet },
  { path: '/statistics', label: '统计', icon: PieChart },
  { path: '/settings', label: '设置', icon: Setting },
]

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
}

.dark .bottom-nav {
  background: rgba(6, 78, 59, 0.9);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-item.active {
  color: var(--color-primary);
}

.nav-label {
  font-size: 12px;
  margin-top: 4px;
}
</style>
```

**Step 2: 提交**

```bash
git add src/components/BottomNav.vue
git commit -m "feat: add bottom navigation component"
```

---

### Task 5: 更新通用布局

**Files:**

- Modify: `src/views/layouts/CommonLayout.vue`

**Step 1: 更新布局添加底部导航**

Modify: `src/views/layouts/CommonLayout.vue`
添加:

```vue
<template>
  <div class="common-layout">
    <HeaderView />
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
import HeaderView from '@/views/HeaderView.vue'
import BottomNav from '@/components/BottomNav.vue'
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
</style>
```

**Step 2: 添加页面过渡样式**

在 `src/assets/styles/main.css` 添加:

```css
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
```

**Step 3: 提交**

```bash
git add src/views/layouts/CommonLayout.vue src/assets/styles/main.css
git commit -m "feat: update common layout with bottom nav and transitions"
```

---

### Task 6: 创建空状态组件

**Files:**

- Create: `src/components/EmptyState.vue`

**Step 1: 创建空状态组件**

```vue
<template>
  <div class="empty-state">
    <el-icon :size="48" class="empty-icon">
      <FolderOpened />
    </el-icon>
    <p class="empty-text">暂无数据</p>
  </div>
</template>

<script setup lang="ts">
import { FolderOpened } from '@element-plus/icons-vue'
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  color: var(--color-text-secondary);
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
}
</style>
```

**Step 2: 提交**

```bash
git add src/components/EmptyState.vue
git commit -m "feat: add empty state component"
```

---

### Task 7: 创建统计卡片组件

**Files:**

- Create: `src/components/StatCard.vue`

**Step 1: 创建统计卡片**

```vue
<template>
  <div class="stat-card" :class="[typeClass]">
    <div class="stat-icon">
      <el-icon :size="24">
        <component :is="icon" />
      </el-icon>
    </div>
    <div class="stat-info">
      <div class="stat-label">{{ label }}</div>
      <div class="stat-value">{{ value }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  value: string | number
  icon: any
  type?: 'default' | 'income' | 'expense' | 'balance'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
})

const typeClass = computed(() => `stat-card--${props.type}`)
</script>

<style scoped>
.stat-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow-card);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-button);
}

.stat-card--income .stat-icon {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.stat-card--expense .stat-icon {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.stat-card--balance .stat-icon {
  background: rgba(20, 184, 166, 0.1);
  color: var(--color-primary);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-input);
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}
</style>
```

**Step 2: 提交**

```bash
git add src/components/StatCard.vue
git commit -m "feat: add stat card component"
```

---

## 阶段三：页面实现

### Task 8: 实现首页（智能记账）

**Files:**

- Create: `src/views/HomeView.vue`

**Step 1: 创建首页**

```vue
<template>
  <div class="home-view">
    <div class="input-container">
      <textarea
        v-model="inputText"
        class="smart-input"
        placeholder="输入转账记录，如：今天吃饭花了50元"
        @keydown.enter.ctrl="handleSubmit"
      ></textarea>
      <el-button type="primary" class="submit-btn" :loading="loading" @click="handleSubmit">
        解析
      </el-button>
    </div>

    <!-- 确认弹窗 -->
    <el-dialog
      v-model="showConfirm"
      title="确认账单信息"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="billForm" label-width="80px">
        <el-form-item label="类型">
          <el-radio-group v-model="billForm.type">
            <el-radio :value="1">收入</el-radio>
            <el-radio :value="2">支出</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="金额">
          <el-input-number v-model="billForm.amount" :precision="2" :min="0" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="billForm.categoryId" placeholder="选择分类">
            <el-option
              v-for="cat in categoryList"
              :key="cat.id"
              :label="cat.category"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="billForm.transactionDate"
            type="datetime"
            placeholder="选择日期"
            value-format="x"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="billForm.note" placeholder="可选备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showConfirm = false">取消</el-button>
        <el-button type="primary" @click="confirmBill">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as billApi from '@/services/bill'

const inputText = ref('')
const loading = ref(false)
const showConfirm = ref(false)
const categoryList = ref<any[]>([])

const billForm = reactive({
  type: 2 as number,
  amount: 0,
  categoryId: 0,
  transactionDate: '',
  note: '',
})

const handleSubmit = async () => {
  if (!inputText.value.trim()) {
    ElMessage.warning('请输入账单内容')
    return
  }

  loading.value = true
  try {
    // 调用智能解析接口
    const res = await billApi.parseBillText({ text: inputText.value })
    const parsed = res.data.data

    // 填充表单
    billForm.type = parsed.type || 2
    billForm.amount = parsed.amount || 0
    billForm.categoryId = parsed.categoryId || 0
    billForm.transactionDate = parsed.date || new Date().getTime().toString()
    billForm.note = parsed.note || ''

    showConfirm.value = true
  } catch (error) {
    ElMessage.error('解析失败，请手动输入')
  } finally {
    loading.value = false
  }
}

const confirmBill = async () => {
  try {
    await billApi.saveFinanceTransactions(billForm)
    ElMessage.success('添加成功')
    showConfirm.value = false
    inputText.value = ''
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

onMounted(async () => {
  const res = await billApi.getCategory({ pageNum: 1, pageSize: 100 })
  categoryList.value = res.data.data.result || []
})
</script>

<style scoped>
.home-view {
  min-height: calc(100vh - 88px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px;
}

.input-container {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.smart-input {
  width: 100%;
  min-height: 200px;
  border: none;
  background: transparent;
  font-size: 18px;
  line-height: 1.6;
  color: var(--color-text-primary);
  resize: none;
  outline: none;
}

.smart-input::placeholder {
  color: var(--color-text-disabled);
}

.submit-btn {
  width: 100%;
  margin-top: 16px;
  height: 48px;
  font-size: 16px;
  border-radius: var(--radius-button);
}
</style>
```

**Step 2: 添加解析接口（可选，后续后端实现）**

在 `src/services/bill.ts` 添加:

```typescript
export const parseBillText = (data: { text: string }) => {
  return api.post('/app/parseBillText', { data })
}
```

**Step 3: 提交**

```bash
git add src/views/HomeView.vue src/services/bill.ts
git commit -m "feat: implement home view with smart bill input"
```

---

### Task 9: 重构仪表盘

**Files:**

- Modify: `src/views/DashboardView.vue`

**Step 1: 应用新主题样式**

根据设计规范更新 DashboardView.vue 的样式部分：

- 使用 CSS 变量替换硬编码颜色
- 使用 StatCard 组件
- 使用 EmptyState 组件

**Step 2: 提交**

```bash
git add src/views/DashboardView.vue
git commit -m "refactor: update dashboard with new theme styles"
```

---

### Task 10: 实现账单详情页

**Files:**

- Modify: `src/views/BillView.vue`

**Step 1: 实现完整账单页面**

实现功能：

- 顶部筛选栏
- 按日期分组列表
- 右侧操作按钮（编辑/删除）
- 加载骨架屏
- 空状态

**Step 2: 提交**

```bash
git add src/views/BillView.vue
git commit -m "feat: implement bills list page with filters"
```

---

### Task 11: 实现统计报表页

**Files:**

- Create: `src/views/StatisticsView.vue`

**Step 1: 创建统计页面**

实现功能：

- 响应式网格布局
- 收支趋势图
- 分类占比饼图
- 分类对比柱状图
- 预算执行情况

**Step 2: 提交**

```bash
git add src/views/StatisticsView.vue
git commit -m "feat: implement statistics page with charts"
```

---

### Task 12: 实现管理设置页

**Files:**

- Create: `src/views/SettingsView.vue`

**Step 1: 构建设置页面**

实现功能：

- 卡片式布局
- 分类管理
- 预算管理
- 主题切换
- 个人资料
- 关于

**Step 2: 提交**

```bash
git add src/views/SettingsView.vue
git commit -m "feat: implement settings page"
```

---

## 阶段四：路由与集成

### Task 13: 更新路由配置

**Files:**

- Modify: `src/router/index.ts`

**Step 1: 更新路由**

```typescript
const routes = [
  {
    path: '/',
    component: () => import('@/views/layouts/CommonLayout.vue'),
    meta: { requiresAuth: true },
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
        path: '/statistics',
        name: 'statistics',
        component: () => import('@/views/StatisticsView.vue'),
      },
      {
        path: '/settings',
        name: 'settings',
        component: () => import('@/views/SettingsView.vue'),
      },
    ],
  },
  // ... login routes
]
```

**Step 2: 提交**

```bash
git add src/router/index.ts
git commit -m "refactor: update router with new routes"
```

---

### Task 14: 初始化主题

**Files:**

- Modify: `src/main.ts`

**Step 1: 初始化主题**

```typescript
import { initTheme } from '@/utils/themeUtil'

// 在 createApp 后调用
const app = createApp(App)
initTheme()
// ... rest of setup
```

**Step 2: 提交**

```bash
git add src/main.ts
git commit -m "feat: initialize theme system on app startup"
```

---

## 实现完成

所有任务完成后，运行以下命令验证：

```bash
npm run dev
npm run type-check
npm run lint
```
