# FRP：高性能自建内网穿透

虽然 Tailscale 和 Cloudflare Tunnel 很方便，但它们都依赖第三方服务器，速度受限且有隐私顾虑。如果你有一台公网 VPS（如阿里云、腾讯云轻量应用服务器），那么 **FRP (Fast Reverse Proxy)** 是内网穿透的终极选择：**速度完全取决于你的 VPS 带宽，且数据完全私有。**

## 1. 原理

*   **FRP 服务端 (frps)**：运行在有公网 IP 的 VPS 上，监听来自外网的请求。
*   **FRP 客户端 (frpc)**：运行在内网 NAS 上，主动连接 VPS，维持一条隧道。
*   **流程**：用户访问 `http://vps-ip:8080` -> frps -> 隧道 -> frpc -> NAS:8096 (Jellyfin)。

## 2. 部署服务端 (frps)

假设你有一台 VPS，IP 为 `1.2.3.4`。推荐使用 Docker 部署，干净利落。

### 准备配置文件
在 VPS 上创建 `frps.toml`：
```toml
bindPort = 7000        # 客户端连接端口
vhostHTTPPort = 8080   # HTTP 访问端口
vhostHTTPSPort = 8443  # HTTPS 访问端口
auth.method = "token"  # 身份验证方式
auth.token = "mysecrettoken123" # 修改为你的复杂密码

# Dashboard (可选)
webServer.addr = "0.0.0.0"
webServer.port = 7500
webServer.user = "admin"
webServer.password = "admin"
```

### 启动服务端
```bash
docker run -d --name frps --restart always --network host \
  -v $(pwd)/frps.toml:/etc/frp/frps.toml \
  snowdreamtech/frps
```
*注意：要在 VPS 的防火墙（安全组）放行 7000, 8080, 8443, 7500 端口。*

## 3. 部署客户端 (frpc)

在 NAS 上部署客户端，同样使用 Docker。

### 准备配置文件
在 `/volume1/docker/frp/` 下创建 `frpc.toml`：
```toml
serverAddr = "1.2.3.4" # VPS IP
serverPort = 7000
auth.method = "token"
auth.token = "mysecrettoken123" # 必须与服务端一致

# 示例 1：穿透 SSH
[[proxies]]
name = "ssh"
type = "tcp"
localIP = "127.0.0.1"
localPort = 22
remotePort = 6000 # 外网访问 1.2.3.4:6000 -> NAS:22

# 示例 2：穿透 Jellyfin (HTTP)
[[proxies]]
name = "jellyfin"
type = "http"
localIP = "192.168.1.100" # NAS 局域网 IP
localPort = 8096
customDomains = ["video.yourdomain.com"] # 必须绑定域名

# 示例 3：穿透 DSM (HTTPS)
[[proxies]]
name = "dsm"
type = "https"
localIP = "192.168.1.100"
localPort = 5001
customDomains = ["dsm.yourdomain.com"]
```

### 启动客户端 (Docker Compose)
在 NAS 上创建 `docker-compose.yml`：
```yaml
services:
  frpc:
    image: snowdreamtech/frpc
    container_name: frpc
    restart: always
    network_mode: host # 使用 host 模式，方便访问本机端口
    volumes:
      - /volume1/docker/frp/frpc.toml:/etc/frp/frpc.toml
```

## 4. 域名解析与访问

### TCP 穿透 (SSH)
直接访问 `1.2.3.4:6000`。

### HTTP/HTTPS 穿透
1.  **域名解析**：将 `video.yourdomain.com` 解析到 VPS IP (`1.2.3.4`)。
2.  **访问**：
    *   HTTP: `http://video.yourdomain.com:8080`
    *   HTTPS: `https://dsm.yourdomain.com:8443`

## 5. 进阶：去端口化 (Nginx 反代)

带着端口号访问（:8080）很不优雅。我们可以在 VPS 上安装 Nginx，把 80/443 端口转发给 FRP。

### VPS 上的 Nginx 配置
```nginx
server {
    listen 80;
    server_name *.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8080; # 转发给 frps 的 vhostHTTPPort
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```
这样，你就可以直接访问 `http://video.yourdomain.com` 了（无需 :8080）。

## 6. P2P 穿透 (xtcp)

FRP 还支持 P2P 模式（xtcp），流量不经过 VPS 中转，而是直接在客户端和访问端之间建立连接。这需要打洞成功率，适合大文件传输。

1.  **frpc.toml** 添加 `udp` 端口配置。
2.  **访问端** 也需要运行一个 frpc，配置 `role = "visitor"`。
3.  略显复杂，且成功率不如 Tailscale，通常**不推荐**作为主力，仅供极客折腾。
