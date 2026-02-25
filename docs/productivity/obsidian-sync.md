# Obsidian + Synology Drive：打造终极私有知识库

[Obsidian](https://obsidian.md/) 是目前最强大的本地笔记软件，而 Synology Drive 是最强大的私有同步工具。两者结合，你可以拥有一个**数据完全掌控、多端实时同步、免费且无限容量**的知识库。

## 1. 为什么选择 Obsidian + NAS？

*   **数据安全**：笔记以纯 Markdown (`.md`) 文件存储在你的 NAS 上，而不是 Notion 的服务器里。
*   **多端同步**：在公司电脑写笔记，回家用 Mac 继续写，路上用手机查看。
*   **版本控制**：利用 Drive 的版本回溯功能，误删笔记也能一键找回。
*   **无订阅费**：相比 Obsidian 官方同步 ($8/月)，NAS 方案完全免费。

## 2. PC/Mac 同步方案 (最推荐)

这是最稳定、最高效的方案。

### 步骤
1.  **NAS 端**：在 Synology Drive 中创建一个文件夹，命名为 `Obsidian_Vault`。
2.  **电脑端**：安装 **Synology Drive Client**。
3.  **创建同步任务**：
    *   **NAS 路径**：`/My Drive/Obsidian_Vault`
    *   **本地路径**：`D:\Documents\Obsidian_Vault` (Windows) 或 `~/Documents/Obsidian_Vault` (Mac)。
    *   **模式**：双向同步。
4.  **Obsidian 设置**：打开 Obsidian，选择“打开本地仓库”，指向刚才的本地路径。

### 优势
*   **实时性**：修改文件的瞬间，Drive 就会同步到 NAS。
*   **离线可用**：没网也能写，联网后自动上传。
*   **按需同步**：如果在多台电脑上使用，可以开启“按需同步”节省空间（仅下载元数据，点击时下载内容）。

## 3. 移动端同步方案 (iOS/Android)

由于手机系统的沙盒限制，Drive App 无法直接将文件暴露给 Obsidian App（Android 部分可行，iOS 完全不行）。我们需要变通方案。

### 方案 A：Remotely Save 插件 (推荐)
利用 Obsidian 的第三方插件，通过 WebDAV 连接 NAS。

1.  **NAS 端**：安装 **WebDAV Server** 套件。
    *   启用 HTTP (5005) 或 HTTPS (5006)。
    *   确保你的 NAS 有公网 IP 或使用了内网穿透（Tailscale/Frp）。
2.  **Obsidian 端**：
    *   安装插件：**Remotely Save** (社区插件搜不到可手动安装或用 Brat)。
    *   **配置**：
        *   **远程服务**：WebDAV。
        *   **地址**：`https://your-nas-ip:5006/home/Drive/Obsidian_Vault` (注意路径)。
        *   **用户名/密码**：你的 NAS 账号。
    *   **同步计划**：设置为“每 5 分钟自动同步”或“启动时同步”。
3.  **效果**：Obsidian 会直接连接 NAS 的 WebDAV 服务拉取笔记，绕过 Drive App。

### 方案 B：Git (极客版)
如果你是开发者，可以使用 **Obsidian Git** 插件。
1.  **NAS 端**：搭建 Git Server 或 Gitea。
2.  **Obsidian 端**：安装 Obsidian Git 插件，配置远程仓库地址。
3.  **手机端**：使用 Working Copy (iOS) 或 MGit (Android) 同步仓库，并映射到 Obsidian。

### 方案 C：Synology Drive App (Android 仅限)
Android 系统的文件管理较开放。
1.  使用 Drive App 同步文件夹到手机本地存储。
2.  Obsidian 打开该本地文件夹。
3.  *注意：这种方式可能会有冲突，且耗电量较大。*

## 4. 进阶技巧

### A. 附件管理
Obsidian 默认将图片粘贴在根目录，导致文件夹乱糟糟。
*   **设置** > **文件与链接**。
*   **新附件位置**：选择“在当前文件夹下创建子文件夹”。
*   **子文件夹名称**：`assets` 或 `attachments`。
*   这样你的图片也会随着 Drive 同步，且保持整洁。

### B. 排除文件
Drive 可能会同步一些 Obsidian 的缓存文件，导致冲突。
*   在 Drive 客户端的**同步规则** > **文件过滤器**中，排除以下文件/文件夹：
    *   `.obsidian/workspace` (工作区状态，不同设备屏幕大小不同，不建议同步)
    *   `.obsidian/cache`
    *   `.trash` (废纸篓)

### C. 配合 Docker 部署 Web 版 Obsidian
如果你想在没有安装 Obsidian 的电脑上（比如网吧）写笔记，可以用 Docker 部署一个网页版。
*   **镜像**：`lscr.io/linuxserver/obsidian`。
*   **挂载**：将 `/volume1/homes/user/Drive/Obsidian_Vault` 挂载到容器内。
*   **访问**：浏览器访问 `http://nas-ip:3000`，这就是一个运行在浏览器里的完整 Obsidian。
