# AGENTS.md

## 项目定位

- 这是一个单体前端应用：Vue 3 + TypeScript + Vite + Pinia + Vue Router + Element Plus + ECharts。
- 真正的应用装配入口在 `src/main.ts`：注册 Pinia、Router、Element Plus 全量图标，并在挂载前执行 `initTheme()`。
- 根组件 `src/App.vue` 只负责路由过渡；页面结构和业务入口优先看路由与布局，不要从 `App.vue` 猜页面组织。

## 常用命令

- 安装依赖：`npm install`
- 启动开发环境：`npm run dev`
- 类型检查：`npm run type-check`
- Lint 并自动修复：`npm run lint`
- 生产构建：`npm run build`
- 仅格式化 `src/`：`npm run format`

## 验证顺序

- 常规前端改动先跑 `npm run lint`。
- 涉及类型、路由、Pinia、服务层签名时再跑 `npm run type-check`。
- 需要确认构建链路时跑 `npm run build`；它会先执行 `type-check`，不要重复假设有独立测试步骤。
- 这个仓库目前没有前端测试框架，`tsconfig.app.json` 虽然排除了 `src/**/__tests__/*`，但仓库没有现成测试命令，不要擅自引入测试依赖。

## 代码落点

- 路由定义在 `src/router/index.ts`。
- 主业务壳在 `src/views/layouts/CommonLayout.vue`，登录页壳在 `src/views/layouts/LoginLayout.vue`。
- 一级业务页面当前主要是 `HomeView`、`DashboardView`、`BillView`、`StatisticsView`、`SettingsView`。
- 设置相关子页面挂在 `/settings/*` 下，改设置功能先看 `src/views/settings/`。
- 主题初始化与切换逻辑从 `src/utils/themeUtil` 进入；样式入口在 `src/assets/styles/`，其中 `theme.css` 依赖于 Element Plus 样式之后加载。

## 接口与后端联动

- 前端统一通过 `src/services/base.ts` 导出的 `api` 实例访问后端，默认 `baseURL` 是 `/api`。
- Vite 开发代理在 `vite.config.ts`：`/api` 转发到 `http://192.168.31.100:8080`，并去掉前缀。联调失败时先检查代理目标是否仍然可用。
- 服务层约定集中在 `src/services/bill.ts` 等文件。多数接口不是 REST 风格，通常是 `POST`，并把业务参数包在 `{ data: ... }` 中。
- 响应拦截器把 `response.data.code !== 200` 视为失败并直接弹出 `ElMessage`；新增服务调用时应复用现有约定，不要额外套一层不同的错误处理模型。

## 认证约定

- 前端登录态由 `localStorage` 和 `src/stores/useUserInfoStore.ts` 共同维护：`accessToken`、`refreshToken`、`expireTime` 都在本地持久化。
- 路由守卫在 `src/router/index.ts`，通过 `accessToken + expireTime` 判断是否允许进入需要认证的页面。
- token 刷新、401 处理、登出清理都在 `src/services/base.ts`。改认证相关逻辑时，同时核对请求拦截器、响应拦截器和路由守卫，避免只改一处。
- 后端登录和刷新 token 都把新 token 放在 `Authorization` 响应头里，前端当前直接读取该响应头。

## 后端仓库

- 后端项目目录固定为 `F:\workspace\JavaSpace\MyBill`。
- 查接口定义优先看 `src/main/java/org/lemon/controller/`，尤其是：
  - `AppController.java`：账单、预算、分类、统计等主业务接口
  - `UserController.java`：登录、注册、刷新 token、用户信息
  - `CommonApiController.java`：公共字典接口
- 后端安全配置在 `src/main/java/org/lemon/config/SecurityConfig.java`。当前只有 `/openApi/**`、`/user/register`、`/user/login` 放行，其余接口默认都需要鉴权。
- 若前端服务层参数或返回结构看不明白，直接对照后端 controller 的 `ApiReq<T>` / `ApiResp<T>` / `PageResp<T>` 签名，不要只靠页面代码反推。

## 修改约束

- 使用 `@/` 别名指向 `src/`；`vite.config.ts` 和 `tsconfig.app.json` 已对齐这个别名。
- ESLint 使用 flat config，入口是 `eslint.config.ts`；Prettier 配置在 `.prettierrc.json`，核心约束是单引号、无分号、`printWidth = 100`。
- `npm run format` 只覆盖 `src/`，如果你修改了根目录配置文件或文档，不要误以为它会帮你格式化这些文件。
- 仓库最近提交信息以简短中文为主；如果用户要求提交，优先延续现有风格。
