# 在 NAS 上部署 VS Code Server (code-server)

想象一下：你只需要一个浏览器（甚至是 iPad），就能随时随地编写代码、调试 Python 脚本、修改 Docker 配置，而且所有环境都在你的 NAS 上，无需同步代码。这就是 **code-server**。

## 1. 为什么要用 code-server？

*   **iPad 生产力解锁**：配合 iPad + 键盘，把 iPad 变成真正的开发工具。
*   **环境一致性**：无论你在公司电脑、家里台式机还是笔记本，打开浏览器，开发环境、插件、终端历史完全一致。
*   **直接操作 NAS 文件**：不再需要 SSH + Vim 修改配置文件，直接用 VS Code 编辑 `/volume1/docker` 下的文件。

## 2. 部署 (Docker Compose)

我们将使用 LinuxServer 维护的镜像，稳定且易用。

### docker-compose.yml

```yaml
version: "2.1"
services:
  code-server:
    image: lscr.io/linuxserver/code-server:latest
    container_name: code-server
    environment:
      - PUID=1026 # 你的 NAS 用户 ID
      - PGID=100  # users 组 ID
      - TZ=Asia/Shanghai
      - PASSWORD=your_secure_password # 登录密码
      - SUDO_PASSWORD=your_sudo_password # 终端 sudo 密码
      - PROXY_DOMAIN=code.yourdomain.com # 可选，用于反代
    volumes:
      - /volume1/docker/code-server/config:/config # 插件和配置存储
      - /volume1/docker:/workspace # 你的工作区，建议挂载整个 Docker 目录方便管理
    ports:
      - 8443:8443
    restart: unless-stopped
```

*   **PUID/PGID**：务必设置正确，否则无法编辑文件。SSH 运行 `id` 查看。
*   **workspace**：挂载 `/volume1/docker` 可以让你直接在 VS Code 里管理所有 Docker 项目的配置文件。

## 3. 反向代理与 WebSocket

code-server 极其依赖 WebSocket，配置不当会一直弹窗 "Reconnecting"。

1.  **控制面板** > **登录门户** > **高级** > **反向代理服务器**。
2.  **来源**：`https://code.yourdomain.com` -> **目的地**：`http://localhost:8443`。
3.  **关键步骤**：点击 **自定义标题** > **新增** > **WebSocket**。
    *   确保添加了 `Upgrade` 和 `Connection` 两个头。

## 4. 插件与环境配置

部署好后，浏览器访问 `https://code.yourdomain.com`，输入密码进入。

### A. 安装中文语言包
点击左侧插件图标，搜索 "Chinese"，安装 "Chinese (Simplified)" 并重启。

### B. 配置 Python/Node.js 环境
code-server 容器基于 Ubuntu，你可以像在普通 Linux 上一样安装环境。
*   **打开终端** (Ctrl + `)。
*   **更新源**：`sudo apt-get update`
*   **安装 Python3**：`sudo apt-get install python3 python3-pip`
*   **安装 Node.js**：建议使用 `nvm` 安装，或者直接 `sudo apt-get install nodejs npm`。

### C. Git 配置
容器自带 Git。
1.  配置用户名：`git config --global user.name "Your Name"`
2.  配置邮箱：`git config --global user.email "you@example.com"`
3.  **SSH Key**：
    *   在终端运行 `ssh-keygen`。
    *   `cat ~/.ssh/id_rsa.pub` 获取公钥。
    *   添加到 GitHub/GitLab。

## 5. 进阶技巧：Docker in Docker

如果你想在 code-server 的终端里直接运行 `docker` 命令（例如重启其他容器），需要把宿主机的 Docker Socket 挂载进去。

1.  **修改 docker-compose.yml**：
    ```yaml
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    ```
2.  **安装 Docker CLI**：
    *   进入容器终端。
    *   参考 Docker 官方文档安装 CLI（不需要安装 Engine）。
    *   或者直接安装 `docker.io` 包：`sudo apt-get install docker.io`。

现在，你可以在 VS Code 的终端里敲 `docker ps` 了！
