# 蜂产业大脑 - 生产环境部署指南

## 一、配置说明（只需改一个文件）

所有配置统一在 **`bee-platform-server/.env`** 文件中，不需要改代码里任何地方。

### 首次部署：创建 .env 文件

```bash
cd /usr/local/deploy_space/bee-danao/bee_dabao-master/bee-platform-server
cp .env.example .env
vim .env    # 改成真实的配置值
```

### 必须修改的配置项

| 配置项 | 说明 | 示例 |
|--------|------|------|
| `DB_HOST` | 数据库地址 | `127.0.0.1` 或内网 IP |
| `DB_PORT` | 数据库端口 | `3306` |
| `DB_USER` | 数据库用户 | `root` |
| `DB_PASS` | **数据库密码**（必须改！） | 生产密码 |
| `DB_NAME` | 数据库名 | `bee_platform` |
| `JWT_SECRET` | **JWT 密钥**（必须改！） | 随机字符串 |
| `WECHAT_APP_ID` | 微信小程序 AppID | 从微信后台获取 |
| `WECHAT_APP_SECRET` | **微信小程序密钥**（必须改！） | 从微信后台获取 |
| `COS_SECRET_ID` | 腾讯云 COS 密钥 | 如需文件上传则配置 |
| `COS_SECRET_KEY` | 腾讯云 COS 密钥 | 如需文件上传则配置 |
| `NODE_ENV` | 改为 `production` | `production` |

## 二、部署步骤

### 1. 拉取最新代码

```bash
cd /usr/local/deploy_space/bee-danao/bee_dabao-master
git pull origin master
```

### 2. 安装依赖（首次或 package.json 变更时）

```bash
cd bee-platform-server
npm install
```

### 3. 初始化数据库（首次部署时）

```bash
npm run seed    # 导入初始数据
```

### 4. 构建并启动

```bash
npm run build
npm run start:prod
```

### 5. 验证服务

```bash
# 检查服务是否启动
curl http://localhost:3000/docs

# 看到 Swagger 文档页面说明启动成功
```

## 三、前端部署

### bee-admin（后台管理）
```bash
cd bee-admin
npm install
npm run build
# 将 dist/ 目录部署到 Nginx
```

### bee-miniapp（小程序）
```bash
cd bee-miniapp
npm install
# 微信小程序：使用 HBuilderX 打开项目 → 发行 → 小程序
# H5 版本：npm run build:h5
```

### bee-datascreen（数据大屏）
```bash
cd bee-datascreen
npm install
npm run build
# 将 dist/ 目录部署到 Nginx
```

## 四、Nginx 反向代理配置（参考）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 后端 API
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 前端页面
    location / {
        root /usr/local/deploy_space/bee-danao/bee_dabao-master/bee-admin/dist;
        try_files $uri $uri/ /index.html;
    }

    # 数据大屏
    location /datascreen/ {
        alias /usr/local/deploy_space/bee-danao/bee_dabao-master/bee-datascreen/dist/;
        try_files $uri $uri/ /datascreen/index.html;
    }
}
```

## 五、常见问题

### Q: 启动报 `crypto is not defined`
**已修复**。v1.0.1 版本的 `main.ts` 已添加 crypto polyfill，兼容 Node.js < 19。拉取最新代码即可。

### Q: 数据库连不上
检查 `.env` 中的 `DB_HOST`、`DB_PORT`、`DB_USER`、`DB_PASS` 是否正确，以及 MySQL 是否在运行。

### Q: 需要改配置
只改 `bee-platform-server/.env` 这一个文件，改完重启服务即可。

### Q: 如何查看日志
```bash
# 前台运行可以直接看输出
# 后台运行建议用 pm2
pm2 start dist/main.js --name bee-platform
pm2 logs bee-platform
```
