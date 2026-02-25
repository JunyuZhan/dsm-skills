# Web Station 实战：零成本托管静态网站

Web Station 是群晖最被低估的套件之一。它不仅能跑 PHP，还是一个高性能的静态 Web 服务器。利用它，你可以轻松托管个人博客、文档网站（如本书）、简历页面或导航页。

## 1. 为什么选择静态网站？

*   **速度快**：纯 HTML/CSS/JS，无需数据库查询，毫秒级响应。
*   **安全**：没有后台，黑客无处下手。
*   **低资源**：几乎不占用 CPU 和内存。
*   **流行框架**：Hexo, Hugo, VuePress, MkDocs。

## 2. 部署流程 (以 Hexo 博客为例)

### 第一步：在本地生成网站
建议在电脑上生成静态文件，而不是在 NAS 上编译（NAS 也可以，但稍微麻烦）。
1.  **本地电脑**：安装 Node.js 和 Hexo。
    ```bash
    npm install -g hexo-cli
    hexo init myblog
    cd myblog
    npm install
    hexo generate # 生成静态文件，位于 public 目录
    ```

### 第二步：上传到 NAS
1.  在 File Station 中，创建一个文件夹 `/volume1/web/myblog`。
2.  将本地 `public` 目录下的**所有内容**（index.html, css, js 等）上传到该文件夹。
    *   *进阶技巧*：使用 Synology Drive 同步，本地 `hexo generate` 后自动同步到 NAS，实现“发布即上线”。

### 第三步：Web Station 配置
1.  打开 **Web Station**。
2.  **网页服务** > **新增** > **静态网站**。
    *   **名称**：MyBlog
    *   **文档根目录**：选择 `/volume1/web/myblog`。
    *   **HTTP 后端**：Nginx (推荐)。
3.  **网络门户** > **新增** > **服务门户**。
    *   **服务**：选择刚才创建的 "MyBlog"。
    *   **主机名**：`blog.yourdomain.com`。
    *   **端口**：80 / 443。
    *   **HTTPS**：勾选 HSTS。

### 第四步：访问
在浏览器输入 `https://blog.yourdomain.com`，你的博客就上线了！

## 3. 自动化部署 (Git Actions / Webhook)

手动上传太麻烦？我们可以利用 **Git** 实现自动化部署。

### 方案 A：Git Server (简单版)
1.  在 NAS 上启用 Git Server，创建一个裸仓库 `/volume1/git/blog.git`。
2.  配置 `post-receive` 钩子：
    ```bash
    #!/bin/sh
    # 检出代码到 Web 目录
    git --work-tree=/volume1/web/myblog --git-dir=/volume1/git/blog.git checkout -f
    ```
3.  本地电脑配置 Git Remote 指向 NAS。
4.  本地写好文章，`git push`，NAS 自动更新网站。

### 方案 B：Docker + Nginx (极客版)
如果你不想用 Web Station，也可以用 Docker。
1.  **docker-compose.yml**:
    ```yaml
    services:
      blog:
        image: nginx:alpine
        volumes:
          - /volume1/web/myblog:/usr/share/nginx/html:ro
        ports:
          - "8080:80"
    ```
2.  效果一样，但 Web Station 的优势在于它能自动处理 HTTPS 证书和端口复用（通过系统反代）。

## 4. 常见静态网站推荐

*   **个人主页/简历**：GitHub 上搜 "Resume Template"，下载 HTML 修改即可。
*   **导航页**：WebStack, SixLab 等。
*   **文档**：MkDocs (也就是本书用的框架)。
*   **相册**：Lychee (虽然有 PHP 后端，但前端是静态的)。

## 5. 故障排查

*   **403 Forbidden**：
    *   原因：权限问题。`http` 用户组无法读取文件。
    *   解决：右键 `/volume1/web/myblog` > 属性 > 权限 > 新增 > 用户组 `http` > 读取权限 > 应用到子文件夹。
*   **404 Not Found**：
    *   原因：Nginx 没找到 `index.html`。
    *   解决：确保你上传的是 `public` 文件夹**里面**的内容，而不是 `public` 文件夹本身。即 `/volume1/web/myblog/index.html` 必须存在。
