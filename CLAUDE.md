## 项目结构

```
department-tools/
├── apps/
│   ├── backend/                # NestJS 后端
│   │   ├── prisma/             # 数据库 Schema & 迁移
│   │   ├── seed.ts             # 种子数据
│   │   └── src/
│   │       ├── auth/           # 认证模块 (JWT)
│   │       ├── bidding/        # 招投标分析模块
│   │       ├── common/         # 公共 Guard/Decorator/Filter/Interceptor
│   │       ├── departments/    # 部门管理
│   │       ├── justone/        # JustOne API 封装 (淘宝/京东/抖音搜索)
│   │       ├── menus/          # 菜单管理
│   │       ├── price/          # 价格监控模块
│   │       ├── prisma/         # Prisma 服务
│   │       ├── users/          # 用户管理
│   │       └── utils/          # 工具函数
│   └── frontend/               # React 前端 (Vite + TanStack Router)
│       └── src/
│           ├── api/            # API 请求函数（按模块命名）
│           ├── components/     # 通用组件 (ui/ layout/ data-table/ ImageViewer)
│           ├── config/         # 应用配置
│           ├── context/        # React Context
│           ├── features/       # 功能模块（每个功能含 pages/components/data/api）
│           │   ├── auth/       # 登录/注册
│           │   ├── bidding/    # 招投标分析
│           │   ├── dashboard/  # 首页仪表盘
│           │   ├── departments/# 部门管理
│           │   ├── price/      # 价格监控
│           │   ├── menus/      # 菜单管理
│           │   └── users/      # 用户管理
│           ├── hooks/          # 自定义 Hooks
│           ├── lib/            # 工具库（clsx 封装等）
│           ├── routes/         # TanStack Router 路由定义
│           ├── stores/         # 全局状态 (Zustand/Jotai)
│           └── styles/         # 全局样式
├── docker/
│   └── docker-compose.yml      # MySQL 8.0 容器
├── packages/shared/types/      # 共享 TypeScript 类型
├── testApi/                    # Mock API 服务器 (开发用)
├── docs/                       # 设计文档 & 需求说明
└── pnpm-workspace.yaml         # pnpm monorepo 配置
```

**技术栈**：React 19 + Vite + TanStack Router + shadcn/ui + NestJS + Prisma + MySQL 8.0 + pnpm monorepo

**测试用 Mock API**：`testApi/server.js` 运行在 `127.0.0.1:3456`，模拟 JustOne 接口返回。如需使用真实 API，修改 `apps/backend/.env` 中 `JUSTONE_BASE_URL` 并重启后端。

## 代码风格

- 注释仅使用中文
- 优先使用函数式编程和 React Hooks
- 组件遵循单一职责原则，每个组件只做一件事
- 优先使用简单、原生、供应商推荐的解决方案（如 React 官方模式），避免过早抽象
- 使用 TypeScript 严格模式：对 props、state、返回值、事件处理器使用精确类型；使用 `interface` 定义组件 Props，使用 `type` 定义联合类型和工具类型
- 运行时验证 API 响应数据：使用 Zod 验证库，要求必需字段，忽略额外字段，优先使用结构化模型而非 `any` 或 `unknown`
- 在编写新组件或工具函数前检查是否已存在类似逻辑
- 获取对象属性使用解构
- 文件命名规范：
  - 组件文件使用 PascalCase（如 `UserProfile.tsx`）
  - 工具函数使用 camelCase（如 `formatDate.ts`）
  - 样式文件与组件同名（如 `UserProfile.module.css`）
  - 服务层文件使用 `xxx.service.ts` 命名（如 `user.service.ts`、`auth.service.ts`）
  - 类型定义文件使用 `xxx.types.ts` 命名（如 `user.types.ts`）
  - 常量文件使用 `xxx.constants.ts` 命名（如 `api.constants.ts`）

## 代码格式化

- 项目必须配置prettier作为代码格式化工具
- 在编写或修改任何代码文件后，必须使用 Prettier 进行格式化，确保代码风格一致

## 错误处理

- 始终显式抛出错误，绝不静默忽略
- 使用自定义错误类（如 ApiError、ValidationError）清晰指示错误类型
- React 组件中使用 Error Boundaries 捕获渲染错误，提供降级 UI
- 异步操作（API 调用、事件处理）使用 try/catch 捕获错误，并设置错误状态
- API 调用使用重试策略（如指数退避），失败时抛出最后一个错误并记录日志

## 状态管理

- 优先使用 React 内置状态管理（useState、useReducer、useContext）
- 全局状态使用 Zustand
- 服务端状态使用 TanStack Query，处理缓存、重试、重新验证
- 表单状态使用 react-hook-form
- URL 状态使用 React Router 的 useSearchParams 或 Next.js 的 useRouter
- 状态设计遵循最小化原则：只存储必要数据，派生数据在渲染时计算（使用 useMemo）
- 避免将组件本地状态提升到全局，除非多处共享

## 库与依赖

- 包管理使用 pnpm
- 工具库：使用 lodash-es（按需导入）、date-fns（替代 moment.js）、clsx 或 classnames（条件类名）
- HTTP 客户端：使用 axios 或原生 fetch，配置拦截器处理认证、错误、日志
- 表单验证：使用 Zod
- 在项目配置文件中添加或更新依赖，而非手动安装
- 定期运行 `npm audit` 或 `yarn audit` 修复安全漏洞
