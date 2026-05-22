# 蜂产业大脑 (Bee Industry Brain) 部署文档

> 最后更新：2026-05-22  
> GitHub: https://github.com/vita-tan/bee_dabao

---

## 一、项目概述

蜂产业大脑是一套面向南浦溪镇蜂农的数字化管理平台，包含 5 个子项目：

| 子项目 | 技术栈 | 端口 | 用途 |
|---|---|---|---|
| `bee-miniapp` | uni-app (Vue3 + TS) | 4176 (H5) | 蜂农小程序/移动端 |
| `bee-platform-server` | NestJS (TypeScript) | 3000 | 后端 API 服务 |
| `bee-admin` | React + Ant Design | — | PC 管理后台 |
| `bee-datascreen` | 数据可视化 | — | 数据大屏 |
| `bee-trace-h5` | 原生 H5 | — | 消费者追溯码查询页 |

---

## 二、环境要求

| 依赖 | 版本 | 说明 |
|---|---|---|
| Node.js | >= 18.x | 推荐 20 LTS |
| MySQL | 9.7.0 | 数据库 |
| npm / pnpm | — | 包管理器 |
| Git | 2.x+ | 源码管理 |

### 外部服务（无需额外配置）

- **天气 API**：Open-Meteo（免费，无需 Key），坐标硬编码为 南浦溪镇 `27.62049, 119.938444`
- **地图服务**：H5 端自取经纬度定位
- **二维码生成**：前端 qrcode.js 纯客户端生成

---

## 三、数据库

### 3.1 连接信息

```
Host: localhost:3306
Database: bee_platform
User: root
Password: Qwer134679@
Charset: utf8mb4
```

### 3.2 初始化

```bash
# 1. 创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS bee_platform DEFAULT CHARACTER SET utf8mb4"

# 2. TypeORM 同步（开发环境）
# 启动后端后，synchronize: true 会自动建表
```

### 3.3 核心数据表

| 表名 | 说明 |
|---|---|
| `beekeepers` | 蜂农用户（含 avatar, creditScore） |
| `apiaries` | 蜂场信息 |
| `harvests` | 采蜜记录 |
| `medications` | 用药记录 |
| `accounts` | 收支台账 |
| `trace_codes` | 追溯码 |
| `notifications` | 系统通知 |
| `beekeeper_notifications` | 蜂农-通知关联 |

---

## 四、部署步骤

### 4.1 克隆仓库

```bash
git clone https://github.com/vita-tan/bee_dabao.git
cd bee_dabao
```

### 4.2 后端部署

```bash
cd bee-platform-server
npm install

# 开发模式（热重载）
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

后端启动后监听 `http://localhost:3000`，API 前缀 `/api/app/`（小程序端）和 `/api/admin/`（管理后台）。

### 4.3 小程序 H5 部署

```bash
cd bee-miniapp
npm install

# 开发模式（H5 预览）
npx vite --port 4176 --host 0.0.0.0

# 微信小程序编译
npm run dev:mp-weixin
```

H5 端通过 `vite.config.ts` 配置代理 `localhost:4176/api → localhost:3000`。

### 4.4 管理后台（可选）

```bash
cd bee-admin
npm install
npm run dev
```

### 4.5 数据大屏（可选）

```bash
cd bee-datascreen
npm install
npm run dev
```

### 4.6 追溯码 H5（可选）

```bash
cd bee-trace-h5
npm install
npm run dev
```

---

## 五、快速启动脚本

```bash
#!/bin/bash
# 一键启动开发环境

# 1. 启动 MySQL（确保服务已运行）
# net start mysql  # Windows

# 2. 启动后端
cd bee-platform-server && npm run start:dev &

# 3. 等待后端就绪
sleep 5

# 4. 启动小程序 H5
cd bee-miniapp && npx vite --port 4176 --host 0.0.0.0 &

echo "后端: http://localhost:3000"
echo "H5:   http://localhost:4176"
```

---

## 六、核心功能清单

### 6.1 蜂农端（bee-miniapp）

| 功能 | 路径 | 说明 |
|---|---|---|
| 首页 | `/pages/index/index` | 天气卡片、快捷操作、蜂场概览 |
| 蜂场管理 | `/pages/apiary/*` | 蜂场 CRUD |
| 采蜜记录 | `/pages/record/harvest` | 采蜜提交 + 追溯码快捷入口 |
| 用药记录 | `/pages/record/medication` | 用药登记 |
| 收支台账 | `/pages/account/index` | 收入/支出记录 |
| 追溯码 | `/pages/trace/list` | 追溯码管理（列表+统计+详情） |
| 追溯码生成 | `/pages/trace/generate` | 3步向导生成 |
| 消息通知 | `/pages/mine/notifications` | 系统通知列表 |
| 我的 | `/pages/mine/index` | 个人信息、信用分、退出 |

### 6.2 后端 API（bee-platform-server）

#### 认证
| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/app/auth/dev-login` | POST | 开发环境免验证码登录 |

#### 蜂场
| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/app/apiaries` | GET/POST | 蜂场列表/添加 |

#### 采蜜
| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/app/harvests` | GET/POST | 采蜜记录 |

#### 追溯码
| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/app/trace` | GET | 追溯码列表 |
| `/api/app/trace/generate` | POST | 生成追溯码 |
| `/api/app/trace/:id` | GET | 追溯码详情（含QR URL） |
| `/trace/:code` | GET | 消费者公开查询（无需认证） |

#### 收支
| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/app/accounts` | GET/POST | 收支记录 |

#### 通知
| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/app/notifications` | GET | 通知列表 |
| `/api/app/notifications/unread-count` | GET | 未读数量 |

---

## 七、已知问题与注意事项

### 7.1 TypeORM 版本兼容
项目使用 TypeORM 0.3.28，`repository.query()` 直接返回数组，**不要**解构成 `[rows]` 元组形式。

### 7.2 H5 代理配置
小程序 H5 开发时，`/api` 请求通过 Vite proxy 转发到 `localhost:3000`。生产部署需用 Nginx 反向代理。

### 7.3 天气 API
Open-Meteo 免费但依赖外网。内网环境需自行搭建气象数据源或改 fallback。

### 7.4 追溯码格式
`BEE-{蜂农ID(6位)}-{YYYYMM}-{4位流水号}`，每月每蜂农上限 9999。

### 7.5 端口冲突
- 3000: 后端 NestJS
- 4176: 小程序 H5 (Vite)
- 3306: MySQL
- 确保这些端口未被占用

---

## 八、故障排查

| 现象 | 可能原因 | 排查步骤 |
|---|---|---|
| H5 页面空白 | Vite 未启动 | `curl localhost:4176` |
| API 网络错误 | 后端未启动 | `curl localhost:3000/api/app/auth/dev-login` |
| 消息通知空白 | TypeORM query 解构 bug | 确认 `admin.service.ts` 未用 `[rows]` 解构 |
| 头像不显示 | DB 无 avatar + 占位图失效 | 已改用 CSS 文字头像兜底 |
| 数据库连接失败 | MySQL 未启动 | `mysql -u root -p` |
