# AGENTS.md - mybill-app Developer Guide

## Project Overview

mybill-app is a Vue 3 + TypeScript personal finance management application using Vite, Pinia, Vue Router, Element Plus, and ECharts.

---

## Build Commands

```bash
# Development server (hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Lint and fix (ESLint + Prettier)
npm run lint

# Format code (Prettier only)
npm run format
```

**Note:** This project does not currently have a test framework configured. Do not add test dependencies without consulting the project owner.

---

## Code Style Guidelines

### Formatting (Prettier)

- **Quotes:** Single quotes (`'`) - no double quotes
- **Semicolons:** No semicolons at end of statements
- **Print width:** 100 characters max per line
- **Trailing commas:** Enabled

```typescript
// Good
const name = 'john'
const user = {
  id: 1,
  name: 'john',
}

// Bad
const name = 'john'
const user = { id: 1, name: 'john' }
```

### EditorConfig

- **Indentation:** 2 spaces (no tabs)
- **Line endings:** LF (Unix-style)
- **Charset:** UTF-8
- **Trim trailing whitespace:** Yes
- **Max line length:** 100

### TypeScript

- Always use explicit types for function parameters and return values when not obvious
- Use `interface` for object shapes, `type` for unions/aliases
- Enable strict type checking via `vue-tsc`

```typescript
// Good
interface User {
  id: number
  name: string
}

const getUser = (id: number): User => {
  // ...
}

// Avoid
const getUser = (id) => {
  // ...
}
```

### Imports

- Use `@/` alias for absolute imports from `src/`
- Group imports in this order: 1) Vue/Router/Stores, 2) Third-party libs, 3) Internal modules
- Named imports preferred over default where possible

```typescript
// Good
import { ref, onMounted } from 'vue'
import router from '@/router'
import { useUserInfoStore } from '@/stores/useUserInfoStore'
import * as billApi from '@/services/bill'
import type FinanceTransactions from '@/models/FinanceTransactions'
import { ElMessage, ElLoading } from 'element-plus'

// Bad
import Vue from 'vue'
import axios from 'axios'
```

### Naming Conventions

- **Files:** PascalCase for components (`DashboardView.vue`), camelCase for utilities (`commonUtil.ts`)
- **Components:** PascalCase (`<ElButton>`, `<UserCard />`)
- **Variables/functions:** camelCase
- **Constants:** SCREAMING_SNAKE_CASE
- **CSS classes:** kebab-case
- **TypeScript interfaces:** PascalCase (no `I` prefix)

```typescript
// Variables
const userName = 'john'
const MAX_RETRIES = 3

// Functions
const fetchUserData = () => {}

// Interfaces
interface UserProfile {
  id: number
  email: string
}
```

### Vue Components

- Use `<script setup lang="ts">` syntax
- Define props with `defineProps<{ ... }>()` and type-safe prop types
- Use `ref`, `reactive`, `computed` from Vue
- Prefer composition API over options API
- Order: `<template>`, `<script setup>`, `<style scoped>`, `<style>`

```vue
<template>
  <div class="component-name">
    <el-button type="primary">Click</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

interface Props {
  title: string
  id?: number
}

const props = withDefaults(defineProps<Props>(), {
  id: 0,
})

const isLoading = ref(false)

const handleClick = () => {
  ElMessage.success('Clicked!')
}
</script>

<style scoped>
.component-name {
  padding: 10px;
}
</style>
```

### Pinia Stores

- Store files: `useXxxStore.ts`
- Use `defineStore` with setup syntax or options syntax
- State: Use arrow functions returning objects
- Getters: Auto-cached, use explicit return types for complex getters
- Actions: Handle async operations, use try/catch

```typescript
// stores/useUserInfoStore.ts
import { defineStore } from 'pinia'

export const useUserInfoStore = defineStore('userInfo', {
  state: () => ({
    username: '',
    token: '',
  }),
  getters: {
    isLoggedIn: (state): boolean => !!state.token,
  },
  actions: {
    async login(credentials: Credentials) {
      // implementation
    },
  },
})
```

### API Services

- Place in `src/services/`
- Use Axios with interceptors defined in `services/base.ts`
- Handle errors with try/catch and show user feedback via `ElMessage`
- Return typed responses

```typescript
// services/bill.ts
import { api } from './base'

interface BillListParams {
  pageNum: number
  pageSize: number
  startTime?: string
  endTime?: string
}

export const getBillList = (params: BillListParams) => {
  return api.get('/bill/list', { params })
}
```

### Error Handling

- Always wrap async operations in try/catch
- Show user-friendly messages via `ElMessage.error()`
- Log errors to console with context
- Handle API errors in interceptors (see `services/base.ts`)

```typescript
try {
  const response = await api.get('/user/profile')
  // handle response
} catch (error) {
  console.error('Failed to fetch profile:', error)
  ElMessage.error('获取用户信息失败，请稍后重试')
}
```

### CSS / Styling

- Use `<style scoped>` for component-specific styles
- Prefer Element Plus component props over custom CSS where possible
- Use CSS variables from Element Plus (`var(--el-...)`)
- Follow BEM-like naming for complex custom classes

```vue
<style scoped>
.card-header {
  padding: 10px;
}

.card-header__title {
  font-weight: 600;
}
</style>
```

---

## Project Structure

```
src/
├── assets/          # Static assets (styles, images)
├── models/          # TypeScript classes/interfaces
├── router/         # Vue Router configuration
├── services/       # API service modules
├── stores/         # Pinia stores
├── types/          # Global type declarations
├── utils/          # Utility functions
├── views/          # Page components and layouts
├── App.vue         # Root component
└── main.ts         # Application entry point
```

---

## Common Patterns

### Route Guards (router/index.ts)

```typescript
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('accessToken')
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})
```

### Loading States

```typescript
import { ElLoading } from 'element-plus'

const loadingInstance = ElLoading.service({
  fullscreen: true,
  text: '加载中...',
})

try {
  // async operations
} finally {
  loadingInstance.close()
}
```

---

## Lint Before Committing

Always run `npm run lint` before committing to ensure code passes ESLint and Prettier checks.
