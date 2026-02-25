# Entware 终极指南：在群晖上安装 2000+ Linux 软件

群晖 DSM 的底层是 Linux，但它是一个“阉割版”。很多我们熟悉的命令（如 `git`, `zsh`, `tmux`, `nano`, `iperf3`）要么没有，要么版本极老。

**Entware** 是一个适用于嵌入式系统的软件包管理器（类似 Ubuntu 的 `apt` 或 CentOS 的 `yum`），它可以让你在群晖上安装超过 2000 个标准的 Linux 软件包，让你的 NAS 变成一台真正的 Linux 服务器。

## 1. 为什么需要 Entware？

*   **更强大的 Shell**：安装 `zsh` 和 `oh-my-zsh`，获得自动补全和漂亮的主题。
*   **开发工具**：安装最新版的 `git`, `python3`, `nodejs`, `gcc`。
*   **系统工具**：安装 `htop` (监控), `iperf3` (测速), `tmux` (终端复用), `rclone` (网盘挂载)。
*   **独立环境**：Entware 安装在 `/opt` 目录下，不会污染 DSM 系统文件，系统升级后依然保留。

## 2. 安装步骤 (通用)

虽然有些第三方社区套件提供了 Entware 的一键安装包，但最稳妥、最干净的方式是手动安装。

### 步骤 1：准备工作
1.  **开启 SSH**：控制面板 > 终端机和 SNMP > 启动 SSH 功能。
2.  **创建目录**：Entware 需要安装在 `/opt`。但在 DSM 中 `/opt` 是只读或被占用的。我们需要找个硬盘空间来放它。
    ```bash
    # 登录 SSH 并切换到 root
    sudo -i
    
    # 在你的存储空间（如 volume1）创建一个目录
    mkdir -p /volume1/@entware/opt
    
    # 清空并删除原有的 /opt 目录（如果非空，请先确认内容）
    rm -rf /opt
    mkdir /opt
    
    # 将硬盘目录挂载到 /opt
    mount -o bind /volume1/@entware/opt /opt
    ```

### 步骤 2：运行安装脚本
根据你的 CPU 架构选择脚本。
*   **Intel/AMD (x86_64)**：绝大多数 Plus 系列机型 (DS920+, DS923+, DS224+ 等)。
    ```bash
    wget -O - http://bin.entware.net/x64-k3.2/installer/generic.sh | /bin/sh
    ```
*   **ARMv8 (aarch64)**：部分 Realtek CPU 机型。
    ```bash
    wget -O - http://bin.entware.net/aarch64-k3.10/installer/generic.sh | /bin/sh
    ```

### 步骤 3：配置开机自启
为了让 NAS 重启后 `/opt` 依然挂载且 Entware 服务自动启动。

1.  **创建启动脚本**：
    ```bash
    vi /usr/local/etc/rc.d/entware.sh
    ```
2.  **写入内容**：
    ```bash
    #!/bin/sh

    # 挂载目录
    if [ ! -d /opt/bin ]; then
      mount -o bind /volume1/@entware/opt /opt
    fi

    # 启动 Entware 服务
    /opt/etc/init.d/rc.unslung start
    ```
3.  **赋予执行权限**：
    ```bash
    chmod +x /usr/local/etc/rc.d/entware.sh
    ```

### 步骤 4：添加环境变量
为了让终端能直接运行 `opkg` 而不是输入 `/opt/bin/opkg`。

1.  编辑 `/etc/profile`：
    ```bash
    vi /etc/profile
    ```
2.  在 `PATH` 变量的**最前面**添加 `/opt/bin:/opt/sbin:`。
    *   修改前：`PATH=/sbin:/bin:/usr/sbin:/usr/bin...`
    *   修改后：`PATH=/opt/bin:/opt/sbin:/sbin:/bin:/usr/sbin:/usr/bin...`
3.  **生效**：
    ```bash
    source /etc/profile
    ```

## 3. 常用命令 (opkg)

Entware 的包管理器叫 `opkg`。

*   **更新软件源**（安装软件前必做）：
    ```bash
    opkg update
    ```
*   **安装软件**：
    ```bash
    opkg install git
    opkg install zsh
    opkg install vim
    ```
*   **卸载软件**：
    ```bash
    opkg remove git
    ```
*   **搜索软件**：
    ```bash
    opkg find *python*
    ```

## 4. 推荐安装的神器

### A. Oh My Zsh (终端美化)
让你的 SSH 界面焕然一新。
1.  安装 Zsh: `opkg install zsh`
2.  安装 Oh My Zsh:
    ```bash
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
    ```
3.  更改默认 Shell: 编辑 `/etc/passwd`，将 root 的 shell 从 `/bin/ash` 改为 `/opt/bin/zsh` (注意：修改此文件有风险，请务必小心)。

### B. tmux (终端复用)
SSH 断线了任务还在跑？
*   安装: `opkg install tmux`
*   使用: 输入 `tmux` 进入新会话。断线后重连，输入 `tmux attach` 恢复现场。

### C. rclone (网盘挂载)
DSM 的 Cloud Sync 只能同步，rclone 可以把网盘**挂载**成本地文件夹。
*   安装: `opkg install rclone`
*   配置: `rclone config`
*   挂载: `rclone mount ...`

### D. iperf3 (局域网测速)
测试你的 2.5G/10G 网卡是否达标。
*   安装: `opkg install iperf3`
*   运行服务端: `iperf3 -s`

## 5. 注意事项

*   **不要轻易更新系统自带的命令**：尽量使用 `opkg` 安装新命令到 `/opt/bin`，而不是覆盖 `/bin` 或 `/usr/bin` 下的系统命令，以免导致 DSM 系统异常。
*   **系统升级**：DSM 大版本升级（如 7.1 -> 7.2）可能会重置 `/etc/profile` 或 `/opt` 挂载，升级后可能需要重新检查配置。
