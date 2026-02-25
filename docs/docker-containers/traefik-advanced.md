# Traefik 进阶：自动发现与泛域名 HTTPS

在 NAS 上部署几十个 Docker 容器，如果每个都去群晖控制面板里手动配反向代理，不仅累，而且端口号记不住。**Traefik** 是云原生时代的边缘路由器，它能监听 Docker 事件，容器一启动，域名自动生效，HTTPS 证书自动申请。

## 1. 为什么选择 Traefik？

*   **全自动**：不需要手写 Nginx 配置文件。只要给容器加个 Label，Traefik 就知道怎么代理。
*   **泛域名证书**：支持 Let's Encrypt 的 DNS-01 验证，哪怕你在内网（没有公网 IP），也能申请到合法的 `*.yourdomain.com` 证书。
*   **中间件**：支持 Basic Auth（加密码）、IP 白名单、速率限制等高级功能。
*   **Dashboard**：自带一个漂亮的仪表盘，查看所有路由状态。

## 2. 部署 Traefik (Docker Compose)

我们需要挂载 Docker Socket，并配置 DNS 服务商（以 Cloudflare 为例）的 API Token 来申请泛域名证书。

### 准备工作
1.  **域名**：托管在 Cloudflare（免费且 API 最好用）。
2.  **API Token**：在 Cloudflare 后台申请一个只有 `Zone:DNS:Edit` 权限的 Token。
3.  **目录**：创建 `/volume1/docker/traefik`，并创建空文件 `acme.json`（用于存证书），权限设为 `600`。
    ```bash
    touch /volume1/docker/traefik/acme.json
    chmod 600 /volume1/docker/traefik/acme.json
    ```

### docker-compose.yml
```yaml
services:
  traefik:
    image: traefik:v2.10
    container_name: traefik
    command:
      - "--api.insecure=true" # 开启 Dashboard (8080端口)
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false" # 默认不代理，除非手动加 Label
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      # 自动跳转 HTTPS
      - "--entrypoints.web.http.redirections.entryPoint.to=websecure"
      - "--entrypoints.web.http.redirections.entryPoint.scheme=https"
      # 证书解析器 (Cloudflare)
      - "--certificatesresolvers.myresolver.acme.dnschallenge=true"
      - "--certificatesresolvers.myresolver.acme.dnschallenge.provider=cloudflare"
      - "--certificatesresolvers.myresolver.acme.email=your@email.com"
      - "--certificatesresolvers.myresolver.acme.storage=/acme.json"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080" # Dashboard
    environment:
      - CF_DNS_API_TOKEN=your_cloudflare_api_token # 填你的 Token
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /volume1/docker/traefik/acme.json:/acme.json
    restart: always

  # 测试应用：whoami
  whoami:
    image: traefik/whoami
    container_name: whoami
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.whoami.rule=Host(`whoami.yourdomain.com`)"
      - "traefik.http.routers.whoami.entrypoints=websecure"
      - "traefik.http.routers.whoami.tls.certresolver=myresolver"
```

## 3. 核心配置详解

### 3.1 自动申请证书
只要在容器的 Label 中加上 `traefik.http.routers.xxx.tls.certresolver=myresolver`，Traefik 就会去 Cloudflare 验证域名所有权，并申请证书。
*   **泛域名**：如果你有很多子域名，建议在 `command` 中添加 `main` 和 `sans` 参数申请通配符证书，避免频繁申请触发限制。

### 3.2 中间件 (Middleware)

#### Basic Auth (密码保护)
有些服务（如 Portainer, Homepage）自带登录，但有些（如 Node-RED, Dozzle）没有。我们可以用 Traefik 给它们加把锁。

1.  生成密码（htpasswd）：
    ```bash
    echo $(htpasswd -nb user password) | sed -e s/\\$/\\$\\$/g
    # 输出: user:$$apr1$$v2....
    ```
2.  定义中间件（在 Traefik 的 `labels` 中，或者动态配置文件中）：
    ```yaml
    labels:
      - "traefik.http.middlewares.auth.basicauth.users=user:$$apr1$$v2...."
    ```
3.  应用中间件：
    ```yaml
    labels:
      - "traefik.http.routers.whoami.middlewares=auth"
    ```

#### IP 白名单
只允许内网访问某些服务。
```yaml
labels:
  - "traefik.http.middlewares.internal-only.ipwhitelist.sourcerange=192.168.0.0/16,10.0.0.0/8"
```

## 4. 与群晖自带 Nginx 共存

群晖 DSM 默认占用了 80/443 端口。
*   **方案 A (推荐)**：让 Traefik 监听其他端口（如 81/444），然后在路由器映射 `80->81, 443->444`。
*   **方案 B (Macvlan)**：给 Traefik 分配一个独立的局域网 IP（如 192.168.1.5），这样它就能独占 80/443，互不干扰。

## 5. 常见问题

### Q1: 证书申请失败？
查看日志：`docker logs traefik`。
*   **DNS 验证超时**：Cloudflare API 偶尔会慢。
*   **权限不足**：API Token 权限不够。
*   **ACME 限制**：频繁申请导致被 Let's Encrypt 暂时封锁（Rate Limit）。

### Q2: 容器无法访问？
Traefik 必须能通过 Docker 网络访问到目标容器。
*   如果目标容器在 `bridge` 网络，Traefik 也在 `bridge` 网络，它们默认互通。
*   如果使用了自定义网络，记得把 Traefik 也加入该网络。
