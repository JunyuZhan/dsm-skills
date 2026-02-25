# Tailscale 深度实战：自建 DERP 与 Headscale

Tailscale 是目前体验最好的内网穿透工具，基于 WireGuard 协议，几乎零配置。但对于国内用户来说，官方的中转服务器（DERP）都在海外，导致延迟高、连接不稳定。

本指南将教你如何**自建 DERP 中转服务器**，实现满速直连；以及如何部署 **Headscale**，完全接管控制权。

## 1. 为什么需要自建 DERP？

Tailscale 的连接逻辑是：优先 P2P 直连（打洞），如果打洞失败，则走 DERP 中转。
*   **痛点**：国内网络环境复杂（NAT 类型多），打洞成功率有限。一旦走官方 DERP，数据要绕地球一圈，延迟 300ms+，速度几 KB/s。
*   **解法**：在阿里云/腾讯云（或有公网 IP 的 NAS）上自建 DERP。数据只在国内中转，延迟 < 30ms，带宽跑满。

## 2. 部署 DERP 服务器 (Docker)

你需要一个有公网 IP 的服务器（VPS），并绑定一个域名。

### 准备工作
1.  **域名**：例如 `derp.yourdomain.com`。
2.  **SSL 证书**：DERP 必须使用 HTTPS。你需要挂载证书文件。
3.  **端口**：默认需要 TCP 443 和 UDP 3478。

### docker-compose.yml
```yaml
services:
  derper:
    image: fredliang/derper:latest
    container_name: derper
    restart: always
    ports:
      - "4433:443" # 映射到 4433，避免占用 VPS 的 443
      - "3478:3478/udp"
    volumes:
      - /var/run/tailscale/tailscaled.sock:/var/run/tailscale/tailscaled.sock
      - ./certs:/app/certs # 存放证书
    environment:
      - DERP_DOMAIN=derp.yourdomain.com
      - DERP_CERT_MODE=manual # 手动证书模式
      - DERP_ADDR=:443
      - DERP_HTTP_PORT=-1 # 禁用 HTTP
      - DERP_VERIFY_CLIENTS=true # 仅允许验证的客户端（防白嫖）
```

### 配置 ACL
在 Tailscale 官方控制台的 **Access Controls** 中，添加你的 DERP 节点：

```json
"derpMap": {
  "OmitDefaultRegions": true, // 禁用官方节点（可选，建议禁用以强制走自建）
  "Regions": {
    "900": {
      "RegionID": 900,
      "RegionCode": "MY_DERP",
      "RegionName": "Aliyun Shanghai",
      "Nodes": [
        {
          "Name": "900a",
          "RegionID": 900,
          "HostName": "derp.yourdomain.com",
          "DERPPort": 4433 // 对应 Docker 映射端口
        }
      ]
    }
  }
}
```

## 3. Headscale：完全私有化控制平面

如果你担心 Tailscale 官方可能会收费，或者不想依赖它的登录系统，可以使用开源的 **Headscale** 替代官方控制服务器。

### 部署 Headscale (Docker)

```yaml
services:
  headscale:
    image: headscale/headscale:latest
    container_name: headscale
    volumes:
      - ./config:/etc/headscale
      - ./data:/var/lib/headscale
    ports:
      - 8080:8080
    command: headscale serve
    restart: unless-stopped
```

### 客户端接入
Headscale 需要客户端修改登录服务器地址。
*   **Windows**: 修改注册表或使用 Headscale 提供的脚本。
*   **macOS**: 安装配置描述文件。
*   **Linux (NAS)**:
    ```bash
    tailscale up --login-server http://your-headscale-ip:8080
    ```

## 4. Exit Node (出口节点)

想在星巴克用家里的宽带上网？或者在公司访问只有家里 IP 能访问的服务？
Tailscale 的 **Exit Node** 功能可以让你的 NAS 变成一个 VPN 网关。

1.  **NAS 端启用**：
    ```bash
    # Linux / DSM 7
    tailscale up --advertise-exit-node
    ```
2.  **控制台批准**：
    *   在 Machines 列表中找到 NAS。
    *   Edit route settings > 勾选 **Use as exit node**。
3.  **手机端使用**：
    *   打开 Tailscale App。
    *   点击 **Exit Node** > 选择你的 NAS。
    *   现在，你手机的所有流量都会先加密传输到家里的 NAS，再由 NAS 转发到互联网。你的公网 IP 变成了家里的 IP。

## 5. Subnet Router (子网路由)

这是 NAS 用户最常用的功能。让外网设备直接访问家里的局域网设备（如 192.168.1.x）。

1.  **NAS 端启用**：
    ```bash
    tailscale up --advertise-routes=192.168.1.0/24
    ```
2.  **控制台批准**：
    *   Edit route settings > 勾选 **192.168.1.0/24**。
3.  **效果**：
    *   在外网手机上，直接浏览器输入 `192.168.1.1` 就能打开家里路由器的后台。
    *   直接输入 `192.168.1.100:5000` 就能打开 DSM，不需要记 Tailscale 分配的 100.x.x.x IP。

## 6. 常见问题

### Q1: DERP 延迟依然很高？
*   检查 ACL 配置是否生效（在客户端运行 `tailscale netcheck`）。
*   检查 VPS 的防火墙是否放行了 TCP 和 UDP 端口。
*   HTTPS 证书必须有效，自签名证书可能会被客户端拒绝。

### Q2: 开启 Exit Node 后无法上网？
*   NAS 需要开启 IP 转发（IP Forwarding）。
*   DSM 7 默认已开启，但某些自定义 Linux 系统需要手动 `echo 1 > /proc/sys/net/ipv4/ip_forward`。
*   检查 NAS 的防火墙设置。
