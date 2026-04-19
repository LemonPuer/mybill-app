# UI 全面重构设计规格

**日期**: 2026-04-19  
**范围**: mybill-app 全页面视觉升级  
**方案**: 方案三 — 先建 Design Token 系统，再全面应用

---

## 一、设计方向

| 维度 | 决策 |
|------|------|
| 整体风格 | 暗黑玻璃态（Glassmorphism Dark） |
| 深色主题 | 紫罗兰·星空 — 深紫背景 + 淡紫高亮 |
| 浅色主题 | 薰衣草·雾 — 淡紫渐变背景 + 深紫强调色 |
| 主题支持 | 保留双主题（深色 `.dark` + 浅色 `:root`） |

---

## 二、Design Token 系统

### 2.1 颜色 Token

```css
/* ===== 浅色模式 :root ===== */
:root {
  /* 背景 */
  --color-bg-base:         linear-gradient(145deg, #f5f3ff, #ede9fe);
  --color-bg-card:         rgba(255, 255, 255, 0.65);
  --color-bg-input:        rgba(255, 255, 255, 0.85);

  /* 强调色 */
  --color-accent:          #7c3aed;
  --color-accent-strong:   #6d28d9;
  --color-accent-subtle:   rgba(124, 58, 237, 0.12);

  /* 文字 */
  --color-text-primary:    #0f0e17;
  --color-text-secondary:  #3b3568;
  --color-text-muted:      #6b6499;
  --color-text-disabled:   #b8b0d8;

  /* 边框 */
  --color-border:          rgba(124, 58, 237, 0.15);
  --color-border-hover:    rgba(124, 58, 237, 0.35);

  /* 功能色 */
  --color-income:          #059669;
  --color-expense:         #dc2626;
  --color-warning:         #d97706;
  --color-info:            #2563eb;
}

/* ===== 深色模式 .dark ===== */
.dark {
  /* 背景 */
  --color-bg-base:         linear-gradient(145deg, #12062b, #1e0a45);
  --color-bg-card:         rgba(255, 255, 255, 0.06);
  --color-bg-input:        rgba(255, 255, 255, 0.10);

  /* 强调色 */
  --color-accent:          #d8b4fe;
  --color-accent-strong:   #a78bfa;
  --color-accent-subtle:   rgba(192, 132, 252, 0.15);

  /* 文字 */
  --color-text-primary:    #ffffff;
  --color-text-secondary:  rgba(255, 255, 255, 0.80);
  --color-text-muted:      rgba(255, 255, 255, 0.55);
  --color-text-disabled:   rgba(255, 255, 255, 0.25);

  /* 边框 */
  --color-border:          rgba(255, 255, 255, 0.12);
  --color-border-hover:    rgba(255, 255, 255, 0.25);

  /* 功能色 */
  --color-income:          #6ee7b7;
  --color-expense:         #fca5a5;
  --color-warning:         #fcd34d;
  --color-info:            #93c5fd;
}
```

### 2.2 玻璃态 Token

```css
/* 双主题通用结构，具体值由颜色 Token 驱动 */
:root {
  --glass-bg:              var(--color-bg-card);
  --glass-bg-raised:       var(--color-bg-input);
  --glass-border:          var(--color-border);
  --glass-blur:            12px;        /* 浅色模式 */
}

.dark {
  --glass-blur:            16px;        /* 深色模式模糊更强 */
}

/* 使用方式（组件内） */
.glass-card {
  background:             var(--glass-bg);
  border:                 1px solid var(--glass-border);
  backdrop-filter:        blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
}
```

### 2.3 阴影 Token

```css
:root {
  --shadow-card:    0 4px 24px rgba(124, 58, 237, 0.08);
  --shadow-accent:  0 8px 24px rgba(124, 58, 237, 0.20);
  --shadow-modal:   0 24px 60px rgba(124, 58, 237, 0.15);
}

.dark {
  --shadow-card:    0 8px 32px rgba(0, 0, 0, 0.45);
  --shadow-accent:  0 8px 24px rgba(192, 132, 252, 0.25);
  --shadow-modal:   0 24px 60px rgba(0, 0, 0, 0.60);
}
```

### 2.4 圆角 Token（双主题共享）

```css
:root {
  --radius-card:    20px;
  --radius-input:   14px;
  --radius-button:  12px;
  --radius-modal:   24px;
  --radius-tag:     8px;
}
```

### 2.5 动效 Token（双主题共享）

```css
:root {
  --motion-fast:    150ms ease-out;
  --motion-base:    250ms ease-out;
  --motion-slow:    400ms ease-in-out;
  --motion-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 三、文件改动范围

### 3.1 全局样式

| 文件 | 改动 |
|------|------|
| `src/assets/styles/theme.css` | **完全重写** — 替换为上述 Token 系统，删除原有翠绿配色 |
| `src/assets/styles/main.css` | 更新 body 背景渐变、全局 glass-card 公共类、Element Plus 覆盖换用新 Token |
| `src/assets/styles/base.css` | 无需改动 |

### 3.2 组件改动

**HeaderView.vue** (`src/views/HeaderView.vue`)
- 背景改为 `var(--color-bg-base)` + `backdrop-filter` 毛玻璃效果
- 去掉固定翠绿渐变，改用 `--color-accent` 作为 border-bottom 强调线
- 阴影换 `--shadow-card`

**BottomNav.vue** (`src/components/BottomNav.vue`)
- 背景换 `var(--glass-bg)` + `backdrop-filter`
- 激活色换 `--color-accent`
- 激活项增加上方指示条（2px，`--color-accent`，`--motion-fast` 过渡）
- 深色模式边框换 `--color-border`

**DashboardView.vue** (`src/views/DashboardView.vue`)
- StatCard 三卡片换玻璃态（`glass-card`）
- 左侧彩色竖条换 `--color-accent-subtle` 背景图标
- 仪表盘卡片（近期账单、预算、饼图、趋势）全换玻璃态
- 预算进度条颜色换 `--color-accent`
- ECharts 图表颜色同步换紫调

**HomeView.vue** (`src/views/HomeView.vue`)
- 输入框容器换玻璃态
- 提交按钮换 `--color-accent` 渐变
- 页面背景跟随 `--color-bg-base`

**LoginView.vue** (`src/views/LoginView.vue`)
- 页面背景换 `--color-bg-base` 渐变
- 登录卡片玻璃化
- 按钮、输入框换新 Token

**BillView.vue** (`src/views/BillView.vue`)
- 账单列表项换 `glass-card` 样式
- 分割线换 `--color-border`
- 类型标签换 `--color-accent-subtle` + `--color-accent`

**SettingsView.vue** + **BudgetView.vue** + **CategoriesView.vue**
- 列表项、设置项换玻璃卡片
- 危险操作按钮保留红色，其余换 `--color-accent`

**StatisticsView.vue** (`src/views/StatisticsView.vue`)
- ECharts 配色同步紫调
- 页面背景、卡片换新 Token

**AddBillView.vue** (`src/views/AddBillView.vue`)
- 弹窗卡片换 `--glass-bg` + `--shadow-modal`
- 表单输入框换 `--color-bg-input` + `--color-border`
- 单选按钮组激活态换 `--color-accent`

**manageView.vue** (`src/views/manageView.vue`)
- 列表卡片换玻璃态，Token 统一换用

---

## 四、实施顺序

1. **重写 `theme.css`** — 建立完整 Token 系统（基础，所有后续步骤依赖此步）
2. **更新 `main.css`** — 全局背景、公共 glass-card 类、Element Plus 覆盖
3. **HeaderView + BottomNav** — 最高频可见组件，优先验证视觉效果
4. **DashboardView** — 核心页面，最复杂，Token 应用最多
5. **HomeView + LoginView** — 入口页面
6. **BillView + SettingsView + StatisticsView** — 列表型页面

---

## 五、注意事项

- `backdrop-filter` 生效需要父元素**非不透明背景**，确保 `body` 背景为渐变而非纯色
- `--color-bg-base` 值为 `linear-gradient(...)`，组件使用时写 `background: var(--color-bg-base)`，不能用 `background-color`
- Element Plus 组件覆盖全部改用新 Token，删除原有 `!important` 翠绿硬编码
- ECharts 图表颜色无法由 CSS Token 驱动，需在各组件 `chartOption` 中硬编码：
  - 深色：`['#d8b4fe', '#a78bfa', '#6ee7b7', '#fca5a5', '#fcd34d', '#93c5fd']`
  - 浅色：`['#7c3aed', '#6d28d9', '#059669', '#dc2626', '#d97706', '#2563eb']`
- 深色模式 `.dark` 类由现有 `useThemeStore` 控制，无需改动切换逻辑
