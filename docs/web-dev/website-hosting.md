# Web Station 建站与开发指南

Web Station 让你的 NAS 成为一台轻量级的 Web 服务器，适合托管个人博客、静态网站或测试代码。

## 1. 后端环境配置 (Nginx + PHP)
- **Nginx**：Synology 默认使用 Nginx 作为 Web 服务器，性能强劲。
- **PHP**：在套件中心安装 PHP 7.4 或 8.x。
- **配置**：在 Web Station > 脚本语言设置 > PHP 中，可以自定义 `php.ini` 参数（如 `upload_max_filesize`，默认 2M 太小，建议改为 128M）。

## 2. 虚拟主机 (Virtual Host)
- **概念**：在一个 IP 上托管多个网站。
- **技巧**：
    - 网站 A：`blog.yourdomain.com` -> `/web/blog`
    - 网站 B：`test.yourdomain.com` -> `/web/test`
- **操作**：Web Station > 网页服务 > 新增 > 本地脚本语言网站。

## 3. WordPress 优化
- **安装**：可以直接用套件中心的 WordPress，但建议**手动部署**（下载 zip 解压到 /web），更灵活。
- **Redis 缓存**：
    1.  在 Docker 中安装 Redis 容器。
    2.  在 WordPress 中安装 `Redis Object Cache` 插件。
    3.  配置插件连接到 Docker Redis，页面加载速度飞升。
- **伪静态**：在 Web Station 的 Nginx 设置中，确保配置了 try_files 规则，否则 WP 的固定链接会 404。

## 4. Node.js 部署
- **套件**：安装 Node.js v18 或 v20。
- **技巧**：
    - 既然是 NAS，建议直接用 Docker 部署 Node 应用。
    - 如果非要用原生环境，可以通过 SSH 进入，使用 `npm install -g pm2` 来管理进程。

## 5. Python Web 应用 (Django/Flask)
- **推荐**：**不要**直接在系统 Python 环境中跑。
- **最佳实践**：使用 Web Station 的 "Python 脚本服务器" (uWSGI) 或者直接用 Docker。Docker 永远是部署 Python 应用的最干净方式。

## 6. 个人导航页 (HTML/静态)
- **场景**：最简单的建站。
- **操作**：
    1.  下载优秀的静态导航页模板 (GitHub 上很多)。
    2.  解压到 `/web/nav`。
    3.  配置虚拟主机指向该目录。
    4.  访问速度极快，无需数据库。

## 7. HTTPS 与 HSTS
- **安全**：
    - 务必为每个虚拟主机配置 SSL 证书（在登录入口 > 高级 > 证书中关联）。
    - 勾选 HSTS (强制 HTTPS)，防止 SSL 剥离攻击。

## 8. 权限管理 (http 用户组)
- **坑**：上传代码后网页显示 403 Forbidden 或 500 Error。
- **原因**：文件权限不对。Web Station 使用 `http` 用户运行。
- **解决**：在 File Station 中，右键网站目录 > 属性 > 权限，赋予 `SYSTEM` (或 `http`) 用户组 **读取/写入** 权限，并应用到子文件夹。

## 9. 数据库管理 (phpMyAdmin)
- **工具**：安装 MariaDB 10 和 phpMyAdmin 套件。
- **技巧**：
    - 默认 root 密码为空，安装后**立刻修改**。
    - 尽量不要把 phpMyAdmin 暴露到公网（或者通过反向代理加一层密码验证）。

## 10. WebDAV 发布网站
- **玩法**：
    - 使用 WebDAV 客户端（如 Typora, Obsidian）直接编辑 `/web` 目录下的 Markdown 或 HTML 文件。
    - 保存即发布，无需 FTP 或 Git Push，适合极简主义者。
