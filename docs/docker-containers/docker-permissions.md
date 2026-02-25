# Docker 权限管理终极指南 (PUID/PGID)

你是否遇到过这些问题：
*   Docker 容器启动后报错 `Permission denied`。
*   Transmission 下载的文件，File Station 里无法删除。
*   Jellyfin 无法读取媒体库，封面全是黑的。
*   容器生成的日志文件，通过 SMB 无法编辑。

这一切的根源都是 **Linux 权限问题**。在 DSM 上运行 Docker，理解 **PUID (User ID)** 和 **PGID (Group ID)** 是必修课。

## 1. 核心概念：用户身份映射

Docker 容器内部有一套自己的用户系统（通常是 root），而宿主机（NAS）也有自己的用户系统。
*   **默认情况**：容器内的进程以 `root` (UID 0) 运行。它在宿主机上创建的文件，所有者也是 `root`。
*   **后果**：你的 NAS 常用账号（如 `admin` 或 `user`）没有 root 权限，自然无法修改或删除这些文件。

### PUID 和 PGID 的作用
LinuxServer 等优秀的镜像维护者引入了 `PUID` 和 `PGID` 环境变量。
*   **原理**：容器启动时，会自动创建一个用户，其 UID 和 GID 等于你传入的 PUID 和 PGID。
*   **效果**：容器内部进程以这个“伪装”的用户身份运行。它在宿主机上创建的文件，所有者就是你指定的那个 NAS 用户。**完美解决了权限冲突。**

## 2. 如何获取 PUID 和 PGID？

### 方法 A：SSH (推荐)
1.  开启 SSH 功能。
2.  使用终端登录 NAS。
3.  输入命令 `id 你的用户名`。
    ```bash
    admin@NAS:~$ id myuser
    uid=1026(myuser) gid=100(users) groups=100(users),101(administrators)
    ```
4.  **结果**：
    *   **PUID**: `1026`
    *   **PGID**: `100` (DSM 所有普通用户默认都属于 `users` 组，GID 固定为 100)

### 方法 B：任务计划 (免 SSH)
1.  控制面板 > 任务计划 > 新增 > 用户定义的脚本。
2.  用户账号：选择你想查询的用户。
3.  脚本内容：`id > /volume1/docker/id.txt`。
4.  运行一次，去 File Station 查看 `id.txt`。

## 3. 最佳实践配置

### Docker Compose 示例

```yaml
version: "3"
services:
  qbittorrent:
    image: lscr.io/linuxserver/qbittorrent
    environment:
      - PUID=1026  # 替换为你的真实 UID
      - PGID=100   # 建议固定为 100 (users 组)
      - UMASK=022  # 权限掩码，决定新文件的权限
    volumes:
      - /volume1/docker/qbittorrent:/config
      - /volume1/downloads:/downloads
```

### 关键参数：UMASK
除了用户身份，文件的读写权限（rwx）也很重要。
*   **022 (默认)**：
    *   文件夹权限：755 (rwxr-xr-x) -> 所有者读写，其他人只读。
    *   文件权限：644 (rw-r--r--) -> 所有者读写，其他人只读。
    *   **适用**：绝大多数场景。
*   **002**：
    *   文件夹权限：775 (rwxrwxr-x) -> 所有者和组读写。
    *   **适用**：多个容器协同工作（如 Sonarr 和 qBittorrent），且它们属于同一个组 (PGID 100)。

## 4. 常见问题排查

### 场景 A：Transmission 下载的文件无法删除
*   **原因**：容器未设置 PUID/PGID，默认以 root 运行，文件归属 root。
*   **解决**：
    1.  停止容器。
    2.  在 Compose 中添加 `PUID=1026, PGID=100`。
    3.  **修复旧文件权限**：SSH 运行 `chown -R 1026:100 /volume1/downloads`。
    4.  重启容器。

### 场景 B：Jellyfin 无法读取媒体库
*   **原因**：媒体库文件夹权限过严（如 700），Jellyfin 运行用户（如 PUID 1026）无权访问。
*   **解决**：
    1.  File Station 右键媒体文件夹 > 属性 > 权限。
    2.  新增 `users` 组（或直接添加用户 `myuser`）。
    3.  赋予 **读取** 权限。
    4.  勾选 **应用到子文件夹**。

### 场景 C：`/dev/dri` 显卡无权限
*   **原因**：Docker 容器默认无权访问宿主机硬件设备。
*   **解决**：
    1.  **特权模式 (不推荐)**：`privileged: true`。
    2.  **修改设备组权限 (推荐)**：
        *   SSH 查看显卡所属组：`ls -l /dev/dri` (通常是 `root:root` 或 `root:video`)。
        *   将你的用户加入 `video` 组（DSM 7 可能没有这个组，需手动修改设备权限）。
        *   **终极方案**：
            ```yaml
            group_add:
              - "998" # video 组的 ID，SSH 输入 `getent group video` 查看
            ```
    3.  **简单粗暴法**：SSH 运行 `chmod 666 /dev/dri/renderD128` (重启失效，需加到开机脚本)。

## 5. 总结

1.  **永远不要用 root (UID 0) 跑容器**，除非它是 Portainer 这种管理工具。
2.  **固定使用一个普通用户**（如 `docker-user`）来运行所有业务容器。
3.  **PUID/PGID** 必须与宿主机文件夹的所有者一致。
4.  遇到权限问题，先检查 **File Station 权限**，再检查 **容器环境变量**。
