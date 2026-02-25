# 自托管替代方案汇总

NAS 的终极形态是“去中心化”。我们可以用开源软件替代许多昂贵的商业服务，将数据掌握在自己手中。

## 1. 笔记与知识库 (替代 Notion/Evernote)

### 方案 A: Outline
*   **特点**：界面极其接近 Notion，支持协同编辑、Markdown、S3 存储。
*   **优点**：颜值高，体验流畅。
*   **缺点**：部署稍复杂（需要 Postgres + Redis + OIDC 认证）。
*   **镜像**：`outlinewiki/outline`

### 方案 B: AppFlowy
*   **特点**：基于 Rust + Flutter，号称 Notion 的开源替代品。
*   **优点**：原生 App 体验，支持离线模式，支持看板、日历。
*   **镜像**：`appflowy/appflowy-cloud`

### 方案 C: Joplin (WebDAV)
*   **特点**：老牌笔记软件，E2EE 端到端加密。
*   **方式**：无需部署服务端，只需在 NAS 开启 WebDAV，客户端直接连接同步。

## 2. 网盘与文件同步 (替代 Google Drive/Dropbox)

### 方案 A: Nextcloud
*   **特点**：功能最全的私有云。支持文件、日历、联系人、Office 在线编辑、视频通话。
*   **优点**：生态极其丰富，插件多。
*   **缺点**：PHP 架构，文件多时性能稍慢。
*   **镜像**：`nextcloud` (建议配合 Redis 缓存优化)

### 方案 B: Seafile
*   **特点**：专注于文件同步，性能极快。
*   **优点**：C 语言编写，同步数万个小文件毫无压力，支持断点续传。
*   **缺点**：文件在服务器端是分块存储的（非直接可见文件），必须通过客户端访问。
*   **镜像**：`seafileltd/seafile-mc`

### 方案 C: Synology Drive (原生)
*   **特点**：官方出品，最稳。
*   **优点**：无需折腾，集成度高，支持按需同步（不占本地空间）。

## 3. 相册备份 (替代 Google Photos)

### 方案 A: Immich
*   **特点**：目前最火的 Google Photos 替代品。
*   **优点**：界面几乎 1:1 复刻 Google Photos，支持时间轴、地图模式、人脸识别、CLIP 语义搜索（搜“猫”能把所有猫找出来）。
*   **缺点**：开发迭代极快，架构变化大，升级需谨慎。
*   **镜像**：`ghcr.io/immich-app/immich-server`

### 方案 B: PhotoPrism
*   **特点**：基于 Go 语言，AI 识别能力强。
*   **优点**：单容器部署，支持 Live Photo，不修改原文件。
*   **镜像**：`photoprism/photoprism`

## 4. 稍后读与书签 (替代 Pocket/Raindrop)

### 方案 A: Wallabag
*   **特点**：抓取网页正文，去除广告，离线阅读。
*   **镜像**：`wallabag/wallabag`

### 方案 B: Linkding
*   **特点**：极简的书签管理器。
*   **优点**：资源占用极低，标签管理系统好用。
*   **镜像**：`sissbruecker/linkding`

## 5. 密码管理 (替代 1Password/LastPass)

*   **Vaultwarden**: 见 [自建密码库指南](vaultwarden.md)。

## 6. 代码托管 (替代 GitHub)

*   **Gitea / Forgejo**: 轻量级，Go 语言编写。
*   **GitLab CE**: 功能最强，但极吃内存（建议 8G 内存以上 NAS 尝试）。

## 7. 办公套件 (替代 Google Docs)

### 方案 A: CryptPad
*   **特点**：端到端加密的实时协作办公套件（文档、表格、PPT）。
*   **镜像**：`prominence/cryptpad`

### 方案 B: OnlyOffice
*   **特点**：与 Nextcloud/Seafile 集成最佳，兼容 Office 格式完美。
*   **镜像**：`onlyoffice/documentserver`

## 8. 音乐流媒体 (替代 Spotify/Apple Music)

### 方案 A: Navidrome
*   **特点**：轻量级音乐服务器，兼容 Subsonic API。
*   **优点**：可以配合众多第三方 App (如音流, Substreamer) 使用，支持转码。
*   **镜像**：`deluan/navidrome`

### 方案 B: Plexamp
*   **特点**：如果你是 Plex 用户，Plexamp 是目前体验最好的音乐 App 之一（需 Plex Pass）。
