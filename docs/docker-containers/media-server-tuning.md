# 媒体服务器深度调优 (Plex/Emby/Jellyfin)

安装媒体服务器只是第一步。为了获得丝般顺滑的播放体验，特别是 4K HDR 转码和外网播放，你需要进行深度调优。

## 1. 硬件转码 (Hardware Transcoding)

这是最核心的优化。利用核显 (iGPU) 解码视频，解放 CPU。

### A. 驱动映射 (Docker)
所有媒体服务器都需要访问 `/dev/dri` 设备。

*   **Docker Compose 配置**：
    ```yaml
    devices:
      - /dev/dri:/dev/dri
    ```
*   **权限问题**：
    *   确保容器运行用户 (PUID/PGID) 有权限访问显卡。
    *   **技巧**：如果你不想折腾权限，可以简单粗暴地赋予容器 `privileged: true` (特权模式)，但这有安全风险。
    *   **推荐**：将用户加入 `video` 和 `render` 组：
        ```bash
        sudo usermod -aG video,render your_user
        ```

### B. 显卡驱动检查
进入容器内部，运行 `ls -l /dev/dri`，应该能看到 `renderD128`。
*   **Intel 核显**：通常无需额外驱动，DSM 内核已集成。
*   **NVIDIA 显卡**：需要安装 **NVIDIA Runtime**。
    *   在 DSM 套件中心安装 "NVIDIA GPU Driver" (如果有)。
    *   Docker 配置需添加 `runtime: nvidia`。

## 2. 刮削与元数据 (Metadata & Scraping)

海报墙加载慢？刮削不到封面？

### A. Hosts 优化 (解决 TMDB 连接失败)
由于 TMDB API 经常被墙或 DNS 污染，导致刮削失败。
*   **解决方案**：修改容器内的 `/etc/hosts`。
*   **Docker Compose**：
    ```yaml
    extra_hosts:
      - "api.themoviedb.org:13.224.161.90"
      - "image.tmdb.org:104.16.61.155"
    ```
    *(注意：IP 地址可能会变，建议定期 ping 检测)*

### B. NFO 本地刮削 (推荐)
与其依赖服务器在线刮削，不如用 **TinyMediaManager (TMM)** 或 **MoviePilot** 在本地整理好 NFO 文件和图片。
*   **设置**：
    *   **Plex**: 使用 "Plex Movie Agent" 并开启 "Use local assets"。
    *   **Emby/Jellyfin**: 开启 "NFO saver" 和 "从 NFO 读取元数据"。
*   **优势**：
    *   **速度快**：秒建库，不需要联网下载图片。
    *   **迁移方便**：重装系统后，媒体库瞬间恢复。

## 3. 缓存与转码目录 (Transcode Directory)

转码会产生大量临时文件，频繁读写伤硬盘。

### A. 内存转码 (RAM Disk)
将转码目录映射到内存中 (tmpfs)。
*   **原理**：内存读写速度是 SSD 的几十倍，且不磨损硬盘寿命。
*   **Docker Compose**：
    ```yaml
    volumes:
      - /dev/shm:/transcode  # 将宿主机的共享内存映射为转码目录
    ```
    *   **注意**：`/dev/shm` 默认大小通常是物理内存的一半。如果你的内存很小 (如 2GB)，这可能导致内存溢出。
*   **设置**：在 Plex/Emby 后台将“转码临时目录”设置为 `/transcode`。

## 4. 网络优化 (Network Tuning)

### A. 解决卡顿与缓冲
*   **码率限制 (Bitrate Limit)**：
    *   如果你主要在公网播放，且上行带宽只有 30Mbps。请在服务器设置中将 **远程流媒体码率限制** 设置为 **20Mbps** (留点余量)。
    *   **Plex**: Settings > Remote Access > Internet upload speed / Limit remote stream bitrate.
    *   **Emby**: 用户 > 编辑用户 > 播放 > 互联网播放质量限制。

### B. 中继转发 (Relay)
*   **Plex Relay**：当直连不通时，Plex 会通过官方服务器中继。
    *   **限制**：免费用户 1Mbps，Plex Pass 用户 2Mbps。画质极差。
    *   **优化**：如果你配置好了 DDNS 或反向代理，**务必在设置中关闭 Relay**，强制直连。如果连不上，说明你的网络配置有问题，不要用 Relay 掩盖问题。

## 5. 字幕优化 (Subtitles)

### A. 字体回退 (Fallback Fonts)
解决中文字幕变方块的问题。
*   **原因**：Docker 镜像通常基于精简版 Linux，缺少中文字体。
*   **解决**：
    1.  找一个包含常用中文字体 (如 Noto Sans SC) 的文件夹。
    2.  挂载到容器的系统字体目录：
        ```yaml
        volumes:
          - /volume1/fonts:/usr/share/fonts/custom
        ```
    3.  Emby/Jellyfin 后台设置备用字体路径。

### B. 烧录字幕 (Burn-in)
*   **尽量避免**：烧录字幕需要强制视频转码 (CPU 占用高)。
*   **推荐格式**：使用 **SRT** 外挂字幕。大多数客户端都能直接渲染 SRT，无需转码。ASS 特效字幕在网页端通常需要转码，但在 Apple TV / Android TV 客户端上可以直通。

## 6. 数据库优化 (Database)

媒体库大了之后，浏览会变卡。

*   **Plex**: 每周执行 "Optimize Database" (设置 > 故障排除 > 优化数据库)。
*   **SSD 存储**：务必将 Plex/Emby 的配置目录 (`/config`) 放在 SSD 存储空间上。数万张封面图片的随机读取，机械硬盘扛不住。
