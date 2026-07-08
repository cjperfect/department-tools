# 用户认证与数据隔离 — 设计规格

**日期**: 2026-07-08
**状态**: 待实现

---

## 1. 概述

为系统添加 JWT 用户认证，所有价格监控和竞品分析数据与用户关联，实现数据隔离。

### 1.1 核心需求

- 用户名 + 密码登录，JWT 鉴权
- 管理员手动创建账号（无开放注册）
- 用户角色：`admin` / `user`
- 监控价格、竞品分析数据按 `user_id` 隔离
- 用户管理界面仅管理员可访问
- 登录页 UI 参考 shadcn-admin 风格

### 1.2 不做的事

- 不开放自助注册
- 不做邮箱验证、密码重置（初始版本）
- 不做 OAuth / 第三方登录
- 不做多租户

---

## 2. 后端设计

### 2.1 数据模型

#### users 表

| 列 | 类型 | 说明 |
|---|------|------|
| id | INT PK AUTO_INCREMENT | 主键 |
| username | VARCHAR(64) UNIQUE NOT NULL | 登录用户名 |
| password_hash | VARCHAR(256) NOT NULL | bcrypt 哈希 |
| role | VARCHAR(16) NOT NULL DEFAULT 'user' | admin / user |
| is_active | TINYINT(1) NOT NULL DEFAULT 1 | 0=禁用 1=启用 |
| created_at | DATETIME NOT NULL | 创建时间 |

#### 已有表改动

- `monitor_products` 新增 `user_id INT FK → users.id NOT NULL`
- `analyses` 新增 `user_id INT FK → users.id NOT NULL`

### 2.2 API 端点

#### `POST /api/auth/login`

```
Request:  { username: str, password: str }
Response: { code: 0, data: { token: str, user: { id, username, role } } }
Error:    401 用户名或密码错误 / 账号已禁用
```

#### `GET /api/auth/me`

```
Headers:  Authorization: Bearer <token>
Response: { code: 0, data: { id, username, role } }
```

#### `POST /api/auth/users`（仅 admin）

```
Headers:  Authorization: Bearer <token>
Request:  { username: str, password: str, role?: str }
Response: { code: 0, data: { id, username, role, is_active, created_at } }
```

#### `GET /api/auth/menu`

```
Headers:  Authorization: Bearer <token>
Response: { code: 0, data: { nav: [...] } }
```

根据用户角色返回侧边栏菜单，结构：

```json
{
  "nav": [
    { "title": "首页", "url": "/", "icon": "LayoutDashboard" },
    { "title": "竞品分析", "url": "/bidding", "icon": "BarChart3" },
    { "title": "价格监控", "url": "/price/monitor", "icon": "Eye" },
    { "title": "用户管理", "url": "/users", "icon": "Users", "roles": ["admin"] }
  ]
}
```

- 普通用户不返回 `roles: ["admin"]` 的菜单项
- icon 使用 lucide-react 图标名称，前端动态渲染

#### `GET /api/auth/users`（仅 admin）

列出所有用户。

### 2.3 JWT 设计

- 算法：HS256
- 密钥：环境变量 `JWT_SECRET`（默认 dev-secret）
- 过期时间：24 小时
- Payload：`{ sub: user_id, role: "admin"|"user", exp: timestamp }`

### 2.4 依赖注入

```python
# app/auth.py
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """解析 JWT → 查询用户 → 返回 User ORM 对象"""

async def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """检查 role == 'admin'，否则 403"""
```

### 2.5 已有接口改造

所有查询接口加上 `WHERE user_id = current_user.id`：

- `GET /api/price/monitor` → 只返回当前用户的监控
- `GET /api/price/search` → 只搜索当前用户的数据
- `GET /api/bidding/records` → 只返回当前用户的分析记录
- 创建接口（POST）自动填入 `user_id = current_user.id`

### 2.6 文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `app/models/user.py` | 新增 | User 模型 |
| `app/auth.py` | 新增 | JWT 工具函数 + 依赖注入 |
| `app/routers/auth.py` | 新增 | 认证端点 |
| `app/schemas/auth.py` | 新增 | 认证请求/响应 Schema |
| `app/main.py` | 修改 | 注册 auth 路由 |
| `app/models/monitor.py` | 修改 | 加 user_id FK |
| `app/models/analysis.py` | 修改 | 加 user_id FK |
| `app/services/price_monitor.py` | 修改 | 按 user_id 过滤 |
| `app/services/product_analyzer.py` | 修改 | 按 user_id 过滤 |
| `app/routers/monitor.py` | 修改 | 注入 current_user |
| `app/routers/product.py` | 修改 | 注入 current_user |
| `seed.py` | 修改 | 创建 admin + 关联 user_id |
| `pyproject.toml` | 修改 | 加 PyJWT、bcrypt 依赖 |

---

## 3. 前端设计

### 3.1 登录页

路径：`/sign-in`

- 独立页面，无侧边栏布局
- 居中卡片（Card, max-w-sm）
- 卡片标题：Logo + "部门业务工具"
- 表单：用户名输入框 + 密码输入框 + 登录按钮
- 登录成功后：存 token 到 localStorage → Zustand store → 跳转到首页或 redirect 参数
- 登录失败：toast 显示错误信息

### 3.2 认证状态管理

Zustand store（`src/stores/auth-store.ts`）：

```typescript
interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  menu: NavItem[]           // 后端返回的侧边栏菜单
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  fetchMenu: () => Promise<void>
  hydrate: () => void       // 从 localStorage 恢复
}
```

### 3.3 路由守卫

修改 `_authenticated/route.tsx`：

- 读取 auth store，未认证 → `redirect({ to: '/sign-in' })`
- 已认证 → 正常渲染 AuthenticatedLayout

### 3.4 API Client 改造

修改 `src/api/client.ts`：

- 请求拦截器：从 store 读取 token，附加 `Authorization: Bearer <token>`
- 响应拦截器：401 → 清除 token → 跳转 `/sign-in`

### 3.5 侧边栏菜单

由后端 `GET /api/auth/menu` 动态返回，替换静态 `sidebar-data.ts`。

- 登录后调用 `/api/auth/menu` 获取菜单
- 存入 auth store（Zustand）
- AppSidebar 从 store 读取菜单渲染
- 普通用户看不到用户管理（后端不返回该菜单项）

### 3.6 侧边栏用户区域

AppSidebar footer 区域：
- 显示当前用户名 + 角色
- 退出按钮（调用 `logout()`）

### 3.7 用户管理页（仅 admin）

路径：`/users`

- 用户列表表格（id, username, role, is_active, created_at）
- 新建用户按钮 → 弹窗表单（用户名、密码、角色）
- 仅 `role === 'admin'` 可见导航项和路由

### 3.8 路由规划

```
/sign-in          → SignIn 页面（无布局）
/_authenticated/  → 受保护路由组（需 token）
  /               → 首页
  /bidding        → 竞品分析
  /price/monitor  → 价格监控
  /price/compare  → 平台比价
  /price/trend    → 价格趋势
  /users          → 用户管理（需 admin）
```

### 3.9 文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/features/auth/pages/SignIn.tsx` | 新增 | 登录页 |
| `src/features/auth/pages/Users.tsx` | 新增 | 用户管理页 |
| `src/features/auth/components/UserAuthForm.tsx` | 新增 | 登录表单组件 |
| `src/stores/auth-store.ts` | 新增 | Zustand 认证状态（含菜单） |
| `src/api/auth.ts` | 新增 | 认证 API + 菜单 API |
| `src/api/client.ts` | 修改 | token 拦截 + 401 处理 |
| `src/routes/_authenticated/route.tsx` | 修改 | 路由守卫 |
| `src/routes/__root.tsx` | 修改 | 注册 sign-in 路由 |
| `src/components/layout/app-sidebar.tsx` | 修改 | 从 store 读菜单 + 用户信息 |
| `src/components/layout/data/sidebar-data.ts` | 删除 | 替换为后端菜单 |

---

## 4. 默认账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | admin |

Seed 脚本创建该账号，并将现有监控/分析数据关联到此账号。

---

## 5. 测试策略

- 后端：手动测试登录/鉴权/隔离流程
- 前端：手动测试登录页、路由守卫、401 跳转
- E2E 测试后续补充
