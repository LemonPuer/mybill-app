# Dashboard UI 重设计方案

**日期：** 2026-04-19
**文件：** `src/views/DashboardView.vue`
**设计方向：** 精炼玻璃态（在现有紫罗兰玻璃态基础上升级）

---

## 1. 页面布局结构

移除「类型管理」卡片，仪表盘专注于数据展示。信息层次从"总览 → 分析 → 明细 → 趋势"。

```
┌─────────────────────────────────────────────┐
│  [收入卡片]    [支出卡片]    [结余卡片]       │  ← 统计概览行
└─────────────────────────────────────────────┘
┌──────────────────┐  ┌──────────────────────┐
│  预算执行情况    │  │   消费分类占比         │  ← 两列并排
└──────────────────┘  └──────────────────────┘
┌─────────────────────────────────────────────┐
│              近期账单（全宽）                 │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│              消费趋势（全宽）                 │
└─────────────────────────────────────────────┘
```

**Grid 定义：**
- 桌面端（>768px）：`grid-template-columns: 1fr 1fr`，预算和饼图各占一列
- 移动端（≤768px）：`grid-template-columns: 1fr`，所有卡片单列
- 全宽卡片：`grid-column: span 2`（移动端降为 `span 1`）

---

## 2. 统计概览卡片

### 尺寸与排版
- 卡片高度：`min-height: 90px`（原 ~70px）
- 数字字号：`24px`，`font-weight: 800`（原 `16px 700`）
- 标签字号：`12px`，`color: var(--color-text-muted)`

### 图标区
- 尺寸：`48×48px`（原 `44×44px`）
- 背景：渐变圆角方块，圆角 `14px`
  - 收入卡片：`linear-gradient(135deg, rgba(5,150,105,0.2), rgba(6,214,160,0.1))`，图标色 `var(--color-income)`
  - 支出卡片：`linear-gradient(135deg, rgba(220,38,38,0.2), rgba(248,113,113,0.1))`，图标色 `var(--color-expense)`
  - 结余卡片：`linear-gradient(135deg, var(--color-accent-subtle), rgba(124,58,237,0.05))`，图标色 `var(--color-accent)`

### 环比标签


### 彩色竖条
- 左侧竖条保留，宽度从 `3px` 加宽到 `4px`

---

## 3. 卡片通用样式升级

### 模糊与阴影
- `backdrop-filter: blur(16px)`（原 `12px`）
- `box-shadow` 改为双层：
  ```css
  box-shadow:
    0 4px 24px rgba(124, 58, 237, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  ```
- 深色模式下内层高亮 `inset 0 1px 0 rgba(255,255,255,0.06)`

### 卡片 Header 区
- 增加下边框：`border-bottom: 1px solid var(--glass-border)`
- 标题字号：`15px`，`font-weight: 600`
- 「查看全部」链接改为 pill 小按钮样式：
  ```css
  background: var(--color-accent-subtle);
  color: var(--color-accent);
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  ```
  hover 时 `background: var(--color-accent); color: #fff`，过渡 `150ms`

---

## 4. 预算执行卡片

### 进度条
- 高度：`10px`（原 `6px`）
- 圆角：`6px`，更饱满
- 进度末端白色光点（正常状态）：
  ```css
  .budget-progress:not(.over)::after {
    content: '';
    width: 10px; height: 10px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 0 6px rgba(124,58,237,0.6);
    position: absolute;
    right: -5px; top: -2px;
  }
  ```

### 超支状态
- 原：仅靠进度条变红区分
- 改：右侧加警告图标 `<el-icon><WarningFilled /></el-icon>` + 红色「超支」文字标签（`font-size: 11px`），满足无障碍「不仅用颜色传达信息」要求

### 分类图标
- 每个预算项左侧加 `16px` 分类图标（从 category 数据取，如无图标则显示首字母缩写圆圈）

---

## 5. 近期账单卡片

### 行分隔
- 账单行之间加 `border-bottom: 1px solid var(--glass-border)`，最后一行不加

### 操作按钮
- 默认：`opacity: 0; pointer-events: none`
- Hover 行时：`opacity: 1; pointer-events: auto`，过渡 `150ms ease-out`
- 移动端（≤768px）：始终显示（hover 不可用），按钮尺寸 `28×28px`

### 金额排版
- 添加 `font-variant-numeric: tabular-nums`，防止数字宽度跳动
- 金额最小宽度 `80px`，右对齐

---

## 6. 消费分类饼图

### 图表类型
- 从实心饼图改为 **Donut 环形图**
- `radius: ['45%', '75%']`（原 `radius: '80%'`）
- 中心显示总支出金额（`graphic` 组件，字号 `18px bold`，颜色 `var(--color-text-primary)`）

---

## 7. 消费趋势图表

### 图表类型
- 从 Line 折线图改为 **Area 面积图**（`type: 'line'` + `areaStyle`）
- 面积填充：渐变色，顶部 alpha `0.3`，底部 alpha `0`，颜色复用已有 `color` 配置
- `smooth: true` 保留

---

## 8. 响应式规范

| 断点 | 布局 | 统计卡片 | 图表高度 |
|------|------|----------|----------|
| `>1024px` | 2列网格，统计3列 | 数字 `24px` | 饼图 `200px`，趋势 `260px` |
| `768px–1024px` | 2列网格，统计3列 | 数字 `20px` | 饼图 `180px`，趋势 `220px` |
| `≤768px` | 单列，统计3列 | 数字 `18px` | 饼图 `160px`，趋势 `180px` |
| `≤480px` | 单列，统计单列（竖排） | 数字 `20px` | 饼图 `160px`，趋势 `180px` |

---

## 9. 移除项

- **类型管理卡片**：完整移除（`categoryList`、`flashCategory`、`openCategoryDialog`、`submitCategory`、`showCategoryDialog`、`isEditCategory`、`categoryFormRef`、`category`、`newCategoryRules`、`iconOptions` 及相关 template/style）
- 分类管理功能保留在 `/settings/categories` 页面

---

## 10. 无障碍要求

- 进度条超支状态：图标 + 文字，不仅靠颜色
- 操作按钮：保留 `aria-label`（编辑/删除）
- 图表颜色：确保色盲友好（不纯依赖红/绿对比）
- 移动端操作按钮不隐藏，始终可点击

---

## 11. 不改动范围

- 所有 API 调用逻辑
- 所有数据处理函数（`mapRecentlyBillList`、`applyConsumptionChartData` 等）
- CSS 变量系统（`theme.css` 不改动）
- 路由跳转逻辑
- 账单编辑/删除业务逻辑
