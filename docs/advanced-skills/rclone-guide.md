# Rclone 深度指南：挂载万物

群晖自带的 Cloud Sync 很好用，但它支持的网盘有限，且功能主要是“同步”而非“挂载”。

**Rclone** 是命令行版的网盘瑞士军刀，支持 70+ 种云存储协议。它可以把无限容量的 Google Drive、OneDrive 挂载成本地文件夹，让 Plex 直接读取云端电影，或者用 Hyper Backup 把数据备份到 S3 存储桶。

## 1. 安装 Rclone

### 方法 A：通过 Entware 安装 (推荐)
如果你已经安装了 Entware (见 [CLI 指南](../cli/entware-guide.md))：
```bash
opkg install rclone
```

### 方法 B：手动下载二进制
1.  下载：`wget https://downloads.rclone.org/rclone-current-linux-amd64.zip`
2.  解压：`unzip rclone-current-linux-amd64.zip`
3.  移动：`mv rclone-*-linux-amd64/rclone /usr/bin/`
4.  权限：`chmod +x /usr/bin/rclone`

## 2. 配置网盘 (Config)

Rclone 的配置过程是交互式的。

1.  运行配置向导：
    ```bash
    rclone config
    ```
2.  输入 `n` (New remote)。
3.  输入名称：`onedrive`。
4.  选择协议：找到 `Microsoft OneDrive` 对应的数字。
5.  **关键步骤**：
    *   **Client ID/Secret**：留空使用默认，或者填入你自己申请的 API (推荐，更稳定)。
    *   **Edit advanced config**：`n`。
    *   **Remote config**：由于 NAS 是无头设备 (Headless)，没有浏览器。当问你 `Use auto config?` 时，必须选 **`n`**。
6.  **获取 Token**：
    *   在你的电脑上下载 Rclone。
    *   在电脑终端运行 `rclone authorize "onedrive"`。
    *   浏览器弹出登录，授权成功后，终端会显示一长串 JSON Token。
    *   复制这串 Token，粘贴回 NAS 的终端。
7.  选择类型：`1` (OneDrive Personal or Business)。
8.  确认保存。

## 3. 挂载为本地磁盘 (Mount)

这是 Rclone 最酷的功能。

### 挂载命令
```bash
rclone mount onedrive:/ /volume1/cloud/onedrive \
 --allow-other \
 --allow-non-empty \
 --vfs-cache-mode writes \
 --daemon
```

*   `onedrive:/`：配置名称 + 路径。
*   `/volume1/cloud/onedrive`：本地挂载点 (必须是空目录)。
*   `--allow-other`：允许其他用户 (如 Plex) 访问挂载点。
*   `--vfs-cache-mode writes`：开启写入缓存，提高上传稳定性。
*   `--daemon`：后台运行。

### 开机自动挂载
DSM 7 不支持 systemd，我们需要用“任务计划”来实现。

1.  **控制面板** > **任务计划** > **新增** > **触发的任务** > **用户定义的脚本**。
2.  **任务设置**：
    *   任务名称：`Rclone Mount`
    *   用户账号：`root`
    *   事件：**开机**
3.  **任务设置** (脚本内容)：
    ```bash
    #!/bin/bash
    # 等待网络就绪
    sleep 30
    # 挂载
    /usr/bin/rclone mount onedrive:/ /volume1/cloud/onedrive \
     --config /root/.config/rclone/rclone.conf \
     --allow-other \
     --allow-non-empty \
     --vfs-cache-mode writes \
     --daemon
    ```

## 4. 进阶应用场景

### A. Plex / Emby 无限媒体库
*   把 Google Drive 或 OneDrive 挂载到 `/volume1/media/cloud_movies`。
*   在 Plex 中添加这个库。
*   **效果**：直接播放云端 4K 电影，本地不占空间。Rclone 会自动处理缓存和缓冲。

### B. Hyper Backup 备份到任意云
Hyper Backup 原生只支持 Synology C2, S3, Dropbox 等。想备份到 OneDrive 怎么办？
1.  用 Rclone 开启 WebDAV 服务：
    ```bash
    rclone serve webdav onedrive:/ --addr :8081 --user admin --pass password
    ```
2.  在 Hyper Backup 中选择 **WebDAV**。
3.  地址填 `http://127.0.0.1:8081`。
4.  **效果**：Hyper Backup 以为自己在备份到 WebDAV 服务器，实际上数据被 Rclone 转发到了 OneDrive。

### C. 每日定时同步 (Sync)
如果你不需要实时挂载，只想每天凌晨备份照片。
*   命令：`rclone sync /volume1/photo onedrive:/backup/photo`
*   **区别**：
    *   `copy`：增量复制 (只加不删)。
    *   `sync`：完全同步 (本地删了，云端也删)。**慎用！**

## 5. 常见问题

*   **挂载点是空的？**：检查 `fuse` 是否安装。DSM 7 通常自带。尝试不加 `--daemon` 运行，看报错信息。
*   **上传失败？**：OneDrive/Google Drive 对单文件大小或上传频率有限制。加上 `--vfs-cache-mode full` 可以缓解。
*   **API 限流？**：晚上高峰期可能会遇到 429 Too Many Requests。建议申请自己的 Client ID。
