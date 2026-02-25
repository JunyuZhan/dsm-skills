# 下载工具深度调优 (qBittorrent/Transmission)

NAS 最核心的功能之一就是下载。但很多人的下载速度跑不满带宽，或者下载时导致 NAS 极其卡顿。这通常是配置不当导致的。

## 1. 核心性能参数调优

### A. 磁盘缓存 (Disk Cache) —— 救命设置
下载工具在高速下载时会产生大量的随机写入。如果直接写入机械硬盘，会导致 **I/O Wait** 飙升，整个 NAS 卡死。

*   **qBittorrent**:
    *   **设置**：Tools > Options > Advanced > **Disk write cache size**。
    *   **建议值**：
        *   8GB 内存以下：设置 `512MiB` 或 `1024MiB`。
        *   16GB 内存以上：设置 `4096MiB`。
    *   **有效期**：设置 `Disk cache expiry interval` 为 `600s` (10分钟)，让数据在内存里多待会儿。
*   **Transmission**:
    *   需要修改 `settings.json` (停止容器后修改)。
    *   `"cache-size-mb": 512`。

### B. 连接数限制 (Connection Limits)
不要迷信“连接数越多越好”。过多的连接数会撑爆路由器的 NAT 表，导致断网。

*   **全局最大连接数**：建议设置为 `500` - `1000`。
*   **单任务最大连接数**：建议设置为 `50` - `100`。
*   **上传槽 (Upload Slots)**：如果你是 PT 用户，不要设为无限。过多的上传槽会导致每个 peer 分到的带宽太小，反而被对方抛弃。建议每 10Mbps 上行带宽设置 2-3 个上传槽。

## 2. 网络连接性 (Connectivity)

### A. 监听端口 (Listening Port)
BT 下载的核心是“我为人人，人人为我”。如果你是**可连接 (Connectable)** 状态，下载速度会快很多。

*   **检查**：在 WebUI 底部通常有个绿灯/黄灯图标。如果是黄灯/红灯，说明端口不通。
*   **设置**：
    1.  **固定端口**：在设置中固定一个监听端口 (例如 `56789`)，**取消勾选**“每次启动使用随机端口”。
    2.  **路由器映射**：在路由器上将该端口 (TCP+UDP) 映射到 NAS IP。
    3.  **Docker 映射**：确保 Docker Compose 中把这个端口映射出来了：
        ```yaml
        ports:
          - "56789:56789"
          - "56789:56789/udp"
        ```

### B. Tracker 列表优化 (针对 BT)
对于公网 BT 下载 (非 PT)，添加优质的 Tracker 可以显著增加 Peer 数量。
*   **自动更新**：qBittorrent 支持自动更新 Tracker 列表。
*   **地址推荐**：`https://github.com/ngosang/trackerslist`。

## 3. 文件处理与保种

### A. 预分配磁盘空间 (Pre-allocate disk space)
*   **建议**：**开启**。
*   **作用**：下载开始前就在硬盘上占好位置。
    *   **优点**：防止文件碎片化 (Fragmentation)。
    *   **缺点**：开始下载时会卡顿几秒钟。

### B. 校验 (Re-check) 优化
*   **qBittorrent 4.4+ 坑点**：新版 qBittorrent 使用 libtorrent v2，对内存占用极高，且校验文件时容易卡死。
*   **建议**：如果是老机器，建议使用 `4.3.9` 版本或者 `4.5.x` 以上版本 (修复了部分问题)。

### C. 辅种与硬链接 (Hard Link)
如果你同时玩多个 PT 站，或者需要把下载的文件整理到媒体库。
*   **不要复制**：复制会占用双倍空间。
*   **使用硬链接**：利用 **Nastools** 或 **MoviePilot** 进行硬链接整理。
    *   **前提**：下载目录和媒体库目录必须在**同一个存储空间 (Volume)** 下。
    *   **Docker 映射**：必须映射共同的父级目录。
        *   **错误**：
            *   qbit: `/downloads:/downloads`
            *   plex: `/movies:/movies`
        *   **正确**：
            *   qbit: `/volume1/data:/data`
            *   plex: `/volume1/data:/data`
            *   **下载路径**：`/data/downloads`
            *   **媒体路径**：`/data/movies`

## 4. 安全设置

### A. WebUI 安全
*   **CSRF 保护**：默认开启。如果你通过反向代理访问并遇到 `Unauthorized` 错误，可以在设置中取消勾选 "Enable CSRF protection" (仅限内网环境，公网务必开启并配置好反向代理头)。
*   **Host Header 验证**：如果你用域名访问，需在设置中把你的域名加入白名单，或者取消勾选 "Enable Host header validation"。

### B. 匿名模式
*   **代理服务器**：如果你通过代理下载，务必开启“匿名模式”，防止真实 IP 泄露。
