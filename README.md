# 部门业务工具

公司内部工具聚合平台，提供竞品分析、价格监控、平台比价、用户/部门/菜单管理等功能。

## 技术栈

| 层   | 技术                         | 说明            |
| ---- | ---------------------------- | --------------- |
| 前端 | React 19 + TypeScript + Vite | 核心框架        |
| 前端 | TanStack Router              | 文件路由        |
| 前端 | TanStack React Query         | 数据请求与缓存  |
| 前端 | shadcn/ui (Radix + Tailwind) | UI 组件库       |
| 前端 | Zustand                      | 状态管理        |
| 前端 | Recharts                     | 图表            |
| 后端 | NestJS 10 + TypeScript       | Web 框架        |
| 后端 | Prisma + MySQL               | ORM + 数据库    |
| 后端 | JWT (Passport)               | 认证            |
| 共享 | pnpm workspace               | monorepo 包管理 |

## 功能模块

| 模块     | 说明                                                     |
| -------- | -------------------------------------------------------- |
| 竞品分析 | 粘贴商品链接，多维度（设计/定价/功能/质量/客服）竞品分析 |
| 价格监控 | 监控商品价格变动，设置目标价                             |
| 平台比价 | 同一商品跨平台价格对比                                   |
| 用户管理 | 管理员创建/编辑/禁用用户，分配角色和部门                 |
| 部门管理 | 管理公司部门，关联用户                                   |
| 菜单管理 | 配置侧边栏导航菜单，按角色控制可见性                     |

## 快速开始

### 环境要求

- Node.js >= 20
- pnpm >= 9
- MySQL >= 8.0

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置数据库

```bash
# 配置后端环境变量
cd apps/backend
cp .env.example .env
# 编辑 .env，填入数据库连接信息
```

### 3. 启动docker

```bash
cd docker
docker compose up -d
```

### 4. 初始化数据库

```bash
pnpm db:migrate  // 执行迁移
pnpm db:seed   // 生成测试数据
```

### 5. 启动开发服务

```bash
# 根目录，前后端同时启动
pnpm dev

# 或分别启动
pnpm dev:frontend   # http://localhost:5173
pnpm dev:backend    # http://localhost:8000
```

### 默认账号

| 用户名 | 密码     | 角色       |
| ------ | -------- | ---------- |
| admin  | admin123 | 超级管理员 |
