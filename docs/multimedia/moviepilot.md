# MoviePilot：自动化追剧新标杆

如果觉得 Radarr/Sonarr 的配置太繁琐，或者英文界面劝退，那么 **MoviePilot** 是你的救星。它是专为中文环境打造的自动化媒体管理工具，整合了搜索、下载、刮削、整理、播放通知等所有功能，而且配置逻辑更符合国人习惯。

## 为什么选择 MoviePilot？

*   **一站式**：不再需要分别部署 Radarr, Sonarr, Bazarr, Prowlarr 等一堆容器，一个 MoviePilot 全搞定。
*   **中文优化**：完美支持中文影视剧命名，刮削准确率远超国外软件。
*   **微信/Telegram 推送**：内置消息推送，下载完成直接发通知。
*   **插件系统**：支持自动签到、字幕下载、豆瓣同步等扩展功能。

## 1. 准备工作

在部署之前，你需要准备以下东西：

1.  **TMDB API Key**：去 [The Movie Database](https://www.themoviedb.org/) 申请一个 API Key（用于刮削海报和信息）。
2.  **CookieCloud (可选)**：如果你有多个 PT 站账号，建议部署 CookieCloud 服务端，或者使用浏览器插件导出站点 Cookie。
3.  **下载器**：安装好 qBittorrent 或 Transmission。

## 2. 部署 MoviePilot (Docker Compose)

创建一个 `docker-compose.yml` 文件：

```yaml
services:
  moviepilot:
    image: jxxghp/moviepilot:latest
    container_name: moviepilot
    hostname: moviepilot
    ports:
      - 3000:3000
    volumes:
      - /volume1/docker/moviepilot/config:/config
      - /volume1/docker/moviepilot/core:/moviepilot/.cache/ms-playwright
      - /volume1/video:/video  # 媒体库目录
      - /volume1/downloads:/downloads # 下载目录
    environment:
      - NGINX_PORT=3000
      - PORT=3000
      - PUID=1026
      - PGID=100
      - UMASK=022
      - TZ=Asia/Shanghai
      - SUPERUSER=admin # 初始管理员用户名
      - SUPERUSER_PASSWORD=password # 初始管理员密码（首次启动后请修改）
      - API_TOKEN=moviepilot # API 密钥，用于与其他服务交互
      - TMDB_API_KEY=your_tmdb_api_key # 必填
      - DOWNLOAD_PATH=/downloads # 下载器内部路径
      - DOWNLOAD_MOVIE_PATH=/video/movies # 电影整理目标路径
      - DOWNLOAD_TV_PATH=/video/tv # 电视剧整理目标路径
      - DOWNLOAD_CATEGORY=false # 是否自动分类下载
      - SCRAP_METADATA=true # 是否刮削元数据
      - SCRAP_FOLLOW_TMDB=true # 是否以 TMDB 为准
    restart: always
```

### 关键点解析
*   **路径映射**：`DOWNLOAD_PATH` 必须与下载器（qBittorrent）看到的路径一致。如果 qBittorrent 也是 Docker 部署，建议它们挂载相同的宿主机目录。
*   **硬链接**：为了实现秒级整理且不占用双倍空间，下载目录和媒体库目录必须在同一个磁盘卷（Volume）下。

## 3. 核心配置流程

容器启动后，访问 `http://nas-ip:3000`，使用初始账号登录。

### 3.1 站点配置 (Indexer)
MoviePilot 需要知道去哪里搜索种子。
1.  **设置** > **站点管理**。
2.  **新增**：选择你的 PT/BT 站点。
3.  **认证**：通常需要填入 `Cookie` 或 `Passkey`。
    *   *技巧*：使用 CookieCloud 插件可以一键同步所有站点 Cookie。

### 3.2 下载器配置 (Downloader)
1.  **设置** > **下载器**。
2.  选择 **qBittorrent**。
3.  填入 IP、端口、用户名、密码。
4.  **保存路径**：填入 `/downloads`（这是 qBittorrent 容器内部看到的路径）。

### 3.3 媒体库配置 (Media Server)
1.  **设置** > **媒体服务器**。
2.  选择 **Emby** 或 **Jellyfin** 或 **Plex**。
3.  填入服务器地址和 API Key。
4.  这样 MoviePilot 整理完文件后，会自动通知媒体服务器刷新库。

## 4. 进阶玩法：订阅与规则

### 订阅规则 (Filter)
你可以设置过滤规则，只下载高质量资源。
*   **分辨率**：只选 `4K` 或 `1080p`。
*   **编码**：优先 `H.265`。
*   **排除**：排除 `HDR`（如果你的设备不支持）。

### 自动订阅 (Subscription)
*   **豆瓣同步**：在插件中心安装“豆瓣同步”插件。你在豆瓣标记“想看”，MoviePilot 就会自动搜索并下载。
*   **榜单订阅**：订阅热门电影榜单，自动下载高分新片。

## 5. 常见问题 (FAQ)

### Q1: 整理失败，提示跨盘移动？
**原因**：Docker 容器认为下载目录和媒体库目录在不同的文件系统中，无法进行硬链接。
**解决**：确保 `docker-compose.yml` 中映射的宿主机路径是同一个父目录。例如：
*   宿主机：`/volume1/media/downloads` 和 `/volume1/media/movies`
*   容器映射：`/volume1/media:/media`
*   这样容器内都在 `/media` 下，属于同个文件系统。

### Q2: 刮削不到图片？
**原因**：TMDB API 被墙。
**解决**：
1.  在 **设置** > **系统** > **网络** 中配置 HTTP 代理（指向你的旁路由或 Clash）。
2.  或者修改 `/etc/hosts`，指定 TMDB 的可用 IP。

### Q3: 微信推送怎么配？
**方法**：
1.  申请一个“企业微信”账号（个人也能申请）。
2.  创建一个应用。
3.  在 MoviePilot **设置** > **消息通知** > **企业微信** 中填入 `CorpID`, `AgentID`, `Secret`。
4.  这是目前最稳定、免费的推送方式。
