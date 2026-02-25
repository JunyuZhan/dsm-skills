# Uptime Kuma：高颜值服务器监控面板

你是否有过这样的经历：
*   想看 Plex 挂没挂，还得打开网页确认。
*   博客挂了，直到朋友告诉你才知道。
*   SSL 证书过期了，导致网站无法访问。

**Uptime Kuma** 是一个开源、现代化的监控工具。它能像 PingDom 一样监控你的所有服务（HTTP/TCP/DNS/Docker），并在服务异常时通过 Telegram/微信/邮件通知你。而且它的界面非常漂亮，支持生成公开的“状态页 (Status Page)”。

## 1. 部署 (Docker Compose)

```yaml
version: '3.3'
services:
  uptime-kuma:
    image: louislam/uptime-kuma:1
    container_name: uptime-kuma
    volumes:
      - /volume1/docker/uptime-kuma/data:/app/data
      - /var/run/docker.sock:/var/run/docker.sock:ro # 如果需要监控 Docker 容器状态
    ports:
      - 3001:3001
    restart: always
```

*   **端口**：默认 `3001`。
*   **Docker Socket**：挂载后，可以直接监控宿主机的 Docker 容器（无需 Ping IP，直接读状态）。

## 2. 核心功能配置

### A. 添加监控项 (Monitor)
1.  点击左上角 **+ 创建监控项**。
2.  **类型**：
    *   **HTTP(s)**: 监控网站状态码（如 200 OK）。支持关键词检测（如页面必须包含 "Welcome"）。
    *   **TCP Port**: 监控端口通不通（如 MySQL 3306）。
    *   **Ping**: 监控服务器延迟。
    *   **Docker Container**: 监控容器是否 Running。
    *   **DNS**: 监控域名解析记录。
3.  **心跳间隔**：默认 60 秒。对于关键服务可设为 30 秒。
4.  **重试次数**：建议设为 3 次。防止网络抖动误报。

### B. 通知 (Notification)
支持 90+ 种通知方式。
*   **Telegram**: 最推荐。配置 Bot Token 和 Chat ID。
*   **Email (SMTP)**: 发邮件。
*   **Webhook**: 对接 Synology Chat（参考 [Chat Webhook 指南](../communication/chat-webhook.md)）。
*   **Bark**: iOS 推送。
*   **Server酱/PushDeer**: 微信推送。

### C. 状态页 (Status Page)
你可以创建一个公开的页面，展示系统健康度。
1.  点击右上角 **状态页** > **新的状态页**。
2.  **路径**：`/status/public`。
3.  **自定义**：
    *   **标题**：My NAS Status。
    *   **Logo**：上传你的头像。
    *   **监控项**：选择要公开展示的服务（隐藏敏感服务）。
4.  **绑定域名**：
    *   在反向代理中，将 `status.yourdomain.com` 指向 `http://localhost:3001`。
    *   现在你可以把这个链接发给朋友装逼了：“看，我的服务 SLA 是 99.99%”。

## 3. 进阶技巧

### A. 监控 SSL 证书过期
*   在添加 HTTP 监控项时，勾选 **Certificate Expiry Notification**。
*   设置 **Expiry Notification (Days)** 为 `7`。
*   证书过期前 7 天，你会收到轰炸式通知。再也不怕 Let's Encrypt 自动续期失败了。

### B. 维护模式 (Maintenance)
*   你要重启 NAS 或升级 Docker？
*   点击 **维护** > **创建维护计划**。
*   设置时间段（如 03:00 - 03:30）。
*   在此期间，监控暂停，**不会发送报警**。

### C. 监控内网服务 (Agent)
*   Uptime Kuma 部署在家里 NAS，想监控公司电脑？
*   **反向代理**：虽然 Uptime Kuma 没有 Agent 模式，但你可以配合 **Cloudflare Tunnel** 或 **FRP**，将公司服务暴露给 Kuma 访问。
*   **Push 监控**：
    *   选择监控类型为 **Push**。
    *   Kuma 会生成一个 URL：`https://kuma.domain.com/api/push/xxxx?status=up&msg=OK&ping=`
    *   在公司电脑上写个脚本，每分钟 `curl` 一下这个 URL。如果 Kuma 没收到心跳，就报警。这是监控无公网 IP 设备的绝技。

## 4. 常见问题

*   **Q: 历史数据占用大吗？**
    *   A: Kuma 使用 SQLite 存储，默认保存 1 年数据。对于家用环境，数据库通常只有几百 MB，无需担心。
*   **Q: 误报太多？**
    *   A: 增加 **重试次数** (Retries) 到 5 次，增加 **重试间隔** 到 60 秒。家用宽带偶尔断流是正常的。
