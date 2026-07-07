# 部门业务工具

公司内部工具聚合平台，提供竞品分析、价格监控等业务工具。

## 技术栈

### 前端

| 技术 | 说明 |
|------|------|
| React 19 + TypeScript | 核心框架 |
| Vite 8 | 构建工具 |
| ShadcnUI (RadixUI + TailwindCSS 4) | UI 组件库 |
| TanStack Router | 路由管理 |
| TanStack React Query | 数据请求 |
| Recharts | 图表 |
| pnpm | 包管理 |

### 后端

| 技术 | 说明 |
|------|------|
| Python 3.11+ + FastAPI | 异步 Web 框架 |
| MySQL + SQLAlchemy 2.0 (async) | 数据库 |
| Alembic | 数据库迁移 |
| JustOneAPI | 第三方电商数据 |
| uv | Python 包管理 |

## 功能

| 模块 | 说明 |
|------|------|
| 竞品分析 | 粘贴京东/天猫商品链接，多维度（设计/定价/功能/质量/客服）竞品分析 |
| 价格监控 | 监控商品价格变动，设置目标价，自动触发降价提醒 |
| 平台比价 | 同一商品跨平台价格对比 |
| 价格走势 | 商品历史价格变化趋势 |

## 快速开始

### 环境要求

- Node.js >= 20
- pnpm >= 9
- Python >= 3.11
- uv (Python 包管理器)
- MySQL >= 8.0

### 1. 启动后端

```bash
cd backend

# 安装依赖
uv sync

# 创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS department_tools DEFAULT CHARSET utf8mb4"

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入实际配置

# 启动服务
uv run uvicorn app.main:app --reload --port 8000
```

API 文档自动生成：http://localhost:8000/docs

### 2. 启动前端

```bash
cd frontend
pnpm install
pnpm dev
```

访问 http://localhost:5173

### 3. 一键启动（开发）

```bash
# 终端 1
cd backend && uv run uvicorn app.main:app --reload --port 8000

# 终端 2
cd frontend && pnpm dev
```

## 环境变量

### 后端 (`backend/.env`)

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DATABASE_URL` | MySQL 连接字符串 | `mysql+asyncmy://root:root@localhost:3306/department_tools` |
| `JUSTONE_API_TOKEN` | JustOneAPI 访问令牌 | (空) |
| `DEBUG` | 调试模式（自动建表） | `true` |

### 前端 (`frontend/.env`)

| 变量 | 说明 | 默认值 |
|------|------|--------|
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

### 竞品分析

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/bidding/analyze` | 提交商品链接，返回多维度分析 |
| GET | `/api/bidding/records` | 查询历史分析记录 |
| DELETE | `/api/bidding/records/{id}` | 删除记录 |

### 价格监控

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/price/monitor` | 获取监控列表 |
| POST | `/api/price/monitor` | 添加监控商品 |
| DELETE | `/api/price/monitor/{id}` | 删除监控 |
| GET | `/api/price/stats` | 监控统计数据 |
| GET | `/api/price/compare/{id}` | 跨平台比价 |
| GET | `/api/price/history/{id}` | 价格历史走势 |

## 项目结构

```
department-tools/
├── frontend/                  # React 前端
│   └── src/
│       ├── api/               # API 调用层（client + 业务模块）
│       │   ├── client.ts      # Axios 实例 & 统一响应解包
│       │   ├── bidding.ts     # 竞品分析 API
│       │   └── price.ts       # 价格监控 API
│       ├── features/
│       │   ├── bidding/       # 竞品分析（URL输入、分析卡片）
│       │   ├── price/         # 价格监控（列表、比价、走势）
│       │   └── home/          # 首页
│       ├── components/        # 共享组件 & UI 基础
│       └── routes/            # 路由配置
│
└── backend/                   # Python 后端
    ├── pyproject.toml         # uv 项目配置
    ├── .env                   # 环境变量
    └── app/
        ├── main.py            # FastAPI 入口
        ├── config.py          # 配置管理
        ├── db/                # 数据库层
        │   ├── base.py        # ORM 基类
        │   └── session.py     # 会话管理
        ├── models/            # 数据模型
        │   ├── product.py     # 竞品分析表
        │   └── monitor.py     # 价格监控表
        ├── schemas/           # 请求/响应 Schema
        │   ├── product.py
        │   ├── monitor.py
        │   └── response.py    # 统一响应格式
        ├── routers/           # API 路由
        │   ├── product.py     # /api/bidding/*
        │   └── monitor.py     # /api/price/*
        └── services/          # 业务逻辑
            ├── justone.py     # JustOneAPI 客户端
            ├── url_parser.py  # 电商链接解析
            ├── product_analyzer.py  # 商品分析
            └── price_monitor.py     # 价格监控
```

## 支持平台

| 平台 | 状态 |
|------|------|
| 京东 (jd.com) | ✅ 支持 |
| 天猫 (tmall.com) | ✅ 支持 |
| 淘宝 (taobao.com) | ✅ 支持 |
| 拼多多 (yangkeduo.com) | ❌ JustOneAPI 暂不支持 |
