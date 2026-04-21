# Dashboard 最小拆分 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改变 Dashboard 行为的前提下，把类型定义和纯函数从 `src/views/DashboardView.vue` 中拆出，降低文件复杂度。

**Architecture:** 保留 `DashboardView.vue` 作为页面入口和副作用编排层，只把“类型声明”和“纯函数数据处理”迁移到 `src/views/dashboard/` 目录。页面结构、接口调用方式、图表渲染行为保持不变。

**Tech Stack:** Vue 3, TypeScript, Element Plus, ECharts, Vite

---

## 文件改动总览

| 文件 | 操作 | 责任 |
|------|------|------|
| `src/views/dashboard/types.ts` | 新建 | Dashboard 相关类型定义 |
| `src/views/dashboard/utils.ts` | 新建 | 数据转换、图表装配、时间范围工具 |
| `src/views/DashboardView.vue` | 修改 | 保留页面模板、状态、副作用与事件处理 |

---

## 任务列表

1. 新建 `src/views/dashboard/types.ts`，迁移页面内的业务类型和图表 option 类型。
2. 新建 `src/views/dashboard/utils.ts`，迁移纯函数：账单映射、图表数据装配、预算计算、时间范围工具。
3. 更新 `src/views/DashboardView.vue` 的 import，删除重复类型和工具实现。
4. 保持现有 `fetch* / loadDashboardData / watch / onMounted` 行为不变，只改调用来源。
5. 运行 `npm run lint` 与 `npm run build` 验证无行为回归。
