# Web Station 建站进阶

Web Station 不仅仅是用来放几个静态 HTML 的。通过合理的配置，你可以在 NAS 上运行高性能的动态网站，甚至承载高并发流量。

## 1. 静态网站托管 (Hugo / Hexo)

对于个人博客，静态网站是最快、最安全的。

### 方案
1.  **本地生成**：在电脑上用 Hugo/Hexo 生成 `public` 文件夹。
2.  **自动部署**：
    *   **方法 A (Git)**：在 NAS 上搭建 Git Server，设置 post-receive 钩子，推送代码后自动将 `public` 目录 cp 到 Web Station 的根目录。
    *   **方法 B (Docker)**：使用 Nginx 容器挂载网站目录。
3.  **Web Station 设置**：
    *   新增“静态脚本语言”服务。
    *   文档根目录指向你的 `public` 文件夹。
    *   后端服务器选择 Nginx。

## 2. WordPress 性能优化

WordPress 是出了名的“臃肿”，但在 NAS 上优化得当也能秒开。

### 核心优化三板斧

#### A. 启用 Redis 对象缓存
1.  **Docker 部署 Redis**：
    ```bash
    docker run -d --name redis -p 6379:6379 redis:alpine
    ```
2.  **WordPress 插件**：安装 **Redis Object Cache** 插件。
3.  **配置**：在 `wp-config.php` 中添加：
    ```php
    define('WP_REDIS_HOST', '192.168.1.x'); // NAS IP
    define('WP_REDIS_PORT', 6379);
    ```
4.  **效果**：数据库查询次数减少 90%，后台响应速度提升明显。

#### B. PHP 参数调优 (Web Station)
1.  打开 **Web Station** > **脚本语言设置** > **PHP**。
2.  编辑你使用的 PHP Profile (如 PHP 8.0)。
3.  **Core 设置**：
    *   `memory_limit`: 建议 **256M** 或 **512M** (默认 128M 对复杂主题不够)。
    *   `upload_max_filesize` & `post_max_size`: 改为 **64M** 或更大（否则无法上传大图片）。
    *   `max_execution_time`: 改为 **300** (防止插件更新超时)。
4.  **Extensions**：确保勾选 `curl`, `gd`, `mysqli`, `zip`, `imagick`, `opcache`。
    *   *重要：务必启用 `opcache`，它是 PHP 性能的基石。*

#### C. Nginx 伪静态配置
WordPress 的固定链接需要伪静态支持。
1.  Web Station > 门户 > 编辑。
2.  **规则**：虽然 Web Station 界面不能直接写 Nginx 配置，但可以创建一个 `.htaccess` (如果是 Apache) 或者依赖 WordPress 自身的处理。
3.  **最佳实践**：如果使用 Nginx 后端，Web Station 会自动识别 WordPress 目录并应用基本规则。如果遇到 404，尝试将后端改为 Apache 2.4 测试。

## 3. Python Web 应用 (Django/Flask)

Web Station 也支持 Python，但配置略繁琐。

1.  **Web Station** > **脚本语言设置** > **Python**。
2.  创建 Python Profile。
3.  **门户**：新增门户，选择 Python 后端。
4.  **入口文件**：指定 `wsgi.py`。
5.  **局限性**：Web Station 的 Python 环境包管理极其麻烦。
6.  **推荐替代**：**直接使用 Docker！**
    *   将 Django/Flask 应用打包成 Docker 镜像。
    *   通过 Web Station 的“反向代理”功能指向 Docker 端口。
    *   这是目前最主流、最稳定的部署方式。

## 4. 数据库管理 (phpMyAdmin)

不要用命令行管理数据库。
1.  在套件中心安装 **phpMyAdmin**。
2.  登录：用户名 `root`，密码是你安装 MariaDB 时设置的。
3.  **安全技巧**：
    *   phpMyAdmin 默认暴露在 80/443 端口的一个子路径下。
    *   建议在 Web Station 门户中，为其分配一个**独立的本地端口** (如 8888)，并且**不要**在路由器上映射这个端口。
    *   需要管理时，通过 VPN 回家或者 SSH 隧道访问，确保数据库入口不暴露在公网。

## 5. 多站点管理 (Virtual Hosts)

一台 NAS 可以托管无数个网站。
1.  **基于端口**：`http://nas-ip:8081` -> 博客，`http://nas-ip:8082` -> 相册。
2.  **基于域名**：`blog.com` -> 博客，`photo.com` -> 相册。
    *   Web Station 的“网络门户”完美支持基于域名的虚拟主机。
    *   只需将不同域名解析到同一个 NAS IP，Web Station 会根据请求头中的 Host 字段自动分发到对应的文件夹。
