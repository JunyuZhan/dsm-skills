# Docker 必备容器推荐 (Top 20)

这里精选了 20 个最适合在 Synology NAS 上运行的 Docker 容器，让你的 NAS 变身全能服务器。

## 管理与监控类

### 1. Portainer
- **用途**：图形化 Docker 管理工具。
- **推荐理由**：比 Synology 自带的 Container Manager 功能更强大，支持 Stack (Compose)、Image 管理、Network 管理等。
- **镜像**：`portainer/portainer-ce`

### 2. Watchtower
- **用途**：自动更新 Docker 容器。
- **推荐理由**：可以设置每天凌晨检查并自动拉取最新镜像重启容器。**注意：生产环境慎用，可能导致服务挂掉。**
- **镜像**：`containrrr/watchtower`

### 3. Uptime Kuma
- **用途**：优雅的自托管监控工具。
- **推荐理由**：监控你的网站、API、Docker 容器是否在线，支持 Telegram/微信推送报警。界面非常漂亮。
- **镜像**：`louislam/uptime-kuma`

### 4. Dozzle
- **用途**：实时日志查看器。
- **推荐理由**：轻量级，可以在网页上实时查看所有容器的 stdout 日志，无需 ssh 进后台。
- **镜像**：`amir20/dozzle`

### 5. Flame / Homarr / Sun-Panel
- **用途**：自托管导航页。
- **推荐理由**：把所有 Docker 服务（Jellyfin, Portainer, NAS）的入口汇总到一个页面，方便记忆和访问。
- **镜像**：`pawelmalak/flame` 或 `ajnart/homarr`

## 媒体与娱乐类

### 6. Jellyfin / Emby / Plex
- **用途**：媒体服务器三巨头。
- **推荐理由**：Jellyfin 完全免费开源，支持硬解。Emby/Plex 体验更好但部分功能收费。
- **镜像**：`nyanmisaka/jellyfin` (特供版，驱动支持更好)
- **进阶调优**：详见 [媒体服务器深度调优 (Plex/Emby)](media-server-tuning.md)。

### 7. Nastools / MoviePilot
- **用途**：自动化观影工具。
- **推荐理由**：集成了 资源搜索 + 下载器 + 刮削 + 消息推送。虽然配置复杂，但一旦配好就是全自动追剧神器。
- **镜像**：`nastools/nastools` (注意：原版已删库，需找分支版本)

### 8. Transmission / Qbittorrent
- **用途**：BT/PT 下载器。
- **推荐理由**：NAS 必备。配合 Web UI 可以远程管理下载任务。
- **镜像**：`linuxserver/transmission` 或 `linuxserver/qbittorrent`
- **进阶调优**：详见 [下载工具深度调优 (QB/TR)](download-tuning.md)。

### 9. ChineseSubFinder
- **用途**：中文字幕自动下载器。
- **推荐理由**：基于 AI 算法自动匹配视频文件下载字幕，解决生肉问题。
- **镜像**：`allanpk716/chinesesubfinder`

### 10. Audiobookshelf
- **用途**：有声书服务器。
- **推荐理由**：专门为有声书和播客设计，支持断点续听、倍速播放、元数据刮削。
- **镜像**：`advplyr/audiobookshelf`

## 实用工具类

### 11. Bitwarden (Vaultwarden)
- **用途**：密码管理器。
- **推荐理由**：基于 Rust 重写的 Bitwarden 服务端，轻量且功能完整。再也不用担心 LastPass 数据泄露了。
- **镜像**：`vaultwarden/server`
- **进阶调优**：详见 [Vaultwarden 安全加固](vaultwarden-security.md)。

### 12. Home Assistant
- **用途**：智能家居中枢。
- **推荐理由**：接入小米、HomeKit、涂鸦等各种设备，实现极其复杂的自动化场景。
- **镜像**：`homeassistant/home-assistant`

### 13. Alist
- **用途**：网盘挂载神器。
- **推荐理由**：支持挂载阿里云盘、百度网盘、OneDrive 等几十种网盘，并转换成 WebDAV 提供给本地播放器使用。
- **镜像**：`xhofe/alist`

### 14. Qinglong (青龙面板)
- **用途**：定时任务管理平台。
- **推荐理由**：主要用于运行各种签到脚本（京东、淘宝等），支持 Python/Node.js/Shell。
- **镜像**：`whyour/qinglong`

### 15. Calibre-Web
- **用途**：电子书库。
- **推荐理由**：管理你的 Kindle/EPUB 电子书，支持网页阅读和推送到 Kindle。
- **镜像**：`linuxserver/calibre-web`

### 16. Memos
- **用途**：轻量级笔记服务。
- **推荐理由**：类似 Twitter/微博 的界面，随手记录想法，支持 Markdown。
- **镜像**：`neosmemo/memos`

### 17. FreshRSS
- **用途**：RSS 阅读器。
- **推荐理由**：自建 RSS 服务，订阅你关注的博客和新闻，没有算法推荐，只有你关心的内容。
- **镜像**：`linuxserver/freshrss`

### 18. Gitea
- **用途**：轻量级 Git 代码托管。
- **推荐理由**：比 GitLab 轻量得多，适合个人或小团队托管代码。
- **镜像**：`gitea/gitea`

### 19. ChatGPT-Next-Web
- **用途**：ChatGPT 网页客户端。
- **推荐理由**：如果你有 API Key，可以部署这个美观的客户端，支持多端同步和预设 Prompt。
- **镜像**：`yidadaa/chatgpt-next-web`

### 20. AdGuard Home
- **用途**：全网去广告 DNS。
- **推荐理由**：拦截视频广告和跟踪器，保护隐私，还能加速 DNS 解析。
- **镜像**：`adguard/adguardhome`
- **进阶调优**：详见 [AdGuard Home 深度调优](adguard-home-tuning.md)。
