# 蜂产业大脑 - 生产环境部署指南

> GitHub: https://github.com/vita-tan/bee_dabao
> 最后更新：2026-06-02

---

## 一、项目结构

```
bee_dabao/
├── bee-platform-server/    # 后端 API 服务（NestJS，端口 3000）
├── bee-admin/              # PC 管理后台（React + Ant Design）
│   └── dist/               # ← 编译产物，部署到 Nginx
├── bee-datascreen/         # 数据大屏（Vue3 + ECharts）
│   └── dist/               # ← 编译产物，部署到 Nginx
├── bee-miniapp/            # 蜂农小程序（uni-app Vue3）
│   └── dist/build/h5/      # ← H5 编译产物，部署到 Nginx
├── bee-trace-h5/           # 消费者追溯码查询页
└── DEPLOY-GUIDE.md         # 本文档
```

---

## 二、环境要求

| 依赖 | 最低版本 | 说明 |
|------|---------|------|
| Node.js | >= 18.x | 推荐 20 LTS |
| MySQL | >= 8.0 | 字符集 utf8mb4 |
| Nginx | — | 反向代理 + 静态资源 |
| pm2 | — | 进程守护（可选但推荐） |

---

## 三、配置说明（只改一个文件）

所有配置统一在 **`bee-platform-server/.env`**，不需要改代码里任何地方。

### 首次部署

```bash
cd bee-platform-server
cp .env.example .env
vim .env
```

### 配置项说明

| 配置项 | 说明 | 默认值 | 是否必须改 |
|--------|------|--------|-----------|
| `DB_HOST` | 数据库地址 | `localhost` | 视环境 |
| `DB_PORT` | 数据库端口 | `3306` | 一般不用 |
| `DB_USER` | 数据库用户 | `root` | 视环境 |
| `DB_PASS` | 数据库密码 | `your_password` | **必须改** |
| `DB_NAME` | 数据库名 | `bee_platform` | 一般不用 |
| `REDIS_HOST` | Redis 地址 | `localhost` | 视环境 |
| `REDIS_PORT` | Redis 端口 | `6379` | 一般不用 |
| `JWT_SECRET` | JWT 签名密钥 | `your_super_secret_key...` | **必须改** |
| `JWT_EXPIRES_IN` | Token 过期时间 | `2h` | 可选 |
| `JWT_REFRESH_EXPIRES_IN` | 刷新 Token 过期 | `7d` | 可选 |
| `WECHAT_APP_ID` | 微信小程序 AppID | 空 | 上线必须 |
| `WECHAT_APP_SECRET` | 微信小程序密钥 | 空 | 上线必须 |
| `COS_SECRET_ID` | 腾讯云 COS 密钥 | 空 | 文件上传必须 |
| `COS_SECRET_KEY` | 腾讯云 COS 密钥 | 空 | 文件上传必须 |
| `COS_BUCKET` | COS 存储桶名 | — | 文件上传必须 |
| `COS_REGION` | COS 区域 | `ap-guangzhou` | 视环境 |
| `APP_PORT` | 后端端口 | `3000` | 一般不用 |
| `NODE_ENV` | 运行环境 | `development` | **改为 `production`** |

---

## 四、部署步骤

### 第 1 步：拉取最新代码

```bash
cd /usr/local/deploy_space/bee-danao/bee_dabao-master
git pull origin master
```

> 前端 `dist/` 目录已包含在仓库中，**无需在服务器上重新编译**。

### 第 2 步：安装后端依赖

```bash
cd bee-platform-server
npm install
```

> 前端 `dist/` 是预编译的静态文件，不需要安装前端依赖。

### 第 3 步：配置环境变量

```bash
# 首次部署
cp .env.example .env
vim .env   # 改 DB_PASS、JWT_SECRET、NODE_ENV=production 等

# 后续更新
vim .env   # 只在配置变更时修改
```

### 第 4 步：初始化数据库（仅首次）

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS bee_platform DEFAULT CHARACTER SET utf8mb4"

# 导入初始数据
npm run seed
```

> TypeORM `synchronize: true` 在开发环境会自动建表。生产环境建议关闭 synchronize，手动管理迁移。

### 第 5 步：启动后端服务

```bash
# 构建
npm run build

# 前台运行（调试用）
npm run start:prod

# 后台运行（推荐 pm2）
pm2 start dist/main.js --name bee-platform
pm2 save
```

### 第 6 步：验证后端

```bash
curl http://localhost:3000/docs
# 看到 Swagger 文档页面说明启动成功
```

> **注意**：所有前端模块的 `vite.config.ts` 已配置 `base` 路径（`/admin/`、`/datascreen/`、`/h5/`、`/trace/`），编译后的资源引用会自动带上子路径前缀，Nginx 按如下配置即可。

### 第 7 步：配置 Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # ===== 后端 API =====
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # ===== 管理后台（bee-admin）=====
    location /admin/ {
        alias /usr/local/deploy_space/bee-danao/bee_dabao-master/bee-admin/dist/;
        try_files $uri $uri/ /admin/index.html;
    }

    # ===== 数据大屏（bee-datascreen）=====
    location /datascreen/ {
        alias /usr/local/deploy_space/bee-danao/bee_dabao-master/bee-datascreen/dist/;
        try_files $uri $uri/ /datascreen/index.html;
    }

    # ===== 小程序 H5（bee-miniapp）=====
    location /h5/ {
        alias /usr/local/deploy_space/bee-danao/bee_dabao-master/bee-miniapp/dist/build/h5/;
        try_files $uri $uri/ /h5/index.html;
    }

    # ===== 追溯码查询（bee-trace-h5）=====
    location /trace/ {
        alias /usr/local/deploy_space/bee-danao/bee_dabao-master/bee-trace-h5/dist/;
        try_files $uri $uri/ /trace/index.html;
    }

    # ===== 默认页 → 管理后台 =====
    location / {
        return 301 /admin/;
    }
}
```

### 第 8 步：重载 Nginx

```bash
nginx -t          # 检查配置
nginx -s reload   # 重载
```

---

## 五、更新部署（非首次）

```bash
cd /usr/local/deploy_space/bee-danao/bee_dabao-master

# 1. 拉取最新代码（含预编译 dist/）
git pull origin master

# 2. 重新构建后端（如 src/ 有变更）
cd bee-platform-server
npm run build
pm2 restart bee-platform

# 3. 前端无需编译，dist/ 已更新，重载 Nginx 即可
nginx -s reload
```

---

## 六、端口与服务一览

| 服务 | 端口 | 说明 |
|------|------|------|
| Nginx | 80 / 443 | 反向代理入口 |
| NestJS 后端 | 3000 | API 服务 |
| MySQL | 3306 | 数据库 |
| Redis | 6379 | 缓存（可选） |

---

## 七、常见问题

### Q: 启动报 `crypto is not defined`
**已修复**。`src/main.ts` 已添加 crypto polyfill，兼容 Node.js < 19。拉取最新代码即可。

### Q: 前端编译报 `baseUrl is deprecated`
**已修复**。`tsconfig.json` 和 `tsconfig.app.json` 已添加 `"ignoreDeprecations": "6.0"`。`dist/` 已预编译提交。

### Q: 数据库连不上
1. 检查 `.env` 中 `DB_HOST`、`DB_PORT`、`DB_USER`、`DB_PASS`
2. 确认 MySQL 正在运行：`systemctl status mysql`

### Q: 需要改配置
**只改 `bee-platform-server/.env`** 这一个文件，改完重启后端即可。

### Q: 如何查看日志
```bash
pm2 logs bee-platform     # 后端日志
pm2 logs bee-platform --lines 100   # 最近100行
tail -f /var/log/nginx/error.log    # Nginx 错误日志
```

### Q: API 返回 404 或 405
确认后端服务在运行（`curl localhost:3000/docs`），Nginx `/api/` 代理配置正确。

---

## 八、开发环境本地启动（参考）

```bash
# 后端
cd bee-platform-server && npm run start:dev

# 管理后台
cd bee-admin && npm run dev

# 小程序 H5
cd bee-miniapp && npx uni --port 4176 --host

# 数据大屏
cd bee-datascreen && npm run dev
```

| 服务 | 开发地址 |
|------|---------|
| 后端 API | http://localhost:3000 |
| Swagger 文档 | http://localhost:3000/docs |
| 管理后台 | http://localhost:5173 |
| 小程序 H5 | http://localhost:4176 |
| 数据大屏 | http://localhost:5174 |
