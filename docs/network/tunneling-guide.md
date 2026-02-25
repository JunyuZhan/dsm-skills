# 内网穿透与异地组网指南

没有公网 IP？端口转发太麻烦？想在公司直接访问家里的 NAS 就像在局域网一样？这里有三种终极解决方案。

## 方案 1：Tailscale (最推荐，零配置)

Tailscale 基于 WireGuard 协议，它能把你的所有设备（NAS、手机、公司电脑）组成一个虚拟局域网。

### 1. 部署
*   **套件版**：在套件中心搜索 Tailscale 安装。
*   **Docker 版**（推荐，更灵活）：
    ```yaml
    services:
      tailscale:
        image: tailscale/tailscale
        container_name: tailscale
        network_mode: host
        cap_add:
          - NET_ADMIN
          - NET_RAW
        environment:
          - TS_AUTHKEY=tskey-auth-xxxx # 在官网申请
          - TS_ROUTES=192.168.1.0/24 # 暴露局域网网段
        volumes:
          - /volume1/docker/tailscale/state:/var/lib/tailscale
          - /dev/net/tun:/dev/net/tun
        restart: unless-stopped
    ```

### 2. 核心功能：Subnet Router (子网路由)
这是 Tailscale 最强大的功能。你只需在 NAS 上安装 Tailscale，你在外网的手机不仅能访问 NAS，还能访问**家里局域网的所有设备**（如路由器后台、打印机、智能家居网关）。
*   **启用**：在启动命令中添加 `--advertise-routes=192.168.1.0/24`（Docker 版见上文 `TS_ROUTES`）。
*   **批准**：登录 Tailscale 网页控制台，在 Machines 中找到 NAS，点击 Edit route settings，开启路由。

### 3. 核心功能：MagicDNS
*   Tailscale 会自动为每台设备分配一个域名（如 `nas.tail8888.ts.net`）。
*   你不再需要记 IP，直接用域名访问。

### 4. 进阶：自建 DERP 中转服务器
*   Tailscale 官方中转服务器在海外，高峰期可能慢。
*   如果你有一台国内云服务器（阿里云/腾讯云），可以自建 DERP，实现满速直连。

## 方案 2：Cloudflare Tunnel (完全免费，Web 服务神器)

如果你想把 NAS 上的 Web 服务（如 Jellyfin, Blog, Gitea）暴露给公网，但没有公网 IP，Cloudflare Tunnel 是最佳选择。

### 1. 原理
NAS 主动向 Cloudflare 边缘节点建立一条加密隧道。用户访问你的域名 -> Cloudflare -> 隧道 -> NAS。**无需在路由器开任何端口。**

### 2. 部署
1.  登录 Cloudflare Dashboard > Zero Trust > Networks > Tunnels。
2.  Create a tunnel，选择 Docker 部署，复制那是 token。
3.  在 NAS 上运行：
    ```bash
    docker run -d --restart always --name cloudflared \
      cloudflare/cloudflared:latest tunnel --no-autoupdate run --token <你的TOKEN>
    ```

### 3. 配置 Public Hostname
1.  在 Cloudflare Tunnel 页面，点击 Configure > Public Hostname。
2.  **Add a public hostname**：
    *   **Subdomain**: `video` (例如 video.yourdomain.com)
    *   **Service**: `http://192.168.1.2:8096` (NAS IP 和 Jellyfin 端口)
3.  保存。现在全球都可以通过 `https://video.yourdomain.com` 访问你的 Jellyfin 了。

### 4. 安全保护 (Zero Trust)
*   **Access Policy**：你可以设置规则，例如“只允许在这个邮箱列表里的人访问”，或者“访问时需要输入 PIN 码”。
*   这对暴露 SSH 或管理后台非常有用。

## 方案 3：ZeroTier (老牌经典)

与 Tailscale 类似，但去中心化程度更高（但也意味着打洞失败率略高）。

### 1. 部署
*   **Docker**：
    ```yaml
    services:
      zerotier:
        image: zerotier/zerotier-synology:latest
        container_name: zerotier
        network_mode: host
        cap_add:
          - NET_ADMIN
          - SYS_ADMIN
        devices:
          - /dev/net/tun
        volumes:
          - /volume1/docker/zerotier:/var/lib/zerotier-one
        restart: always
    ```

### 2. 加入网络
1.  在 ZeroTier 官网创建 Network，获得 Network ID。
2.  SSH 进入 NAS：`docker exec -it zerotier zerotier-cli join <NETWORK_ID>`
3.  在官网勾选 Auth，批准加入。

### 3. 路由配置
*   在官网 Network 设置中，添加 Managed Routes：`192.168.1.0/24` via `NAS_ZeroTier_IP`。
*   这样也能实现类似 Tailscale 的子网访问。

## 总结

| 方案 | 适用场景 | 优点 | 缺点 |
| :--- | :--- | :--- | :--- |
| **Tailscale** | **首选**。异地组网，访问局域网设备。 | 配置极简，打洞成功率高，Subnet Router 强大。 | 官方中转在海外（可自建 DERP 解决）。 |
| **CF Tunnel** | **Web 服务暴露**。建站，分享给他人。 | 无需公网 IP，自带 HTTPS，Cloudflare 防护，80/443 端口可用。 | 不适合传输大文件（视频流可能被限制），不适合非 HTTP 协议。 |
| **ZeroTier** | 备选。多一种组网方式。 | 去中心化，老牌。 | 客户端有时候比较抽风，打洞不如 Tailscale 稳。 |
