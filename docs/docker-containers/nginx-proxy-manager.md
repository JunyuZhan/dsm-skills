# Nginx Proxy Manager (NPM)：可视化反代神器

如果你觉得 Traefik 配置太抽象，或者群晖自带的反向代理功能不够强大（不支持自动申请泛域名证书、访问控制弱），那么 **Nginx Proxy Manager (NPM)** 是你的最佳选择。它拥有一个漂亮的 Web 界面，让你点点鼠标就能配置反向代理、申请 SSL 证书、设置访问权限。

## 为什么选择 NPM？

*   **可视化管理**：所有操作都在网页上完成，适合新手。
*   **自动 SSL**：内置 Let's Encrypt 支持，自动申请和续期证书。
*   **泛域名支持**：支持 DNS Challenge，轻松申请 `*.yourdomain.com` 证书。
*   **访问控制**：支持 Basic Auth（密码保护）和 IP 白名单。

## 1. 部署 NPM (Docker Compose)

NPM 需要一个数据库（SQLite 或 MySQL）。推荐使用 MySQL 以获得更好的性能。

### 准备工作
1.  在 `/volume1/docker/` 下创建 `npm` 目录。
2.  创建 `docker-compose.yml` 文件。

```yaml
version: '3.8'
services:
  app:
    image: 'jc21/nginx-proxy-manager:latest'
    restart: unless-stopped
    ports:
      - '80:80'   # HTTP 端口
      - '81:81'   # 管理后台端口
      - '443:443' # HTTPS 端口
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
    depends_on:
      - db

  db:
    image: 'jc21/mariadb-aria:latest'
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: 'npm'
      MYSQL_DATABASE: 'npm'
      MYSQL_USER: 'npm'
      MYSQL_PASSWORD: 'npm'
    volumes:
      - ./mysql:/var/lib/mysql

networks:
  default:
    external: false
```

### 端口冲突解决
群晖 DSM 默认占用了 80 和 443 端口。
*   **方案 A (推荐)**：修改 NPM 的端口映射，例如 `8080:80` 和 `4443:443`。然后在路由器上做端口转发：外网 80 -> 内网 8080，外网 443 -> 内网 4443。
*   **方案 B (Macvlan)**：给 NPM 分配一个独立的局域网 IP，独占 80/443。

## 2. 初始化与配置

1.  启动容器：`docker compose up -d`
2.  访问管理后台：`http://nas-ip:81`
3.  **默认账号**：
    *   Email: `admin@example.com`
    *   Password: `changeme`
4.  登录后务必修改邮箱和密码。

## 3. 申请泛域名 SSL 证书

这是 NPM 最强大的功能。

1.  进入 **SSL Certificates** > **Add SSL Certificate** > **Let's Encrypt**。
2.  **Domain Names**: 输入 `*.yourdomain.com` 和 `yourdomain.com`。
3.  **Email**: 填你的邮箱。
4.  **Use a DNS Challenge**: 勾选。这是申请泛域名证书的关键。
5.  **DNS Provider**: 选择你的域名服务商（如 Cloudflare, Aliyun, Tencent Cloud）。
6.  **Credentials File Content**:
    *   根据提示填入 API Token。
    *   *以 Cloudflare 为例*：将 `dns_cloudflare_api_token =` 后面的值换成你的 Token。
7.  点击 **Save**。稍等片刻，证书申请成功。

## 4. 配置反向代理

现在我们把 NAS 上的 Jellyfin 暴露出去。

1.  进入 **Hosts** > **Proxy Hosts** > **Add Proxy Host**。
2.  **Details**:
    *   **Domain Names**: `video.yourdomain.com`
    *   **Scheme**: `http`
    *   **Forward Hostname / IP**: `192.168.1.100` (NAS IP)
    *   **Forward Port**: `8096`
    *   **Cache Assets**: 勾选（加速静态资源）。
    *   **Block Common Exploits**: 勾选（安全防护）。
    *   **Websockets Support**: 勾选（重要！Jellyfin 需要这个）。
3.  **SSL**:
    *   **SSL Certificate**: 选择刚才申请的泛域名证书。
    *   **Force SSL**: 勾选。
    *   **HTTP/2 Support**: 勾选。
4.  点击 **Save**。
5.  访问 `https://video.yourdomain.com`，成功！

## 5. 访问控制 (Access Lists)

有些服务（如 Portainer）不想公开，只想在公司访问。

1.  进入 **Access Lists** > **Add Access List**。
2.  **Name**: `Company Only`。
3.  **Authorization**:
    *   **Username/Password**: 可以设置账号密码（Basic Auth）。
4.  **Access**:
    *   **allow**: `1.2.3.4` (公司公网 IP)
    *   **deny**: `all`
5.  回到 **Proxy Hosts**，编辑 Portainer 的规则，在 **Access List** 中选择 `Company Only`。

## 6. 常见问题

### Q1: 证书续期失败？
*   检查 API Token 是否过期。
*   检查 DNS 解析是否正常。
*   查看容器日志：`docker logs npm-app-1`。

### Q2: 502 Bad Gateway？
*   NPM 容器无法连接到目标 IP:端口。
*   如果目标也是 Docker 容器，确保它们在同一个 Docker 网络，或者使用宿主机 IP (`192.168.1.x`) 而不是 `localhost`。
