# 部门业务工具平台 — 设计规格

**日期**: 2026-07-03
**状态**: 已确认
**概述**: 公司内部工具聚合平台，使用 shadcn-admin 模板搭建，首期包含竞价分析和价格检测两个模块。

---

## 1. 技术栈

| 层 | 选型 |
|---|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite |
| UI | ShadcnUI (RadixUI + TailwindCSS) |
| 路由 | TanStack Router |
| 图表 | Recharts（轻量、React 原生） |
| 图标 | Lucide Icons（模板自带） |
| 包管理 | pnpm |
| 数据 | 页面内 Mock 数据，后续替换为真实 API |

基础模板：`https://github.com/satnaing/shadcn-admin`（MIT 协议）

---

## 2. 改造范围

### 2.1 从模板中移除

- Clerk 认证（`src/components/protected/`、`src/features/auth/`、相关路由守卫）
- Demo 页面（`src/features/dashboard/`、`src/features/tasks/` 等示例页面）
- 登录/注册页面
- 用户相关组件（头像下拉、用户菜单）

### 2.2 保留

- 整体 Shell 布局（侧边栏 + 顶栏 + 内容区）
- 主题切换（亮色/暗色）
- 侧边栏折叠
- 全局搜索框（可选保留，改为搜索工具/功能）
- 基础 UI 组件

---

## 3. 信息架构

```
部门业务工具
├── 侧边栏
│   ├── Logo + 平台名称
│   ├── 导航菜单
│   │   ├── 📊 竞价分析
│   │   │   ├── 数据报表  /bidding/report
│   │   │   └── 关键词查询 /bidding/keyword
│   │   └── 💰 价格检测
│   │       ├── 价格监控  /price/monitor
│   │       ├── 平台比价  /price/compare
│   │       └── 价格走势  /price/trend
│   └── 底部：主题切换按钮
└── 内容区（根据路由渲染）
```

路由规则：
- `/` → 重定向到 `/bidding/report`
- `/bidding/report` → 竞价分析 - 数据报表
- `/bidding/keyword` → 竞价分析 - 关键词查询
- `/price/monitor` → 价格检测 - 价格监控
- `/price/compare` → 价格检测 - 平台比价
- `/price/trend` → 价格检测 - 价格走势

---

## 4. 页面规格

### 4.1 竞价分析 - 数据报表

**顶部概览卡片**（4个）：
- 竞价总数、成功率（环形图或百分比）、平均出价、活跃关键词数

**图表区域**：
- 竞价趋势折线图（近30天/7天切换，展示每日竞价量变化）
- 状态分布饼图（成功/失败/进行中）

**底部数据表格**：
- 列出近期的竞价记录（关键词、出价、排名、状态、时间）
- 支持分页

### 4.2 竞价分析 - 关键词查询

- 搜索输入框（输入关键词）
- 查询结果表格：关键词、搜索量、竞争度（高/中/低）、建议出价、当前排名
- 每个关键词可展开查看竞价详情

### 4.3 价格检测 - 价格监控

- 监控商品列表表格：商品名称、SKU、平台、当前价格、目标价格、差价、状态（监控中/已触发）
- 操作：添加监控（弹窗表单）、编辑、删除
- 顶部统计卡片：监控总数、降价商品数、涨价商品数

### 4.4 价格检测 - 平台比价

- 左侧：商品选择列表
- 右侧：选中商品的跨平台价格对比表（京东/天猫/拼多多等）
- 柱状图直观展示价格差异

### 4.5 价格检测 - 价格走势

- 顶部：商品选择器（下拉搜索）
- 主体：历史价格折线图（支持 7天/30天/90天 切换）
- 显示最高价、最低价、当前价标注线

---

## 5. 组件规划

### 通用组件

| 组件 | 用途 |
|------|------|
| `StatCard` | 统计概览卡片（图标 + 数值 + 标签 + 趋势箭头） |
| `PageHeader` | 页面标题 + 面包屑 + 操作按钮 |
| `ChartCard` | 包裹图表的卡片容器（标题 + 图表 + 图例） |
| `SearchInput` | 带防抖的搜索输入框 |
| `StatusBadge` | 状态标签（成功/失败/进行中等） |

### 业务组件

| 组件 | 用途 |
|------|------|
| `BiddingTrendChart` | 竞价趋势折线图 |
| `BiddingStatusPie` | 竞价状态分布饼图 |
| `KeywordSearchResult` | 关键词查询结果 |
| `PriceComparisonChart` | 平台比价柱状图 |
| `PriceHistoryChart` | 历史价格走势图 |
| `MonitorForm` | 添加/编辑价格监控的表单弹窗 |

---

## 6. 文件结构

```
src/
├── features/
│   ├── bidding/
│   │   ├── components/
│   │   │   ├── BiddingTrendChart.tsx
│   │   │   ├── BiddingStatusPie.tsx
│   │   │   ├── KeywordSearchResult.tsx
│   │   │   └── StatCards.tsx
│   │   ├── pages/
│   │   │   ├── BiddingReport.tsx
│   │   │   └── KeywordQuery.tsx
│   │   └── data/
│   │       └── mock.ts
│   └── price/
│       ├── components/
│       │   ├── PriceComparisonChart.tsx
│       │   ├── PriceHistoryChart.tsx
│       │   ├── MonitorForm.tsx
│       │   └── StatCards.tsx
│       ├── pages/
│       │   ├── PriceMonitor.tsx
│       │   ├── PlatformCompare.tsx
│       │   └── PriceTrend.tsx
│       └── data/
│           └── mock.ts
├── components/
│   ├── StatCard.tsx
│   ├── PageHeader.tsx
│   ├── ChartCard.tsx
│   ├── SearchInput.tsx
│   └── StatusBadge.tsx
├── routes/
│   └── index.tsx          # 路由配置
├── config/
│   └── navigation.ts      # 侧边栏菜单配置
└── App.tsx
```

---

## 7. 不做的事

- 用户认证 / 登录注册
- 后端 API 对接
- 权限管理
- 国际化（i18n）
- E2E 测试

---

## 8. 自检清单

- [x] 无 TBD / TODO 占位符
- [x] 架构与功能描述一致
- [x] 首期范围明确（两个模块、五个页面）
- [x] 无歧义表述
- [x] 保持与 shadcn-admin 模板兼容，不引入新的大依赖
