# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 概述

PNPM monorepo，内部部门工具集：竞品分析、价格监控、平台比价、用户/部门/菜单管理。

## 常用命令

```bash
# 安装依赖
pnpm install

# 开发
pnpm dev                  # 前后端同时启动
pnpm dev:frontend         # Vite 开发服务器 (5173 端口)
pnpm dev:backend          # NestJS 开发服务器 (8000 端口)

# 数据库操作（在 apps/backend/ 下执行）
cd apps/backend
npx prisma generate       # 修改 schema 后重新生成客户端
npx prisma db push        # 同步 schema 到数据库
npx prisma db push --accept-data-loss  # 有破坏性变更时强制同步
pnpm seed                 # 清空并重建测试数据
```

## 架构

```
apps/frontend/    @department-tools/frontend   React 19 + Vite + TanStack Router + shadcn/ui
apps/backend/     @department-tools/backend    NestJS 10 + Prisma + MySQL
packages/shared/
  types/          @department-tools/types       共享 TypeScript 接口和常量
  tsconfig/       @department-tools/tsconfig    base.json → react.json / nest.json
  eslint-config/  @department-tools/eslint-config  共享 ESLint 配置
```

### 共享类型 (`packages/shared/types/src/`)

前后端共用的 API 请求/响应类型。通过 `@department-tools/types` 导入，支持子路径：`./auth`、`./bidding`、`./price`、`./constants`。新增 API 时先在这里定义类型，再在两端实现。

### 后端 (`apps/backend/`)

- **NestJS 模块**：`auth/`、`bidding/`、`price/`、`departments/`、`menus/`，每个模块含 controller + service + DTO
- **`PrismaModule` 是 `@Global()`**，直接注入 `PrismaService` 即可，无需每个模块单独导入
- **权限守卫**：`@UseGuards(JwtAuthGuard)` 验证登录，`@UseGuards(JwtAuthGuard, RolesGuard) + @Roles('admin')` 限制管理员
- **`@Roles('admin')`** 表示 admin 或 super_admin 均可访问（通过 `getRoleLevel()` 判断）
- **角色层级**：`super_admin(3) > admin(2) > user(1)`，上级可管理下级，但不能操作自己
- **响应格式**：`{ code: 0, message: 'ok', data: ... }`，`ResponseInterceptor` 自动包裹，`code !== 0` 表示业务错误
- **数据库**：MySQL + Prisma ORM。schema 变更后需执行 `prisma generate`。`pnpm seed` 可重置并填充测试数据

### 前端 (`apps/frontend/`)

- **路由**：TanStack Router 文件路由。`routes/_authenticated/` 需要登录。管理路由 (`/users`、`/departments`、`/menus`) 额外检查 localStorage 中的角色
- **API 层**：`api/client.ts` — Axios 实例，自动携带 JWT，解包响应 (`{code,message,data}` → `data`)，全局错误 toast
- **状态管理**：Zustand (`stores/auth-store.ts`)，将 token、user、menuData 持久化到 localStorage
- **UI**：shadcn/ui (Radix + Tailwind)，组件在 `components/ui/`
- **功能模块模式**：`features/<模块名>/`，包含 `index.tsx`、`api/index.ts`、`components/`。使用 `useQuery`/`useMutation` + `apiClient`
- **菜单**：登录时从数据库加载，缓存到 localStorage。通过 `/menus` 管理页面管理

### 关键模式

- **新增管理功能**：创建后端模块（Prisma 模型 + NestJS 模块 + DTO）→ 添加共享类型 → 创建前端功能目录 → 添加带 `requireAdmin()` 的路由 → seed 中添加菜单项
- **错误处理**：Axios 拦截器统一处理 HTTP 错误和业务错误（`code !== 0`），自动 `toast.error()`。各 mutation 只需处理成功逻辑
- **表单模式**：优先使用 `useState` 手动表单，避免 react-hook-form+zod 的类型问题。参考 `menus-dialogs.tsx` 或 `departments-dialogs.tsx`
