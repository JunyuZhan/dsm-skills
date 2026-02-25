# Synology DSM 7.x CLI 终极指南

虽然 DSM 提供了优秀的图形化界面，但掌握 SSH 命令行（CLI）能让你更深入地控制 NAS，实现许多 GUI 无法完成的自动化任务和故障排查。

!!! danger "高风险操作警告"
    CLI 操作具有最高权限（Root），错误的命令可能导致数据丢失或系统崩溃。请务必小心操作，建议在操作前备份重要数据。

## 开启 SSH 访问

1.  **控制面板** > **终端机和 SNMP** > **终端机**。
2.  勾选 **启动 SSH 功能**。
3.  建议修改默认端口 `22` 为其他端口（如 `2222`）以提高安全性。
4.  点击 **应用**。

## 连接 SSH

在电脑终端（Mac/Linux）或 PowerShell/Putty（Windows）中输入：

```bash
ssh admin_username@nas_ip -p 2222
```

输入密码后即可登录。

## 必备 10 大 CLI 技巧

### 1. 获取 Root 权限

登录后，默认是普通用户权限。执行管理任务通常需要 Root 权限：

```bash
sudo -i
# 输入你的管理员密码（输入时不会显示）
```

此时命令提示符会从 `$` 变为 `#`，代表你已拥有最高权限。

### 2. 套件管理 (synopkg)

`synopkg` 是群晖专属的包管理工具，非常强大。

*   **列出所有已安装套件**：
    ```bash
    synopkg list
    ```
*   **查看套件状态**：
    ```bash
    synopkg status PacketName
    # 例如：synopkg status Docker
    ```
*   **重启套件**：
    ```bash
    synopkg restart PacketName
    ```
*   **停止/启动套件**：
    ```bash
    synopkg stop PacketName
    synopkg start PacketName
    ```

### 3. 服务管理 (synosystemctl)

DSM 7 使用 `systemd`，但群晖封装了 `synosystemctl`。

*   **重启 SSH 服务**：
    ```bash
    synosystemctl restart sshd
    ```
*   **重启 SMB 服务**：
    ```bash
    synosystemctl restart smbd
    ```

### 4. 用户与群组管理

*   **列出所有用户**：
    ```bash
    synouser --enum all
    ```
*   **修改用户密码**：
    ```bash
    synouser --setpw username new_password
    ```
*   **添加用户到群组**：
    ```bash
    synogroup --member groupname username1 username2
    ```

### 5. 共享文件夹管理 (synoshare)

*   **列出共享文件夹**：
    ```bash
    synoshare --enum all
    ```
*   **查看共享文件夹详细信息**（包括路径）：
    ```bash
    synoshare --get ShareName
    ```

### 6. 磁盘空间检查

*   **查看磁盘挂载及使用情况**：
    ```bash
    df -h
    ```
*   **查看当前目录下各文件夹大小**（排查存储空间不明占用神器）：
    ```bash
    du -sh * | sort -hr
    ```

### 7. 资源监控

虽然 DSM 有资源监控工具，但 CLI 更直观。

*   **查看实时进程**：
    ```bash
    top
    ```
*   **推荐安装 `htop`**（通过社群套件）：
    ```bash
    htop
    ```
    比 `top` 界面更友好，支持鼠标操作。

### 8. 索引服务控制 (synoindex)

媒体文件放入文件夹但 Video/Audio Station 没刷出来？手动触发索引。

*   **索引特定文件**：
    ```bash
    synoindex -a /volume1/video/movie.mp4
    ```
*   **删除索引**：
    ```bash
    synoindex -d /volume1/video/movie.mp4
    ```

### 9. 网络测试

*   **测试网络连通性**：
    ```bash
    ping google.com
    ```
*   **查看端口占用**：
    ```bash
    netstat -tunlp | grep 80
    ```

### 10. 计划任务测试

在 GUI 设置的计划任务可以直接在 CLI 运行测试：

1.  找到计划任务的 ID 或脚本路径（通常在 `/usr/syno/etc/scheduled_tasks`）。
2.  或者直接运行你的脚本：
    ```bash
    bash /volume1/homes/admin/myscript.sh
    ```

## 进阶：安装 Entware (包管理器)

DSM 自带的工具有限，安装 Entware 可以让你使用 `opkg` 安装数千个标准 Linux 工具（如 `git`, `zsh`, `tmux`, `vim` 等）。

*请参考 [社群第三方套件推荐](../community/packages.md) 获取更多信息。*
