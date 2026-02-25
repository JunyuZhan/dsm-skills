# 知识管理与协同工作流

NAS 不仅仅是存电影的，它更是个人或团队的知识中枢。结合周边生态软件，可以构建一套无缝的“第二大脑”工作流。

## 1. Obsidian + Synology Drive：私有化双链笔记

Obsidian 是目前最火的双链笔记软件，但官方同步服务收费。利用 Synology Drive，我们可以免费实现全平台私有同步。

*   **电脑端**：
    1.  安装 **Synology Drive Client**。
    2.  将 NAS 上的 `/My Drive/ObsidianVault` 文件夹同步到本地。
    3.  用 Obsidian 打开本地文件夹。
    4.  所有修改会实时同步回 NAS。
*   **移动端 (iOS/Android)**：
    *   **方案 A (推荐)**：使用 **Remotely Save** 插件 + S3 服务（MinIO on NAS）或 WebDAV（Web Station）。
    *   **方案 B**：使用官方 **Synology Drive App** 的“同步任务”功能（仅限 Android，iOS 限制较多）。
    *   **iOS 完美方案**：使用 **Working Copy** (Git 客户端) + NAS 上的 Git Server。Obsidian 安装 Git 插件，实现版本控制同步。

## 2. Zotero + WebDAV：学术文献管理

科研党的福音。Zotero 官方免费空间很小，存不了几个 PDF。
1.  **开启 WebDAV**：在 **Web Station** 或安装 **WebDAV Server** 套件。
2.  **Zotero 设置**：
    *   打开首选项 > 同步。
    *   **文件同步**：选择 WebDAV。
    *   URL: `https://nas.yourdomain.com/zotero` (需先创建对应文件夹)。
    *   用户名/密码：NAS 账号。
3.  **效果**：文献元数据存 Zotero 官网（不占空间），PDF 附件存自家 NAS（无限空间）。

## 3. Git Server + Gitea：代码托管

如果你是开发者，不要只把代码存在 GitHub（私有库可能受限，大文件传输慢）。
*   **Git Server**：DSM 自带，适合简单的 SSH 协议推送。
*   **Gitea (Docker)**：强烈推荐。极度轻量化的 GitHub 替代品。
    *   支持 Pull Request、Issue 追踪、Wiki、CI/CD (配合 Drone)。
    *   **部署**：见 [Docker Compose 模板](../docker-containers/compose-templates.md)。
    *   **镜像**：还可以设置镜像仓库，自动同步 GitHub 上的开源项目到本地备份。

## 4. Mac Time Machine：无感备份

Mac 用户必备。
1.  **控制面板** > **文件服务** > **SMB** > **高级设置**。
2.  勾选 **启用 Bonjour Time Machine 广播**。
3.  点击 **设置 Time Machine 文件夹**，选择一个专用共享文件夹（建议设置配额，防止备份把硬盘塞满）。
4.  在 Mac 上：系统设置 > 通用 > Time Machine > 添加备份磁盘 > 选择 NAS。
5.  **技巧**：开启 **Power Nap**，Mac 即使休眠时也会自动备份。

## 5. Windows 文件历史记录 (File History)

Windows 版的 Time Machine。
1.  在 NAS 上创建一个共享文件夹 `WinBackup`。
2.  在 Windows 上：控制面板 > 文件历史记录 > 选择驱动器 > 网络位置 > 输入 `\\NAS_IP\WinBackup`。
3.  它会自动每小时备份桌面、文档、下载等文件夹的变动。

## 6. 稍后读 (Read It Later) 方案

不要把文章存在浏览器书签里吃灰。
*   **Wallabag (Docker)**：开源的 Pocket/Instapaper 替代品。
*   **浏览器插件**：一键保存网页内容到 NAS。
*   **手机 App**：离线阅读，支持抓取全文。
*   **联动**：可以通过 RSS 生成器把 Wallabag 的未读列表变成 RSS，推送到你的阅读器。

## 7. 团队协作：Synology Office

如果你受够了微信传文件改来改去版本混乱。
1.  安装 **Synology Drive** 和 **Synology Office** 套件。
2.  **实时协作**：像 Google Docs / 腾讯文档一样，多人同时编辑同一个 Excel/Word。
3.  **批注与评论**：在文档中@同事，分配任务。
4.  **历史版本**：随时回滚到昨天下午 3 点的版本。
5.  **加密分享**：生成一个带密码和有效期的链接发给客户。

## 8. 电子书库：Calibre-Web

管理你的 Kindle/iPad 书籍。
1.  **部署**：使用 Docker 部署 `linuxserver/calibre-web`。
2.  **挂载**：将 NAS 上的书籍文件夹挂载进去。
3.  **OPDS**：在手机上的阅读器（如 KyBook, Moon Reader）添加 OPDS 目录 `http://nas-ip:8083/opds`。
4.  **效果**：直接在手机 App 里浏览、搜索、下载 NAS 里的电子书。

## 9. 自动归档微信/Telegram 文件

*   **微信**：目前没有很好的直接对接方案（封闭生态）。建议使用 **WeChat 电脑版**，将下载目录设置为 Synology Drive 同步目录。
*   **Telegram**：可以使用 Docker 部署 `tdl` (Telegram Downloader) 或专门的 Bot，转发文件给 Bot，自动下载到 NAS 指定文件夹。

## 10. WebDAV 挂载为本地磁盘

让 NAS 变成电脑的一个盘符。
*   **Windows**：推荐 **RaiDrive** (免费版够用)。将 WebDAV 挂载为 Z: 盘，像操作本地文件一样操作 NAS 文件（支持缓存，速度快）。
*   **Mac**：**Mountain Duck** 或 **CloudMounter**。
*   **用途**：直接用 Photoshop 编辑 NAS 里的 PSD，无需下载再上传。
