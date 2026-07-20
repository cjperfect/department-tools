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
# 创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS department_tools DEFAULT CHARSET utf8mb4"

# 配置后端环境变量
cd apps/backend
cp .env.example .env
# 编辑 .env，填入数据库连接信息
```

### 3. 初始化数据库

```bash
cd apps/backend
npx prisma generate
npx prisma db push
pnpm seed
```

### 4. 启动开发服务

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

## 项目结构

```text
department-tools/
├── apps/
│   ├── frontend/                 # React 前端
│   │   └── src/
│   │       ├── api/              # API 客户端（Axios，自动 JWT，响应解包）
│   │       ├── components/       # 共享组件 & shadcn/ui
│   │       │   └── layout/       # 布局（侧边栏、导航、用户信息）
│   │       ├── features/         # 功能模块
│   │       │   ├── auth/         # 登录
│   │       │   ├── bidding/      # 竞品分析
│   │       │   ├── dashboard/    # 数据看板
│   │       │   ├── departments/  # 部门管理
│   │       │   ├── menus/        # 菜单管理
│   │       │   ├── price/        # 价格监控 & 平台比价
│   │       │   └── users/        # 用户管理
│   │       ├── hooks/            # 自定义 Hooks
│   │       ├── lib/              # 工具函数
│   │       ├── routes/           # TanStack Router 路由
│   │       └── stores/           # Zustand 状态（auth-store）
│   │
│   └── backend/                  # NestJS 后端
│       ├── prisma/
│       │   └── schema.prisma     # 数据库模型
│       ├── seed.ts               # 测试数据填充
│       └── src/
│           ├── auth/             # 认证模块（登录、JWT、用户管理）
│           ├── bidding/          # 竞品分析模块
│           ├── common/           # 守卫、装饰器、常量
│           ├── departments/      # 部门管理模块
│           ├── menus/            # 菜单管理模块
│           ├── price/            # 价格监控模块
│           └── prisma/           # Prisma 服务（全局模块）
│
└── packages/
    └── shared/
        ├── types/                # 共享 TypeScript 类型 & 常量
        ├── tsconfig/             # 共享 TS 配置
        └── eslint-config/        # 共享 ESLint 配置
```

## 环境变量

### 后端 (`apps/backend/.env`)

| 变量               | 说明             | 默认值                                              |
| ------------------ | ---------------- | --------------------------------------------------- |
| `DATABASE_URL`     | MySQL 连接字符串 | `mysql://root:root@localhost:3306/department_tools` |
| `JWT_SECRET`       | JWT 签名密钥     | -                                                   |
| `JWT_EXPIRE_HOURS` | Token 过期时间   | `24`                                                |
| `PORT`             | 服务端口         | `8000`                                              |

### 前端 (`apps/frontend/.env`)

| 变量                | 说明          | 默认值                  |
| ------------------- | ------------- | ----------------------- |
| `VITE_API_BASE_URL` | 后端 API 地址 | `http://localhost:8000` |

## API 接口

所有接口统一返回格式：

```json
{
  "code": 0,
  "message": "ok",
  "data": { ... }
}
```

`code !== 0` 表示业务错误。

### 认证

| 方法 | 路径                        | 说明         | 权限 |
| ---- | --------------------------- | ------------ | ---- |
| POST | `/api/auth/login`           | 登录         | 公开 |
| GET  | `/api/auth/me`              | 当前用户信息 | 登录 |
| POST | `/api/auth/change-password` | 修改密码     | 登录 |
| GET  | `/api/auth/menu`            | 获取导航菜单 | 登录 |

### 用户管理

| 方法   | 路径                                 | 说明                  | 权限   |
| ------ | ------------------------------------ | --------------------- | ------ |
| GET    | `/api/auth/users`                    | 用户列表（分页+搜索） | 管理员 |
| POST   | `/api/auth/users`                    | 创建用户              | 管理员 |
| PUT    | `/api/auth/users/:id`                | 编辑用户              | 管理员 |
| DELETE | `/api/auth/users/:id`                | 删除用户              | 管理员 |
| PUT    | `/api/auth/users/:id/reset-password` | 重置密码              | 管理员 |

### 竞品分析

| 方法 | 路径                   | 说明             |
| ---- | ---------------------- | ---------------- |
| POST | `/api/bidding/analyze` | 提交商品链接分析 |
| GET  | `/api/bidding/records` | 历史分析记录     |

### 价格监控

| 方法   | 路径                     | 说明       |
| ------ | ------------------------ | ---------- |
| GET    | `/api/price/monitor`     | 监控列表   |
| POST   | `/api/price/monitor`     | 添加监控   |
| DELETE | `/api/price/monitor/:id` | 删除监控   |
| GET    | `/api/price/stats`       | 统计数据   |
| GET    | `/api/price/compare/:id` | 跨平台比价 |
| GET    | `/api/price/history/:id` | 价格走势   |

### 部门管理

| 方法   | 路径                   | 说明     | 权限   |
| ------ | ---------------------- | -------- | ------ |
| GET    | `/api/departments`     | 部门列表 | 登录   |
| POST   | `/api/departments`     | 创建部门 | 管理员 |
| PUT    | `/api/departments/:id` | 编辑部门 | 管理员 |
| DELETE | `/api/departments/:id` | 删除部门 | 管理员 |

### 菜单管理

| 方法   | 路径                    | 说明                  | 权限   |
| ------ | ----------------------- | --------------------- | ------ |
| GET    | `/api/menus`            | 菜单列表（分页+搜索） | 管理员 |
| POST   | `/api/menus`            | 创建菜单              | 管理员 |
| PUT    | `/api/menus/:id`        | 编辑菜单              | 管理员 |
| DELETE | `/api/menus/:id`        | 删除菜单              | 管理员 |
| GET    | `/api/menus/groups`     | 分组列表              | 管理员 |
| POST   | `/api/menus/groups`     | 创建分组              | 管理员 |
| PUT    | `/api/menus/groups/:id` | 编辑分组              | 管理员 |
| DELETE | `/api/menus/groups/:id` | 删除分组              | 管理员 |

## 常用命令

```bash
pnpm install                    # 安装所有依赖
pnpm dev                        # 前后端同时启动
pnpm build                      # 构建所有包

# 数据库操作
cd apps/backend
npx prisma generate             # 修改 schema 后重新生成客户端
npx prisma db push              # 同步 schema 到数据库
pnpm seed                       # 清空并重建测试数据
```

## 权限说明

| 角色                     | 说明     | 权限                     |
| ------------------------ | -------- | ------------------------ |
| 超级管理员 (super_admin) | 最高权限 | 管理所有用户、部门、菜单 |
| 管理员 (admin)           | 管理员   | 管理普通用户、部门、菜单 |
| 普通用户 (user)          | 普通用户 | 使用业务功能             |

角色层级：`super_admin(3) > admin(2) > user(1)`，上级可管理下级，不可操作自己和同级。
