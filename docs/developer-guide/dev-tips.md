# 开发者进阶指南

释放 Linux 底层能力，像管理服务器一样管理 NAS。

## 1. Entware 包管理器
Synology 自带的工具太少 (没有 apt/yum)。Entware 是嵌入式设备的软件仓库。
- **安装**：
    1.  创建 `/volume1/@Entware/opt` 目录。
    2.  运行安装脚本 (根据 CPU 架构选择，x86_64 或 armv8)。
    3.  修改 `/etc/rc.local` 实现开机挂载 `/opt`。
- **用途**：`opkg install git`, `opkg install zsh`, `opkg install tmux`, `opkg install vim`。

## 2. Git Server 私有代码仓库
- **简单版**：套件中心安装 Git Server。
    - 用途：仅作为 SSH 协议的远程仓库。
    - 客户端：`git remote add origin ssh://user@nas_ip/volume1/git/project.git`
- **豪华版**：Docker 部署 **Gitea** 或 **GitLab**。
    - 推荐 Gitea，资源占用极低，功能足够个人使用。

## 3. Python 虚拟环境最佳实践
- **痛点**：DSM 自带的 Python 版本老旧，且 `pip` 安装全局包可能破坏系统。
- **方案**：
    - 使用 `miniconda` 或 `venv`。
    - **强烈推荐**：所有 Python 项目都跑在 **Docker** 里。不要污染宿主机环境。如果非要跑，请安装在 `/opt` (Entware) 下。

## 4. 交叉编译 (Cross Compilation)
- **场景**：有些软件没有现成的 spk 包，也没有 Docker 镜像。
- **工具**：**spksrc** (SynoCommunity 维护)。
- **流程**：
    1.  在 PC (Ubuntu) 上克隆 spksrc 仓库。
    2.  配置 Toolchain (对应 NAS CPU 架构)。
    3.  编写 Makefile。
    4.  `make arch-x86_64` 生成 spk 文件。

## 5. Task Scheduler 进阶
- **环境变量**：DSM 任务计划的 PATH 环境变量很短。
- **技巧**：在脚本开头显式声明 PATH：
    ```bash
    #!/bin/bash
    export PATH=/usr/local/bin:/usr/bin:/bin:/opt/bin:$PATH
    # 你的命令
    ```
- **日志重定向**：`script.sh >> /volume1/logs/mylog.log 2>&1`，方便排查错误。

## 6. Docker 网络模式详解
- **Bridge (默认)**：NAT 模式，端口映射。安全，但效率略低。
- **Host**：共用宿主机 IP。效率最高，但端口容易冲突 (如 80/443)。
- **Macvlan**：给容器分配一个独立的局域网 IP (如 192.168.1.50)。
    - **用途**：AdGuard Home, OpenWrt 旁路由。
    - **坑**：宿主机默认无法访问 Macvlan IP，需要建立虚接口桥接。

## 7. 自动证书续期 (acme.sh)
- **场景**：Let's Encrypt 证书 90 天过期。
- **方案**：
    1.  SSH 安装 `acme.sh`。
    2.  配置 DNS API (阿里云/Cloudflare)。
    3.  设置部署钩子：
        ```bash
        acme.sh --deploy -d yourdomain.com --deploy-hook synology_dsm
        ```
    4.  它会自动替换 DSM 证书并重启 Nginx。

## 8. 逆向代理与 Websocket
- **问题**：某些应用 (Bitwarden, Home Assistant) 需要 Websocket 支持。
- **解决**：
    - 在“登录入口 > 反向代理”中，除了设置 HTTP 转发，点击“自定义标题”。
    - 新增 `Upgrade` -> `$http_upgrade` 和 `Connection` -> `$connection_upgrade`。

## 9. 数据库直连
- **场景**：开发环境需要连接 NAS 上的 Postgres/MariaDB。
- **MariaDB**：默认监听 3306/3307，允许远程 root 登录 (注意安全)。
- **Postgres**：Synology 系统自带 Postgres，但不建议直接用。它的 socket 文件在 `/tmp` 或 `/run/postgresql`。建议自己用 Docker 起一个 Postgres。

## 10. SSH 隧道与端口转发
- **场景**：在外网想访问家里内网的 路由器后台 (192.168.1.1)。
- **技巧**：
    - 本地终端：`ssh -L 8080:192.168.1.1:80 user@nas_ip`
    - 浏览器访问：`localhost:8080`，即可打开路由器后台。
