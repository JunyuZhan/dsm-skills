# Cloudflare Pages 部署指南

本指南将指导你如何将本项目免费部署到 Cloudflare Pages，生成一个全球加速的静态网站。

## 准备工作

1.  拥有一个 [Cloudflare](https://dash.cloudflare.com/) 账号。
2.  拥有一个 GitHub 账号，并已 Fork 或上传了本项目。

## 部署步骤 (中文界面)

1.  **登录控制台**：
    登录 Cloudflare 仪表板，在左侧菜单栏点击 **Workers 和 Pages**。

2.  **创建应用**：
    点击页面右上角的 **创建应用程序** 按钮。

3.  **连接 Git**：
    - 点击 **Pages** 标签页。
    - 点击 **连接到 Git** 按钮。
    - 如果是第一次使用，需要授权 Cloudflare 访问你的 GitHub 仓库。

4.  **选择仓库**：
    在列表中选择 `dsm-skills` 仓库，点击 **开始设置**。

5.  **配置构建环境** (关键步骤)：
    在“设置构建和部署”页面，进行如下配置：
    - **项目名称**：可以保持默认，或自定义（这将决定你的默认域名，如 `dsm-skills.pages.dev`）。
    - **生产分支**：默认为 `main`。
    - **框架预设**：在下拉菜单中选择 **MkDocs**。
    - **构建命令**：确认为 `mkdocs build` 或 `python3 -m mkdocs build`。
    - **构建输出目录**：确认为 `site`。

6.  **环境变量 (可选)**：
    通常不需要设置。本项目已包含 `requirements.txt` 和 `.python-version`，Cloudflare 会自动识别环境。

7.  **完成部署**：
    点击 **保存并部署**。Cloudflare 会自动拉取代码、安装依赖、构建网站并分发到全球节点。

## 访问网站

等待几分钟，当状态显示为“成功”时，点击顶部的链接（例如 `https://dsm-skills.pages.dev`）即可访问你的专属知识库。

## 自动更新

以后你只需要向 GitHub 仓库推送代码 (Git Push)，Cloudflare Pages 会自动触发重新构建，几分钟内你的网站内容就会自动更新。
