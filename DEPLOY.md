# Cloud deployment guide

This application runs as a standalone **Node.js / Express server** (`node server.js`), targeting **Node.js 20** in production.

## Recommended: cloud host deployment (no Docker)

Suitable for VPS / cloud VM (AWS EC2, DigitalOcean Droplet, 腾讯云 CVM, 阿里云 ECS, etc.).

### 1. Install Node.js 20 on the host

Using nvm:

```sh
nvm install 20
nvm use 20
```

This repository includes `.nvmrc` with `20` — just run `nvm use` if you already have it.

### 2. Clone and build

```sh
git clone <your-repo-url>
cd jsonhero-web-main
npm install --legacy-peer-deps
npm run build
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```sh
PORT=3000
SESSION_SECRET=<generate-a-random-string>
JSONHERO_DATA_DIR=/path/to/data
```

> **`SESSION_SECRET` is required** — used for cookie signing. Generate one with:
> ```sh
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 4. Start the server

```sh
node server.js
```

### 5. Process management (recommended)

Use **PM2** to keep the process alive and auto-restart on crash:

```sh
npm install -g pm2
pm2 start server.js --name jsonhero
pm2 save
pm2 startup   # auto-start on system boot
```

Other commands:

```sh
pm2 status             # check status
pm2 logs jsonhero      # view logs
pm2 restart jsonhero   # restart after updates
```

### 6. Reverse proxy with Nginx

**PM2 监听内网端口**，Nginx 做反向代理 + SSL 终结：

```sh
pm2 start server.js --name jsonhero    # 默认 127.0.0.1:3000
```

**Nginx 配置**（`/etc/nginx/sites-available/jsonhero`）：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**启用站点并配置 SSL：**

```sh
sudo ln -s /etc/nginx/sites-available/jsonhero /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d your-domain.com   # 自动配置 HTTPS
```

**多站点示例** — 同一台服务器上第二个站点：

```nginx
server {
    listen 80;
    server_name another-site.com;

    location / {
        proxy_pass http://127.0.0.1:3001;  # 另一个 Node 应用
    }
}
```
    }
}
```

## Quick start (all in one)

```sh
nvm use 20
npm install --legacy-peer-deps
npm run build
echo "SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" >> .env
node server.js
```

## Migration summary (Cloudflare Workers → Express)

Originally this app ran on Cloudflare Workers. It has been migrated to a standalone Node.js Express server:

- **`server.js`** — Express entry point using `@remix-run/express` `createRequestHandler`
- **`remix.config.js`** — `serverBuildTarget` set to `node-cjs`, output to `build/index.js`
- **`worker/index.js`** — removed (Cloudflare Worker entry no longer needed)
- **`app/kv-store.server.ts`** — local filesystem KV store replacing Cloudflare KV (`DOCUMENTS`)
- **`app/jsonDoc.server.ts`** — switched from `DOCUMENTS.put/get/delete` to local `KV` implementation
- **`app/theme.server.ts`** / **`app/services/toast.server.ts`** — use `process.env.SESSION_SECRET` instead of global `SESSION_SECRET`

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Express server port |
| `SESSION_SECRET` | **Yes** | — | Cookie signing secret; **must set a strong value in production** |
| `JSONHERO_DATA_DIR` | No | `.jsonhero-data` | Directory for local KV file storage |
| `GRAPH_JSON_API_KEY` | No | — | Graph JSON API key (if used) |
| `GRAPH_JSON_COLLECTION` | No | — | Graph JSON collection name |
| `APIHERO_PROJECT_KEY` | No | — | API Hero project key |
