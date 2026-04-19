# UI 全面重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 mybill-app 视觉风格从翠绿简约升级为紫罗兰玻璃态（深色）+ 薰衣草雾（浅色）双主题。

**Architecture:** 先建立完整的 Design Token 系统（theme.css），再在 main.css 中定义全局公共类（`.glass-card`），最后逐组件应用 Token。所有颜色、阴影、模糊值均通过 CSS 变量引用，无硬编码。

**Tech Stack:** Vue 3, TypeScript, Element Plus, ECharts (vue-echarts), Vite

---

## 文件改动总览

| 文件 | 操作 |
|------|------|
| `src/assets/styles/theme.css` | 完全重写 |
| `src/assets/styles/main.css` | 大幅修改 |
| `src/assets/styles/login.css` | 完全重写 |
| `src/views/HeaderView.vue` | 修改 `<style scoped>` |
| `src/components/BottomNav.vue` | 修改 `<style scoped>` |
| `src/views/HomeView.vue` | 修改 `<style scoped>` |
| `src/views/DashboardView.vue` | 修改 `<style scoped>` + ECharts 配色 |
| `src/views/BillView.vue` | 修改 `<style scoped>` |
| `src/views/AddBillView.vue` | 修改 `<style scoped>` |
| `src/views/SettingsView.vue` | 修改 `<style scoped>` |
| `src/views/settings/BudgetView.vue` | 修改 `<style scoped>` |
| `src/views/settings/CategoriesView.vue` | 修改 `<style scoped>` |
| `src/views/StatisticsView.vue` | 修改 `<style scoped>` + ECharts 配色 |
| `src/views/manageView.vue` | 修改 `<style scoped>` |

---

## Task 1: 重写 theme.css — Token 系统基础

**Files:**
- Modify: `src/assets/styles/theme.css`

- [ ] **Step 1: 完全替换 theme.css 内容**

用以下内容替换 `src/assets/styles/theme.css` 的全部内容：

```css
/* ========================================
   mybill-app Design Token System
   双主题：紫罗兰玻璃态（深色）+ 薰衣草雾（浅色）
   ======================================== */

/* ===== 浅色模式 :root ===== */
:root {
  /* 背景 — 使用时写 background: var(--color-bg-base)，不能用 background-color */
  --color-bg-base:        linear-gradient(145deg, #f5f3ff, #ede9fe);
  --color-bg-card:        rgba(255, 255, 255, 0.65);
  --color-bg-input:       rgba(255, 255, 255, 0.85);
  --color-bg-page:        #f5f3ff;

  /* 强调色 */
  --color-accent:         #7c3aed;
  --color-accent-strong:  #6d28d9;
  --color-accent-subtle:  rgba(124, 58, 237, 0.12);

  /* 文字 */
  --color-text-primary:   #0f0e17;
  --color-text-secondary: #3b3568;
  --color-text-muted:     #6b6499;
  --color-text-disabled:  #b8b0d8;

  /* 边框 */
  --color-border:         rgba(124, 58, 237, 0.15);
  --color-border-hover:   rgba(124, 58, 237, 0.35);

  /* 功能色 */
  --color-income:         #059669;
  --color-expense:        #dc2626;
  --color-warning:        #d97706;
  --color-info:           #2563eb;
  --color-success:        #059669;
  --color-danger:         #dc2626;

  /* 玻璃态 */
  --glass-bg:             var(--color-bg-card);
  --glass-bg-raised:      var(--color-bg-input);
  --glass-border:         var(--color-border);
  --glass-blur:           12px;

  /* 阴影 */
  --shadow-card:          0 4px 24px rgba(124, 58, 237, 0.08);
  --shadow-accent:        0 8px 24px rgba(124, 58, 237, 0.20);
  --shadow-modal:         0 24px 60px rgba(124, 58, 237, 0.15);
  --shadow-button:        0 8px 24px rgba(124, 58, 237, 0.25);

  /* 圆角 */
  --radius-card:          20px;
  --radius-input:         14px;
  --radius-button:        12px;
  --radius-modal:         24px;
  --radius-tag:           8px;

  /* 动效 */
  --motion-fast:          150ms ease-out;
  --motion-base:          250ms ease-out;
  --motion-slow:          400ms ease-in-out;
  --motion-spring:        cubic-bezier(0.34, 1.56, 0.64, 1);

  /* 收入/支出（向后兼容） */
  --color-primary:        #7c3aed;
  --color-primary-light:  #a78bfa;
  --color-primary-dark:   #6d28d9;
}

/* ===== 深色模式 .dark ===== */
.dark {
  /* 背景 */
  --color-bg-base:        linear-gradient(145deg, #12062b, #1e0a45);
  --color-bg-card:        rgba(255, 255, 255, 0.06);
  --color-bg-input:       rgba(255, 255, 255, 0.10);
  --color-bg-page:        #12062b;

  /* 强调色 */
  --color-accent:         #d8b4fe;
  --color-accent-strong:  #a78bfa;
  --color-accent-subtle:  rgba(192, 132, 252, 0.15);

  /* 文字 */
  --color-text-primary:   #ffffff;
  --color-text-secondary: rgba(255, 255, 255, 0.80);
  --color-text-muted:     rgba(255, 255, 255, 0.55);
  --color-text-disabled:  rgba(255, 255, 255, 0.25);

  /* 边框 */
  --color-border:         rgba(255, 255, 255, 0.12);
  --color-border-hover:   rgba(255, 255, 255, 0.25);

  /* 功能色 */
  --color-income:         #6ee7b7;
  --color-expense:        #fca5a5;
  --color-warning:        #fcd34d;
  --color-info:           #93c5fd;
  --color-success:        #6ee7b7;
  --color-danger:         #fca5a5;

  /* 玻璃态 */
  --glass-bg:             var(--color-bg-card);
  --glass-bg-raised:      var(--color-bg-input);
  --glass-border:         var(--color-border);
  --glass-blur:           16px;

  /* 阴影 */
  --shadow-card:          0 8px 32px rgba(0, 0, 0, 0.45);
  --shadow-accent:        0 8px 24px rgba(192, 132, 252, 0.25);
  --shadow-modal:         0 24px 60px rgba(0, 0, 0, 0.60);
  --shadow-button:        0 8px 24px rgba(192, 132, 252, 0.30);

  /* 向后兼容 */
  --color-primary:        #d8b4fe;
  --color-primary-light:  #e9d5ff;
  --color-primary-dark:   #a78bfa;
}

/* ========================================
   Element Plus 组件 Token 覆盖
   ======================================== */

.el-button--primary {
  --el-button-bg-color:           var(--color-accent) !important;
  --el-button-border-color:       var(--color-accent) !important;
  --el-button-hover-bg-color:     var(--color-accent-strong) !important;
  --el-button-hover-border-color: var(--color-accent-strong) !important;
  --el-button-active-bg-color:    var(--color-accent-strong) !important;
}

.el-button--danger {
  --el-button-bg-color:     var(--color-danger) !important;
  --el-button-border-color: var(--color-danger) !important;
}

.el-button,
.el-input__wrapper,
.el-card,
.el-dialog {
  border-radius: var(--radius-button) !important;
}
```

- [ ] **Step 2: 启动开发服务器验证 Token 加载**

```bash
npm run dev
```

打开浏览器访问 `http://localhost:5173`，确认页面没有报错，颜色已从翠绿变为紫色系。

- [ ] **Step 3: 提交**

```bash
git add src/assets/styles/theme.css
git commit -m "style: 重写 theme.css — 建立紫罗兰/薰衣草双主题 Token 系统"
```

---

## Task 2: 更新 main.css — 全局样式 + 公共 glass-card 类

**Files:**
- Modify: `src/assets/styles/main.css`

- [ ] **Step 1: 替换 main.css 内容**

用以下内容替换 `src/assets/styles/main.css` 的全部内容：

```css
@import './base.css';

#app {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  font-weight: normal;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: var(--color-bg-base);
  background-attachment: fixed;
  min-height: 100vh;
  color: var(--color-text-primary);
}

a,
.green {
  text-decoration: none;
  color: var(--color-accent);
  transition: var(--motion-fast);
  padding: 3px;
}

@media (hover: hover) {
  a:hover {
    background-color: var(--color-accent-subtle);
  }
}

@media (min-width: 1024px) {
  body {
    display: block;
    min-height: 100vh;
  }

  #app {
    width: 100%;
    display: flex;
    flex-direction: column;
  }
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 15px;
}

/* 主容器 */
.main-container {
  min-height: calc(100vh - 124px);
  padding-bottom: 80px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px;
}

/* ========================================
   公共玻璃卡片类
   使用：在组件内 <div class="glass-card">
   父容器需有非不透明背景（body 已设置）
   ======================================== */
.glass-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}

/* ========================================
   深色模式 — Element Plus 组件覆盖
   ======================================== */
.dark {
  --el-bg-color:              var(--color-bg-card);
  --el-bg-color-overlay:      var(--color-bg-card);
  --el-text-color-primary:    var(--color-text-primary);
  --el-text-color-regular:    var(--color-text-primary);
  --el-text-color-secondary:  var(--color-text-secondary);
  --el-border-color:          var(--color-border);
  --el-border-color-light:    var(--color-border);
  --el-fill-color-blank:      var(--color-bg-input);
  --el-color-primary:         var(--color-accent);
}

.dark .el-card {
  --el-card-bg-color: var(--color-bg-card);
  background: var(--glass-bg);
  border-color: var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  color: var(--color-text-primary);
}

.dark .el-button {
  --el-button-bg-color:     var(--color-bg-input);
  --el-button-border-color: var(--color-border);
  --el-button-text-color:   var(--color-text-primary);
}

.dark .el-input__wrapper {
  background-color: var(--color-bg-input);
  box-shadow: 0 0 0 1px var(--color-border) inset;
}

.dark .el-input__inner {
  color: var(--color-text-primary);
}

.dark .el-select-dropdown {
  background-color: var(--color-bg-card);
  border-color: var(--color-border);
}

.dark .el-dialog {
  --el-dialog-bg-color: transparent;
  background: rgba(18, 6, 43, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--color-border);
}

.dark .el-form-item__label {
  color: var(--color-text-primary);
}

.dark .el-radio-button__inner {
  background-color: var(--color-bg-input);
  border-color: var(--color-border);
  color: var(--color-text-primary);
}

.dark .el-radio-button__original-radio:checked + .el-radio-button__inner {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}

.dark .el-skeleton__item {
  background: linear-gradient(
    90deg,
    var(--color-bg-input) 25%,
    var(--color-bg-card) 37%,
    var(--color-bg-input) 63%
  );
}

/* ========================================
   全局弹窗样式
   ======================================== */
.el-dialog {
  border-radius: var(--radius-modal) !important;
}

.el-dialog__header {
  padding: 20px 24px !important;
  border-bottom: 1px solid var(--color-border);
}

.el-dialog__title {
  font-size: 16px !important;
  font-weight: 600;
  color: var(--color-text-primary);
}

.el-dialog__body {
  padding: 24px !important;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-form-item__label {
  font-size: 14px !important;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 8px;
  line-height: 1.5;
}

.el-input__wrapper {
  border-radius: var(--radius-input);
  padding: 8px 12px;
}

.el-input-number {
  width: 100%;
}

.el-select {
  width: 100%;
}

.el-radio-group {
  display: flex;
  gap: 12px;
}

.el-radio-button {
  flex: 1;
}

.el-radio-button__inner {
  width: 100%;
  border-radius: var(--radius-input) !important;
}

.el-date-editor {
  width: 100%;
}

.el-dialog__footer {
  padding: 16px 24px !important;
  border-top: 1px solid var(--color-border);
}

.el-dialog__footer .el-button {
  border-radius: var(--radius-button);
  padding: 10px 24px;
}
```

- [ ] **Step 2: 验证**

浏览器访问 `http://localhost:5173`，确认：
1. body 背景呈现淡紫渐变（浅色模式）
2. 切换深色模式后背景变为深紫渐变
3. Element Plus 组件主色变为紫色

- [ ] **Step 3: 提交**

```bash
git add src/assets/styles/main.css
git commit -m "style: 更新 main.css — 全局背景渐变、glass-card 公共类、Element Plus 覆盖"
```

---

## Task 3: HeaderView.vue — 玻璃态顶栏

**Files:**
- Modify: `src/views/HeaderView.vue`

- [ ] **Step 1: 替换 HeaderView.vue 的 `<style scoped>` 块**

将文件末尾的整个 `<style scoped>...</style>` 替换为：

```vue
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
```

- [ ] **Step 2: 验证**

访问 `http://localhost:5173`，确认 Header：
1. 背景呈毛玻璃效果（可透出下方内容）
2. 标题文字颜色跟随主题（浅色深色均清晰）
3. 头像边框为紫色调

- [ ] **Step 3: 提交**

```bash
git add src/views/HeaderView.vue
git commit -m "style(header): 换玻璃态背景，强调色换紫调"
```

---

## Task 4: BottomNav.vue — 玻璃底栏 + 激活指示条

**Files:**
- Modify: `src/components/BottomNav.vue`

- [ ] **Step 1: 替换 BottomNav.vue 的 `<style scoped>` 块**

```vue
<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-top: 1px solid var(--glass-border);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
}

.dark .bottom-nav {
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color var(--motion-fast);
  position: relative;
  padding-top: 4px;
  height: 100%;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 24px;
  height: 2px;
  background: var(--color-accent);
  border-radius: 0 0 4px 4px;
  transition: transform var(--motion-spring);
}

.nav-item:hover {
  color: var(--color-accent);
}

.nav-item.active {
  color: var(--color-accent);
}

.nav-item.active::before {
  transform: translateX(-50%) scaleX(1);
}

.nav-label {
  font-size: 11px;
  margin-top: 3px;
  font-weight: 500;
}
</style>
```

- [ ] **Step 2: 验证**

访问各页面，确认：
1. 底栏背景毛玻璃（透出内容）
2. 激活页对应导航项顶部有紫色短横线指示条
3. 切换页面时指示条有弹性动画

- [ ] **Step 3: 提交**

```bash
git add src/components/BottomNav.vue
git commit -m "style(bottom-nav): 玻璃态背景，新增激活指示条动效"
```

---

## Task 5: login.css — 登录页玻璃态重写

**Files:**
- Modify: `src/assets/styles/login.css`

- [ ] **Step 1: 完全替换 login.css 内容**

```css
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--color-bg-base);
  background-attachment: fixed;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  padding: 20px;
}

/* 装饰圆球 */
.decoration {
  position: absolute;
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
  pointer-events: none;
}

.decoration:nth-child(1) {
  width: 300px;
  height: 300px;
  top: -150px;
  left: -150px;
  animation-delay: 0s;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.15), rgba(124, 58, 237, 0.05));
  border: 1px solid rgba(124, 58, 237, 0.15);
}

.decoration:nth-child(2) {
  width: 200px;
  height: 200px;
  bottom: -100px;
  right: -100px;
  animation-delay: -2s;
  background: radial-gradient(circle, rgba(192, 132, 252, 0.15), rgba(192, 132, 252, 0.05));
  border: 1px solid rgba(192, 132, 252, 0.15);
}

.decoration:nth-child(3) {
  width: 150px;
  height: 150px;
  top: 40%;
  right: -75px;
  animation-delay: -4s;
  background: radial-gradient(circle, rgba(167, 139, 250, 0.1), transparent);
  border: 1px solid rgba(167, 139, 250, 0.1);
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
  50%       { transform: translateY(-20px) rotate(180deg) scale(1.05); }
}

/* 登录卡片 */
.login-box {
  width: 420px;
  padding: 2.5rem;
  background: var(--glass-bg-raised);
  border-radius: var(--radius-modal);
  box-shadow: var(--shadow-modal);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: relative;
  z-index: 1;
  border: 1px solid var(--glass-border);
  transition: transform var(--motion-slow), box-shadow var(--motion-slow);
}

.login-box:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-accent);
}

/* Logo */
.logo {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo-icon {
  font-size: 3.5rem;
  color: var(--color-accent);
  margin-bottom: 1rem;
  filter: drop-shadow(0 4px 12px rgba(124, 58, 237, 0.3));
  display: block;
  transition: transform var(--motion-slow);
}

.logo:hover .logo-icon {
  transform: rotate(360deg);
}

.logo h1 {
  color: var(--color-accent);
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.5px;
}

/* Tab 切换 */
.tabs {
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--color-border);
  position: relative;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 1rem;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: color var(--motion-fast);
  position: relative;
  font-weight: 500;
  font-size: 1.1rem;
}

.tab:hover {
  color: var(--color-accent);
}

.tab.active {
  color: var(--color-accent);
  font-weight: 600;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--color-accent);
  border-radius: 2px;
}

/* 表单区域 */
.form-container {
  margin-top: 1.5rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.login-box :deep(.el-input__wrapper) {
  padding: 8px 16px;
  border-radius: var(--radius-input);
  background: var(--color-bg-input);
  border: 1px solid var(--color-border);
  box-shadow: none;
  transition: border-color var(--motion-fast), box-shadow var(--motion-fast);
}

.login-box :deep(.el-input__wrapper:hover) {
  border-color: var(--color-border-hover);
}

.login-box :deep(.el-input__wrapper.is-focus) {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-subtle);
}

.login-box :deep(.el-input__inner) {
  height: 24px;
  line-height: 24px;
  color: var(--color-text-primary);
}

.login-box :deep(.el-input__inner::placeholder) {
  color: var(--color-text-disabled);
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  margin-top: 2rem;
  padding: 14px;
  font-size: 1.05rem;
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-strong));
  border: none;
  border-radius: var(--radius-button);
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: transform var(--motion-fast), box-shadow var(--motion-fast);
  cursor: pointer;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-button);
}

.submit-btn:active {
  transform: translateY(0);
}

/* 链接 */
.links {
  margin-top: 1.5rem;
  text-align: center;
}

.links a {
  color: var(--color-accent);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: opacity var(--motion-fast);
}

.links a:hover {
  opacity: 0.75;
}

/* 验证码 */
.verification-code {
  display: flex;
  gap: 1rem;
}

.verification-code .el-input {
  flex: 1;
}

.verification-code .el-button {
  white-space: nowrap;
  border-radius: var(--radius-input);
  font-weight: 500;
  background: var(--color-bg-input);
  border-color: var(--color-border);
  color: var(--color-text-secondary);
  transition: var(--motion-fast);
}

.verification-code .el-button:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

/* 响应式 */
@media (max-width: 768px) {
  .login-container { padding: 1rem; }
  .login-box { width: 95%; max-width: 420px; padding: 2rem; }
}

@media (max-width: 480px) {
  .login-container { padding: 0.5rem; }
  .login-box { width: 100%; padding: 1.5rem; border-radius: var(--radius-card); }
  .logo-icon { font-size: 3rem; }
  .logo h1   { font-size: 1.5rem; }
  .tab       { padding: 0.75rem; font-size: 1rem; }
  .submit-btn { padding: 12px; font-size: 1rem; }
}
```

- [ ] **Step 2: 验证**

访问 `http://localhost:5173/login`，确认：
1. 背景为淡紫渐变（浅色）/ 深紫渐变（深色）
2. 登录卡片有毛玻璃效果
3. 按钮为紫色渐变
4. 表单 focus 时显示紫色光晕

- [ ] **Step 3: 提交**

```bash
git add src/assets/styles/login.css
git commit -m "style(login): 玻璃态卡片，换紫罗兰配色"
```

---

## Task 6: HomeView.vue — AI 记账页

**Files:**
- Modify: `src/views/HomeView.vue`

- [ ] **Step 1: 替换 HomeView.vue 的 `<style scoped>` 块**

```vue
<style scoped>
.home-view {
  min-height: calc(100vh - 104px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px;
}

.input-container {
  background: var(--glass-bg-raised);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--radius-card);
  padding: 32px;
  box-shadow: var(--shadow-card);
}

.smart-input {
  width: 100%;
  min-height: 240px;
  border: none;
  background: transparent;
  font-size: 18px;
  line-height: 1.8;
  color: var(--color-text-primary);
  resize: none;
  outline: none;
}

.smart-input::placeholder {
  color: var(--color-text-disabled);
}

.submit-btn {
  width: 100%;
  margin-top: 20px;
  height: 52px;
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--radius-button);
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-strong));
  border: none;
  color: #fff;
  cursor: pointer;
  transition: transform var(--motion-fast), box-shadow var(--motion-fast);
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-button);
}
</style>
```

- [ ] **Step 2: 验证**

访问 `http://localhost:5173`（首页），确认：
1. 输入框区域呈毛玻璃卡片
2. 解析按钮为紫色渐变
3. 深色模式下背景透出深紫底色

- [ ] **Step 3: 提交**

```bash
git add src/views/HomeView.vue
git commit -m "style(home): 玻璃态输入容器，紫色渐变按钮"
```

---

## Task 7: DashboardView.vue — 核心仪表盘

**Files:**
- Modify: `src/views/DashboardView.vue`

- [ ] **Step 1: 更新 ECharts 图表配色**

在 `DashboardView.vue` 的 `<script setup>` 中，找到 `chartOption` 和 `trendChartOption` 的定义，在两个对象内分别添加 `color` 字段。

在 `chartOption` 的 ref 初始化对象最外层（与 `tooltip`、`legend`、`series` 同级）添加：

```ts
color: ['#d8b4fe', '#a78bfa', '#6ee7b7', '#fca5a5', '#fcd34d', '#93c5fd'],
```

在 `trendChartOption` 的 ref 初始化对象最外层同样添加：

```ts
color: ['#6ee7b7', '#fca5a5', '#d8b4fe'],
```

注意：以上是深色模式配色。浅色模式暂用同一组色值（ECharts 不感知 CSS 变量，此配色在双主题下均可接受）。

- [ ] **Step 2: 替换 `<style>` 非 scoped 块**

找到文件中的 `<style>` 块（非 scoped，只有几行），替换为：

```vue
<style>
.recently-bill-card-header {
  padding: 10px;
  display: flex;
  border: 0;
}
</style>
```

- [ ] **Step 3: 替换 `<style scoped>` 块**

将整个 `<style scoped>` 替换为：

```vue
<style scoped>
/* 图标选择 */
.icon-list {
  display: flex;
  gap: 10px;
  padding: 0;
  margin: 0;
}

.icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-tag);
  background: var(--color-accent-subtle);
  transition: background var(--motion-fast);
  margin: 0 0 10px 0;
}

.icon-item:hover,
.icon-item.is-active {
  background: var(--color-accent);
  color: #fff;
}

.icon-item .el-icon {
  font-size: 24px;
}

.el-button--large {
  --el-button-size: 43px;
  font-size: 20px;
}

/* 仪表盘网格 */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.card-full-width {
  grid-column: span 2;
}

/* 玻璃卡片 */
.dashboard-grid-card {
  border-radius: var(--radius-card);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  box-shadow: var(--shadow-card);
}

/* 空状态 */
.common-empty-state {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: var(--color-text-muted);
  flex: 1;
}

.recentlyBill-empty-state {
  display: flex;
  height: 250px;
}

.budget-list-empty-state {
  display: flex;
  height: 200px;
}

/* 卡片标题 */
.card-header-title {
  flex: 70%;
  text-align: left;
  padding: 0 10px;
  color: var(--color-text-primary);
  font-weight: 600;
}

.card-header-link {
  flex: auto;
  text-align: center;
  color: var(--color-accent);
  background: transparent;
  font-size: 13px;
}

.card-header-link:hover {
  opacity: 0.75;
}

/* 统计概览 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat-card {
  background: var(--glass-bg-raised);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--radius-card);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow-card);
  transition: transform var(--motion-base), box-shadow var(--motion-base);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-accent);
}

.stat-card.income-card  { border-left: 3px solid var(--color-income); }
.stat-card.expense-card { border-left: 3px solid var(--color-expense); }
.stat-card.balance-card { border-left: 3px solid var(--color-accent); }

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.income-card  .stat-icon { background: rgba(6, 214, 160, 0.12); color: var(--color-income); }
.expense-card .stat-icon { background: rgba(220, 38, 38, 0.1);  color: var(--color-expense); }
.balance-card .stat-icon { background: var(--color-accent-subtle); color: var(--color-accent); }

.stat-info { flex: 1; min-width: 0; }

.stat-label {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 近期账单列表 */
.recently-bill-list {
  display: flex;
  flex-direction: column;
}

.recently-bill-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 8px;
  border-radius: 12px;
  transition: background var(--motion-fast);
}

.recently-bill-item:hover {
  background: var(--color-accent-subtle);
}

.recently-bill-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.bill-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(220, 38, 38, 0.1);
  color: var(--color-expense);
  font-size: 18px;
  flex-shrink: 0;
}

.bill-icon.is-income {
  background: rgba(6, 214, 160, 0.1);
  color: var(--color-income);
}

.bill-info { display: flex; flex-direction: column; min-width: 0; }

.bill-category {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bill-note {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bill-date {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.recently-bill-item-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.bill-amount {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-expense);
  min-width: 70px;
  text-align: right;
}

.bill-amount.is-income { color: var(--color-income); }

.bill-actions { display: flex; gap: 8px; }

.bill-actions .el-button {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-tag);
  background: var(--color-accent-subtle);
  border: none;
}

.bill-actions .el-button:hover {
  background: var(--color-accent);
  color: #fff;
}

/* 预算 */
.budget-list-content { padding: 4px 0; }

.budget-item {
  margin-bottom: 14px;
  padding: 10px;
  background: var(--glass-bg-raised);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
}

.budget-item:last-child { margin-bottom: 0; }

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.budget-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.budget-value {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.budget-bar {
  height: 6px;
  background: var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.budget-progress {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-strong));
  border-radius: 4px;
  transition: width var(--motion-slow);
}

.budget-progress.over {
  background: linear-gradient(90deg, var(--color-expense), #f87171);
}

/* 分类管理 */
.category-list-state {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 4px 0;
}

.category-list-state li {
  justify-content: center;
  align-items: center;
  display: flex;
}

.button-with-text {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.button-with-text span {
  margin-top: 5px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* 图表容器 */
.consumption-pie-chart {
  display: flex;
  height: 180px;
}

.consumption-trend-chart {
  display: flex;
  height: 220px;
}

/* Deep: el-card body padding */
:deep(.recently-bill .el-card__body) {
  padding: 0 10px 10px;
  height: 260px;
}

:deep(.budget-list-card .el-card__body) {
  padding: 8px 12px;
  min-height: 120px;
  max-height: 200px;
  overflow-y: auto;
}

:deep(.Consumption-pie .el-card__body) {
  padding: 0;
  height: 180px;
}

:deep(.trend-card .el-card__body) {
  padding: 0;
  height: 220px;
}

:deep(.category-list-card .el-card__body) {
  padding: 10px 12px 12px;
  height: auto;
}

/* 响应式 */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .card-full-width { grid-column: span 1; }
  .stat-card       { padding: 14px; }
  .stat-value      { font-size: 14px; }

  .recently-bill-item       { padding: 10px 4px; }
  .recently-bill-item-left  { gap: 10px; }
  .bill-icon                { width: 36px; height: 36px; font-size: 16px; }
  .recently-bill-item-right { gap: 10px; }
  .bill-amount              { font-size: 15px; min-width: 60px; }

  .bill-actions .el-button  { width: 28px; height: 28px; }
  .consumption-pie-chart    { height: 160px; }
  .consumption-trend-chart  { height: 180px; }

  :deep(.recently-bill .el-card__body),
  :deep(.budget-list-card .el-card__body),
  :deep(.Consumption-pie .el-card__body),
  :deep(.trend-card .el-card__body) {
    height: auto;
  }
}

@media (max-width: 480px) {
  .stats-overview { grid-template-columns: 1fr; gap: 10px; }
  .stat-card      { padding: 14px 16px; }
  .stat-value     { font-size: 16px; }
}
</style>
```

- [ ] **Step 4: 验证**

访问 `http://localhost:5173/dashboard`，确认：
1. 三个统计卡片呈玻璃态，左侧彩色竖线正确显示收入/支出/结余对应颜色
2. 所有卡片（近期账单、预算、饼图、趋势）均为玻璃态
3. 预算进度条为紫色渐变
4. 账单行 hover 时显示淡紫色背景
5. ECharts 饼图和折线图颜色为紫/绿/红色调

- [ ] **Step 5: 提交**

```bash
git add src/views/DashboardView.vue
git commit -m "style(dashboard): 全局玻璃卡片，ECharts 换紫调配色"
```

---

## Task 8: BillView.vue — 账单列表页

**Files:**
- Modify: `src/views/BillView.vue`

- [ ] **Step 1: 替换 BillView.vue 的 `<style scoped>` 块**

先读取当前 `<style scoped>` 内容，然后将所有颜色值替换为 Token：

关键替换规则：
- `#14b8a6` / `var(--color-primary)` → `var(--color-accent)`
- `var(--color-bg-card)` → `var(--glass-bg)`
- `var(--color-bg-input)` → `var(--glass-bg-raised)`
- `var(--color-text-secondary)` → 保持（已正确）
- `var(--shadow-card)` → 保持
- 筛选项激活色 → `var(--color-accent)`

在 `<style scoped>` 开头添加：

```css
.bills-view {
  padding: 0 4px;
}

.action-bar {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--radius-card);
  padding: 12px 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-card);
}

.filter-bar { display: flex; flex-direction: column; gap: 8px; }
.filter-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.filter-label { font-size: 13px; color: var(--color-text-muted); white-space: nowrap; }

.filter-options { display: flex; gap: 6px; flex-wrap: wrap; }

.filter-item {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  color: var(--color-text-secondary);
  background: var(--glass-bg-raised);
  border: 1px solid var(--color-border);
  transition: all var(--motion-fast);
}

.filter-item:hover { border-color: var(--color-accent); color: var(--color-accent); }

.filter-item.active {
  background: var(--color-accent-subtle);
  border-color: var(--color-accent);
  color: var(--color-accent);
  font-weight: 600;
}

.add-btn-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.bill-group {
  margin-bottom: 16px;
}

.bill-group-header {
  font-size: 13px;
  color: var(--color-text-muted);
  font-weight: 600;
  padding: 4px 8px;
  margin-bottom: 8px;
}

.bill-group-list {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.bill-item-with-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  transition: background var(--motion-fast);
}

.bill-item-with-actions:last-child { border-bottom: none; }
.bill-item-with-actions:hover { background: var(--color-accent-subtle); }

.bill-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(220, 38, 38, 0.1);
  color: var(--color-expense);
  flex-shrink: 0;
}

.bill-icon.income {
  background: rgba(6, 214, 160, 0.1);
  color: var(--color-income);
}

.bill-info { flex: 1; min-width: 0; }

.bill-note {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bill-date {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.bill-amount {
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
  margin-right: 8px;
}

.bill-amount.income  { color: var(--color-income); }
.bill-amount.expense { color: var(--color-expense); }

.bill-actions { display: flex; gap: 4px; flex-shrink: 0; }

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-tag);
  background: var(--glass-bg-raised);
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--motion-fast);
}

.action-btn:hover        { background: var(--color-accent-subtle); color: var(--color-accent); }
.action-btn.delete:hover { background: rgba(220, 38, 38, 0.1);     color: var(--color-expense); }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--color-text-muted);
}

.empty-icon  { margin-bottom: 12px; color: var(--color-text-disabled); }
.empty-text  { font-size: 14px; }

.loading-state { padding: 20px; }

.pagination-bar {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}
```

- [ ] **Step 2: 验证**

访问 `http://localhost:5173/bills`，确认：
1. 筛选栏为玻璃态卡片
2. 激活的筛选项呈紫色高亮
3. 账单列表项有分组，hover 有淡紫背景
4. 操作按钮 hover 颜色正确

- [ ] **Step 3: 提交**

```bash
git add src/views/BillView.vue
git commit -m "style(bills): 玻璃态筛选栏和账单列表"
```

---

## Task 9: AddBillView.vue — 添加/编辑账单弹窗

**Files:**
- Modify: `src/views/AddBillView.vue`

- [ ] **Step 1: 查找 AddBillView.vue 当前 `<style>` 块并替换**

将 AddBillView.vue 中的所有 `<style>` / `<style scoped>` 块替换为：

```vue
<style scoped>
:deep(.el-dialog) {
  background: var(--glass-bg-raised) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-modal);
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: var(--color-accent);
  border-color: var(--color-accent);
  box-shadow: -1px 0 0 0 var(--color-accent);
  color: #fff;
}

:deep(.el-input-number .el-input__wrapper) {
  background: var(--color-bg-input);
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  background: var(--color-accent-subtle);
  color: var(--color-accent);
  border-color: var(--color-border);
}
</style>
```

- [ ] **Step 2: 验证**

在首页或账单页触发新增/编辑弹窗，确认：
1. 弹窗背景为毛玻璃
2. 收入/支出单选按钮激活色为紫色
3. 输入框样式与主题一致

- [ ] **Step 3: 提交**

```bash
git add src/views/AddBillView.vue
git commit -m "style(add-bill): 弹窗玻璃态，表单控件换紫调"
```

---

## Task 10: SettingsView.vue + BudgetView.vue + CategoriesView.vue

**Files:**
- Modify: `src/views/SettingsView.vue`
- Modify: `src/views/settings/BudgetView.vue`
- Modify: `src/views/settings/CategoriesView.vue`

- [ ] **Step 1: 替换 SettingsView.vue 的 `<style scoped>` 块**

```vue
<style scoped>
.settings-view { padding: 4px; }

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.settings-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--radius-card);
  padding: 20px 16px;
  cursor: pointer;
  transition: transform var(--motion-base), box-shadow var(--motion-base),
              border-color var(--motion-fast);
  box-shadow: var(--shadow-card);
}

.settings-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-accent);
  border-color: var(--color-border-hover);
}

.settings-icon {
  font-size: 28px;
  margin-bottom: 10px;
}

.settings-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.settings-desc {
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.theme-options {
  display: flex;
  gap: 6px;
  margin-top: 12px;
}

.theme-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: var(--radius-tag);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all var(--motion-fast);
  background: var(--glass-bg-raised);
}

.theme-option:hover { border-color: var(--color-accent); }

.theme-option.active {
  border-color: var(--color-accent);
  background: var(--color-accent-subtle);
}

.theme-option-icon  { font-size: 16px; }

.theme-option-label {
  font-size: 10px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.theme-option.active .theme-option-label { color: var(--color-accent); }

@media (max-width: 480px) {
  .settings-grid { grid-template-columns: 1fr; }
}
</style>
```

- [ ] **Step 2: 更新 BudgetView.vue 和 CategoriesView.vue**

对这两个文件的 `<style scoped>` 块，进行如下替换（适用于两个文件）：

将所有 `var(--color-primary)` 替换为 `var(--color-accent)`
将所有 `var(--color-bg-card)` 替换为 `var(--glass-bg)`
将所有 `var(--color-bg-input)` 替换为 `var(--glass-bg-raised)`

在卡片/列表容器类中添加：
```css
backdrop-filter: blur(var(--glass-blur));
-webkit-backdrop-filter: blur(var(--glass-blur));
border: 1px solid var(--glass-border);
```

- [ ] **Step 3: 验证**

访问 `http://localhost:5173/settings`，确认：
1. 设置项卡片为玻璃态，hover 有上浮效果
2. 主题切换三个按钮激活态为紫色
3. 进入分类/预算子页，样式一致

- [ ] **Step 4: 提交**

```bash
git add src/views/SettingsView.vue src/views/settings/BudgetView.vue src/views/settings/CategoriesView.vue
git commit -m "style(settings): 玻璃态卡片，主题选项换紫调"
```

---

## Task 11: StatisticsView.vue + manageView.vue

**Files:**
- Modify: `src/views/StatisticsView.vue`
- Modify: `src/views/manageView.vue`

- [ ] **Step 1: 更新 StatisticsView.vue ECharts 配色**

在 StatisticsView.vue 的 `<script setup>` 中，为所有 ECharts `chartOption` 对象添加：

```ts
color: ['#d8b4fe', '#a78bfa', '#6ee7b7', '#fca5a5', '#fcd34d', '#93c5fd'],
```

- [ ] **Step 2: 替换 StatisticsView.vue 的 `<style scoped>` 块**

对 `<style scoped>` 执行 Token 替换：
- `var(--color-primary)` → `var(--color-accent)`
- `var(--color-bg-card)` → `var(--glass-bg)`，并添加 `backdrop-filter`
- `var(--shadow-card)` → 保持
- 所有 `background: var(--color-bg-input)` → `var(--glass-bg-raised)`

在每个卡片容器类中补充：
```css
border: 1px solid var(--glass-border);
backdrop-filter: blur(var(--glass-blur));
-webkit-backdrop-filter: blur(var(--glass-blur));
```

- [ ] **Step 3: 更新 manageView.vue**

对 manageView.vue 的 `<style scoped>` 执行相同 Token 替换，确保所有颜色引用切换为新 Token。

- [ ] **Step 4: 验证**

访问 `http://localhost:5173/statistics`，确认：
1. 页面卡片为玻璃态
2. ECharts 图表使用紫调配色
3. 切换浅色/深色模式后图表均可正常显示

- [ ] **Step 5: 最终全页面检查**

逐一访问所有页面（`/`、`/dashboard`、`/bills`、`/statistics`、`/settings`、`/login`），在浅色和深色两种模式下截图确认：
- 无残留翠绿色
- 文字在所有背景上均清晰可读
- 玻璃效果在深色/浅色下均正常生效

- [ ] **Step 6: 提交**

```bash
git add src/views/StatisticsView.vue src/views/manageView.vue
git commit -m "style(statistics, manage): ECharts 紫调配色，玻璃态卡片"
```

---

## 完成确认清单

- [ ] 所有页面无残留 `#14b8a6` / `#0f766e` 翠绿色值（可用 `grep -r "14b8a6" src/` 检查）
- [ ] 浅色模式：背景呈淡紫渐变，文字清晰（`#0f0e17`）
- [ ] 深色模式：背景呈深紫渐变，文字清晰（`#ffffff`）
- [ ] 所有卡片组件 `backdrop-filter` 生效（父容器背景非纯透明）
- [ ] ECharts 图表使用新配色数组
- [ ] `npm run build` 无 TypeScript 类型错误
