# 学生与科研人员：构建第二大脑与知识库

对于研究生、博士生和学术工作者来说，文献管理、笔记整理和数据安全是核心需求。群晖 NAS 不仅是一个大容量 U 盘，更是您的私人数字图书馆和知识库。

本指南将深入讲解 **Zotero + ZotFile + WebDAV** 的终极文献流，以及基于 **Git** 的 Obsidian 版本控制方案。

## 1. 文献管理终极方案：Zotero + ZotFile + WebDAV

Zotero 官方云空间很小，且大文件同步慢。利用 NAS，我们可以实现“元数据云同步 + 附件 NAS 存储”的完美组合。

### 1.1 NAS 端准备 (WebDAV)
1.  在套件中心安装 **WebDAV Server**。
2.  启用 HTTPS (默认端口 5006)。
3.  在 File Station 创建文件夹 `/volume1/Zotero_Attachments`。

### 1.2 Zotero 客户端设置 (PC/Mac)
1.  **数据同步**：`首选项` > `同步` > 登录 Zotero 账号（仅同步条目信息，不勾选“同步附件”）。
2.  **文件同步 (WebDAV)**：
    *   勾选“使用 WebDAV 同步附件”。
    *   **URL**: `https://nas-ddns:5006/Zotero_Attachments/`
    *   **验证**：输入 NAS 账号密码，点击验证服务器。

### 1.3 ZotFile 插件自动化 (关键步骤)
仅仅用 WebDAV 还是不够的，我们需要 ZotFile 把下载的 `ASDFG123.pdf` 自动重命名为 `2023 - Author - Title.pdf` 并移动到 NAS 挂载目录。

1.  安装 ZotFile 插件。
2.  **设置监控目录**：将浏览器下载目录设为监控源。
3.  **设置位置**：
    *   勾选 `Custom Location`。
    *   指向 NAS 的 SMB 挂载路径（例如 `Z:\Zotero_Attachments` 或 `/Volumes/Zotero_Attachments`）。
4.  **重命名规则**：`{%y - }{%a - }{%t}` (例如：2024 - Smith - Deep Learning.pdf)。
5.  **iPad 阅读**：
    *   Zotero iOS App 现已支持 WebDAV。在设置中填入相同的 WebDAV 地址，即可在 iPad 上直接批注 PDF，修改会自动回传到 NAS。

## 2. 笔记与知识库：Obsidian + Git (版本控制)

相比于 iCloud 或 Remotely Save，使用 **Git** 同步笔记最安全、最可靠，且拥有完整的历史回溯能力。

### 2.1 NAS 端：Gitea 仓库
1.  在 NAS 上部署 Gitea (参考[程序员指南](programmer-devops.md))。
2.  创建一个私有仓库 `my-knowledge-base`。
3.  获取仓库的 HTTP 克隆地址：`http://nas-ip:3000/user/my-knowledge-base.git`。

### 2.2 电脑端：Obsidian Git 插件
1.  安装 **Obsidian Git** 社区插件。
2.  初始化仓库：
    *   如果已有笔记：`git init` -> `git remote add origin <url>` -> `git push`。
    *   如果新笔记：直接 `git clone` 下来打开。
3.  **插件设置**：
    *   **Backup interval**: `10` (每 10 分钟自动备份)。
    *   **Auto pull interval**: `10` (每 10 分钟自动拉取)。
4.  **优势**：
    *   写错内容删除了？去 Gitea 网页端看 Commits，一键找回。
    *   多端冲突？Git 会提示 Merge，不会悄无声息地覆盖文件。

## 3. 电子书服务器：Calibre-web + OPDS

将 NAS 变成您的私人 Kindle 书城。

### 3.1 部署 Calibre-web
```yaml
version: "2.1"
services:
  calibre-web:
    image: lscr.io/linuxserver/calibre-web:latest
    container_name: calibre-web
    environment:
      - PUID=1026
      - PGID=100
      - DOCKER_MODS=linuxserver/mods:universal-calibre # 启用电子书格式转换
    volumes:
      - /volume1/docker/calibre-web/config:/config
      - /volume1/books:/books # Calibre 库路径
    ports:
      - 8083:8083
    restart: unless-stopped
```

### 3.2 移动端阅读 (OPDS)
不要在手机浏览器里下载书。使用支持 OPDS 的阅读器。
1.  **iOS**: KyBook 3 或 Mapleread。
2.  **Android**: Moon+ Reader (静读天下)。
3.  **添加目录**：选择 OPDS Catalog，输入 `http://nas-ip:8083/opds`。
4.  **效果**：像浏览 App Store 一样浏览您的藏书，点击封面即刻下载阅读。

## 4. 实验室数据协作：Project Folder

### 4.1 权限隔离
实验室可能有 3 个课题组，数据不能混用。
*   创建群组：`Group_ProjectA`, `Group_ProjectB`。
*   共享文件夹：`/Data/ProjectA` (仅 Group_ProjectA 可读写)。

### 4.2 大文件传输 (Presto/File Station)
*   **场景**：要把 50GB 的测序数据发给合作方。
*   **File Station**：创建共享链接，设置有效期。
*   **速度慢？**：让对方安装 **Synology Drive Client**，登录您的 NAS（创建一个只读账号），通过 Drive 协议下载，通常比网页下载更稳定，支持断点续传。

---
**总结**：通过 Zotero + WebDAV 解决文献同步，Git 守护笔记安全，Calibre-web 管理电子书，您将拥有一个永不丢失、随时调用的**第二大脑**。
