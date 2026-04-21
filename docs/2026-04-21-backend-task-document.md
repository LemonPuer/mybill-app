# 后端任务文档（执行版）

来源文档：`docs/superpowers/specs/2026-04-21-missing-features-priority-design.md`

后端仓库：`F:\workspace\JavaSpace\MyBill`

状态说明：
- `已具备`：当前后端已有接口或模型，可直接进入联调
- `部分具备`：已有基础接口，但字段、行为或鉴权范围仍需补齐
- `未开始`：当前代码中未看到对应接口或任务能力

## 当前代码基线

### 现有接口入口

- `src/main/java/org/lemon/controller/AppController.java`
  - 已有：`getCashFlowCard`、`getFinanceTransactionsList`、`getBudgetInfo`、`consumerTrends`、`consumptionStatistics`
  - 已有：`saveCategory`、`getCategory`、`saveFinanceTransactions`、`delFinanceTransactions`、`saveBudget`、`delBudget`
  - 缺失：`delCategory`
- `src/main/java/org/lemon/controller/UserController.java`
  - 已有：`login`、`register`、`refreshToken`、`getUserInfo`、`updateInfo`
  - 缺失：忘记密码相关公开接口

### 当前字段现状

- `src/main/java/org/lemon/entity/req/UserUpdateReq.java`
  - 目前只有：`avatarUrl`、`description`、`username`
  - 缺少：`emailReminderEnabled`、`monthlySummaryEnabled`、`reminderSendHour`
  - 若通知设置复用 `updateInfo`，这里必须扩字段
- `src/main/java/org/lemon/entity/resp/UserInfoVO.java`
  - 目前只有：`avatarUrl`、`description`、`username`、`email`
  - 缺少：通知设置相关返回字段
- `src/main/java/org/lemon/entity/req/FinanceTransactionsQueryReq.java`
  - 目前支持：`type`、`categoryId`、`startTime`、`endTime`
  - 缺少：`keyword`
- `src/main/java/org/lemon/entity/resp/BudgetInfoVO.java`
  - 目前字段是：`category`、`icon`、`amount`、`cost`
  - 与前端文档目标存在命名确认项：前端更关注 `categoryName`、`spent/cost`

### 鉴权现状

- `src/main/java/org/lemon/config/SecurityConfig.java`
  - 当前仅放行：`/openApi/**`、`/user/register`、`/user/login`
  - 若新增忘记密码发送验证码、重置密码接口，通常也需要加入放行名单

---

## P0

### 目标

补齐核心闭环，确保 Dashboard、账单整理、个人资料、通知设置、分类管理可以稳定联调。

### 任务 1：补齐分类删除接口

- 状态：`未开始`
- 现状依据：`AppController.java` 中没有 `delCategory`，前端已调用 `/app/delCategory`
- 建议落点：
  - Controller：`src/main/java/org/lemon/controller/AppController.java`
  - Request：复用 `org.lemon.entity.common.IdReq`
  - Service：`src/main/java/org/lemon/service/CategoryService.java`
- 执行动作：
  - 新增 `POST /app/delCategory`
  - 入参仅接收分类 `id`
  - 删除前校验分类是否被账单引用
  - 删除前校验分类是否被预算引用
  - 若被引用，返回明确业务失败提示，不做级联删除
- 联调要求：
  - 失败提示文案可直接给前端展示
  - 接口命名保持与前端当前 `deleteCategory` 服务一致
- 验收口径：
  - 未引用分类可删除
  - 已被账单或预算引用的分类不可删除
  - 前端可直接展示失败原因

### 任务 2：确认并稳定 Dashboard 统计接口字段

- 状态：`部分具备`
- 现状依据：`AppController.java` 中已有 4 个统计接口，但字段语义仍有联调确认项
- 涉及接口：
  - `POST /app/getCashFlowCard`
  - `POST /app/consumerTrends`
  - `POST /app/consumptionStatistics`
  - `POST /app/getBudgetInfo`
- 重点核对：
  - 时间范围入参是否都按 `startTime/endTime` 生效
  - `consumerTrends` 在本月、近 3 月、本年下的返回粒度是否稳定
  - `consumptionStatistics` 是否需要补分类图标字段
  - `BudgetInfoVO` 中已花费字段最终统一为 `cost` 还是改为 `spent`
  - `BudgetInfoVO` 中分类字段最终统一为 `category` 还是改为 `categoryName`
- 建议落点：
  - Controller：`AppController.java`
  - Req：`TimeFrameReq.java`、`ConsumerTrendsReq.java`
  - Resp：`CashFlowCardVO.java`、`ConsumptionStatisticsVO.java`、`BudgetInfoVO.java`、`ConsumerTrendsVO.java`
  - Service：`FinanceTransactionsService.java`、`BudgetService.java`、`MonthTotalRecordService.java`
- 联调要求：
  - 同一时间范围下，Dashboard 各模块口径一致
  - 空数据返回空集合，不返回异常结构
  - 字段命名在联调前定稿，避免前端页面层二次兼容
- 验收口径：
  - Dashboard 在本月、近 3 月、本年三种场景下都能正常取数
  - 预算、趋势、分类占比字段命名稳定且无需前端猜测

### 任务 3：确认并补齐用户资料字段

- 状态：`已具备`
- 现状依据：`UserController.java` 已有 `getUserInfo` 和 `updateInfo`；`UserInfoVO.java` 已返回 `username`、`email`、`avatarUrl`、`description`
- 建议动作：
  - 明确 `updateInfo` 对 `username`、`avatarUrl`、`description` 的更新行为
  - 确认 `getUserInfo` 在更新后立即返回最新数据
  - 明确邮箱是否允许在资料页修改；若不允许，需要与前端约定为只读
- 建议落点：
  - Controller：`UserController.java`
  - Req：`UserUpdateReq.java`
  - Resp：`UserInfoVO.java`
  - Service：`UserService.java`
- 验收口径：
  - 资料保存后重新进入页面能看到最新数据
  - 不允许修改的字段有稳定策略，不出现前后端认知不一致

### 任务 4：确认通知设置字段与保存方式

- 状态：`未开始`
- 现状依据：前端已按 `email`、`emailReminderEnabled`、`monthlySummaryEnabled`、`reminderSendHour` 读写；后端 `UserUpdateReq/UserInfoVO` 尚未支持这些字段
- 二选一方案：
  - 方案 A：复用 `POST /user/updateInfo` 与 `POST /user/getUserInfo`
  - 方案 B：新增独立通知设置接口
- 推荐：方案 A
- 推荐原因：
  - 变更范围小
  - 与前端当前实现最接近
  - 用户资料和通知偏好都属于个人设置域
- 建议落点：
  - Controller：`UserController.java`
  - Req：扩展 `UserUpdateReq.java`
  - Resp：扩展 `UserInfoVO.java`
  - Service：`UserService.java`
  - 实体/表结构：用户表或用户扩展表
- 必须补齐字段：
  - `email`
  - `emailReminderEnabled`
  - `monthlySummaryEnabled`
  - `reminderSendHour`
- 联调要求：
  - 保存失败时返回明确业务信息
  - 查询接口返回完整通知配置，前端刷新后能回显
- 验收口径：
  - 用户修改通知设置后再次进入页面可看到最新配置
  - 未开启邮件提醒的用户不会被错误纳入任务发送范围

### P0 联调顺序

1. 先补 `delCategory`
2. 再定 Dashboard 统计字段命名和时间范围语义
3. 再确认 `updateInfo/getUserInfo` 是否承接通知设置
4. 最后与前端联调分类删除、资料更新、通知设置、Dashboard 时间切换

---

## P1

### 目标

补齐登录辅助流程、邮件回流能力和账单导出能力。

### 任务 5：新增忘记密码接口

- 状态：`未开始`
- 现状依据：`UserController.java` 中没有发送验证码、重置密码接口；`SecurityConfig.java` 也未放行对应公开接口
- 建议新增接口：
  - `POST /user/sendResetCode`
  - `POST /user/resetPassword`
- 建议落点：
  - Controller：`UserController.java`
  - Req：新增重置密码相关请求对象
  - Service：`UserService.java`
  - 邮件发送：`EmailSendService.java`
  - 重试或任务记录：`RetryTaskService.java` 或独立验证码记录能力
  - 鉴权：`SecurityConfig.java`
- 执行动作：
  - 发送验证码接口支持按邮箱发送
  - 重置密码接口校验邮箱、验证码、新密码
  - 明确验证码有效期
  - 明确发送频率限制
  - 明确错误提示文案
  - 把这两个接口加入匿名放行列表
- 验收口径：
  - 未登录用户可完整走通忘记密码流程
  - 验证码过期、错误、超频均返回明确提示

### 任务 6：增强账单查询能力

- 状态：`部分具备`
- 现状依据：`FinanceTransactionsQueryReq.java` 目前已有 `categoryId`，但没有 `keyword`
- 建议落点：
  - Req：`FinanceTransactionsQueryReq.java`
  - Controller：`AppController.java`
  - Service：`FinanceTransactionsService.java`
- 执行动作：
  - 确认 `categoryId` 查询逻辑已生效
  - 新增 `keyword` 字段
  - `keyword` 至少支持备注模糊查询
  - 若可控，额外支持按分类名模糊查询
  - 保持当前分页参数语义不变
- 验收口径：
  - 账单列表可按分类筛选
  - 账单列表可按关键词搜索
  - 搜索和分页组合使用时结果稳定

### 任务 7：补齐催记账邮件任务

- 状态：`未开始`
- 现状依据：当前有 `EmailRemainService.java`、`EmailSendService.java`，但没有从控制层或文档中看到针对催记账的明确任务能力
- 建议落点：
  - Service：`EmailRemainService.java`、`EmailSendService.java`
  - 任务调度：后端定时任务模块
  - 用户配置读取：`UserService.java`
- 必须明确：
  - 调度频率
  - 同一天是否重复发送
  - 当天已记账是否跳过
  - 用户关闭提醒后是否立即生效
  - 邮件中的回流链接格式
- 验收口径：
  - 满足发送条件的用户能收到邮件
  - 不满足条件的用户不会误发
  - 邮件内容能稳定跳回 `Home` 或 `Bills`

### 任务 8：补齐月度摘要邮件任务

- 状态：`未开始`
- 现状依据：当前代码基线中未看到月度摘要的明确任务实现
- 建议落点：
  - Service：`EmailSendService.java`
  - 统计口径：复用 `FinanceTransactionsService.java`、`BudgetService.java`、`MonthTotalRecordService.java`
- 必须明确：
  - 发送时间点
  - 本月收入、支出、结余口径
  - 预算执行摘要口径
  - 主要支出分类计算口径
  - 跳转回 `Dashboard` 的链接格式
- 验收口径：
  - 邮件核心数据与 Dashboard 保持一致
  - 邮件在月度固定时间发送

### 任务 9：新增账单导出接口

- 状态：`未开始`
- 现状依据：当前控制器中未看到账单导出接口
- 建议新增接口：
  - `POST /app/exportFinanceTransactions` 或与前端协商后的唯一命名
- 建议落点：
  - Controller：`AppController.java`
  - Req：新增导出请求对象，包含时间范围等筛选条件
  - Service：`FinanceTransactionsService.java`
- 必须明确：
  - 导出格式，建议首期仅支持 `xlsx` 或 `csv`
  - 时间范围筛选规则
  - 文件命名规则
  - 空数据时的导出行为
  - 导出失败时的错误返回结构
- 验收口径：
  - 前端可发起导出并拿到文件
  - 失败时有明确错误提示，不是静默失败

### P1 联调顺序

1. 先补忘记密码接口和匿名放行配置
2. 再补账单关键词搜索能力
3. 再明确邮件发送规则与摘要口径
4. 最后补账单导出接口并与前端联调下载行为

---

## P2

### 目标

只做增强能力的接口设计，不作为当前主线交付阻塞项。

### 任务 10：批量整理接口设计

- 状态：`未开始`
- 建议内容：
  - 批量删除账单
  - 批量修改分类
  - 明确部分成功、部分失败时的返回结构

### 任务 11：默认记账偏好持久化设计

- 状态：`未开始`
- 建议内容：
  - 先决定放前端本地还是后端用户设置
  - 如果落后端，再补偏好字段和保存接口

### 任务 12：导出能力增强设计

- 状态：`未开始`
- 建议内容：
  - 多格式导出
  - 周期导出
  - 异步导出任务

---

## 不纳入本轮范围

- 账户管理
- 转账语义建模
- 独立提醒中心
- 独立统计页
- 多维高级分析

## 建议开发顺序

1. P0：`delCategory`、统计字段确认、通知设置字段确认
2. P0 联调：Dashboard、分类删除、个人资料、通知设置
3. P1：忘记密码、关键词搜索、邮件任务、账单导出
4. P2：只做接口设计，不抢主线排期

## 联调前检查清单

- `AppController` 是否已补齐 `delCategory`
- `UserUpdateReq/UserInfoVO` 是否已支持通知设置字段
- `FinanceTransactionsQueryReq` 是否已支持 `keyword`
- 忘记密码公开接口是否已加入 `SecurityConfig` 放行
- Dashboard 统计接口字段命名是否已定稿
- 导出接口命名、格式、失败返回是否已定稿

## 当前最优先的后端项

- 补 `POST /app/delCategory`
- 扩 `UserUpdateReq` 与 `UserInfoVO` 的通知设置字段
- 明确 Dashboard 统计字段命名并固定口径
- 新增忘记密码接口并放行匿名访问
- 为账单查询补 `keyword` 搜索能力
