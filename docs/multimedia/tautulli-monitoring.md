# Tautulli：Plex/Jellyfin 媒体服务器监控与统计

如果你是 Plex 或 Jellyfin 的重度用户，或者你是“公益服”的服主，你一定想知道：
*   最近谁在看什么？
*   哪个时间段播放量最高？
*   有没有人因为转码导致 CPU 爆炸？
*   当新电影上架时，自动发通知给群友。

**Tautulli** (针对 Plex) 和 **Jellystat** (针对 Jellyfin) 就是为此而生的监控分析工具。

## 1. Tautulli (Plex 伴侣)

### 部署 (Docker Compose)
```yaml
services:
  tautulli:
    image: tautulli/tautulli
    container_name: tautulli
    environment:
      - PUID=1026
      - PGID=100
      - TZ=Asia/Shanghai
    volumes:
      - /volume1/docker/tautulli/config:/config
    ports:
      - 8181:8181
    restart: unless-stopped
```

### 核心功能
1.  **实时监控**：在 Dashboard 上看到当前所有的播放流（用户、设备、IP、转码状态、带宽）。
2.  **历史统计**：查看过去 30 天的播放趋势，哪个用户看的时间最长，哪部电影最受欢迎。
3.  **通知系统 (Notifications)**：这是 Tautulli 最强大的功能。
    *   **触发器**：播放开始、播放暂停、新内容添加、服务器宕机。
    *   **通道**：支持 Telegram, Discord, Email, Webhook (企业微信/飞书)。
    *   **场景**：当 `Titanic` 添加到库中时，自动发一条 Telegram 给“电影分享群”。

### 脚本联动 (Scripts)
Tautulli 支持触发 Python/Shell 脚本。
*   **杀掉转码流**：如果发现有人在用 4K 转码播放（消耗大量 CPU），自动切断他的连接，并发送警告消息“请使用原画播放”。

## 2. Jellystat (Jellyfin 伴侣)

Jellyfin 原生没有 Tautulli 那么完善的第三方生态，但 **Jellystat** 是一个很好的替代品。

### 部署 (Docker Compose)
Jellystat 需要 Postgres 数据库。

```yaml
services:
  jellystat:
    image: cyfershepard/jellystat
    container_name: jellystat
    environment:
      - POSTGRES_USER=jellystat
      - POSTGRES_PASSWORD=jellystat
      - POSTGRES_DB=jellystat
      - POSTGRES_HOST=jellystat-db
    ports:
      - 3000:3000
    depends_on:
      - jellystat-db
    restart: unless-stopped

  jellystat-db:
    image: postgres:15
    environment:
      - POSTGRES_USER=jellystat
      - POSTGRES_PASSWORD=jellystat
      - POSTGRES_DB=jellystat
    volumes:
      - /volume1/docker/jellystat/db:/var/lib/postgresql/data
    restart: unless-stopped
```

### 功能
*   **同步历史**：连接 Jellyfin 后，它会同步所有的播放历史。
*   **统计图表**：展示播放量、用户活跃度。
*   虽然功能不如 Tautulli 丰富（缺少强大的通知系统），但对于数据统计来说已经足够。

## 3. 进阶：Varys (iOS App)

如果你是 iOS 用户，**Varys** 是一款非常精美的 Plex/Emby/Jellyfin 监控 App。
*   它可以连接 Tautulli，直接在手机小组件 (Widget) 上显示当前的播放人数和海报。
*   随时随地查看服务器状态。
