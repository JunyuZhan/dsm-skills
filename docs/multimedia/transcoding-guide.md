# Jellyfin/Plex 硬件解码与转码详解

NAS 只有几瓦的 CPU 也能流畅播放 4K HDR 电影？秘密就在于 **硬件解码 (Hardware Transcoding)**。

## 1. 为什么要转码？

*   **带宽不够**：在外网用 4G 流量看家里的 4K 蓝光原盘 (80Mbps)，带宽跑不动，需要实时转码成 1080P/720P (4-8Mbps)。
*   **格式不支持**：浏览器不支持 HEVC (H.265) 编码，或者电视不支持某些音频格式 (TrueHD)。
*   **字幕烧录**：某些客户端不支持外挂字幕，需要服务端把字幕“烧”进画面里。

## 2. 硬件要求

*   **Intel CPU**：必须带核显 (iGPU)。
    *   **J4125 (DS920+/DS720+)**：一代神 U，UHD 600 核显，支持 4K HEVC 10bit 硬解。
    *   **N5105/N6005**：性能更强，但驱动曾有 bug (现已基本修复)。
    *   **AMD CPU (DS923+/DS1522+)**：**没有核显！** 无法进行硬件视频转码，只能靠 CPU 软解（效率极低）。如果不差钱，买这类机器看片需慎重。
*   **Plex Pass**：Plex 的硬件转码是**收费功能** (需要购买 Plex Pass)。
*   **Jellyfin/Emby**：硬件转码**免费** (Emby 需订阅 Premiere，但有开心版)。

## 3. Jellyfin 硬件解码配置 (Docker)

这是最常见的场景。

### 第一步：直通核显设备
在 Docker Compose 或 Container Manager 中，必须将 `/dev/dri` 设备直通给容器。

```yaml
services:
  jellyfin:
    image: nyanmisaka/jellyfin:latest # 推荐特供版，驱动更全
    devices:
      - /dev/dri:/dev/dri # 关键：直通核显
    environment:
      - PUID=0 # 为了权限稳妥，有时候需要 root 权限 (0) 才能调用显卡，或者调整 /dev/dri 的权限
      - PGID=0
    # ... 其他配置
```

### 第二步：Jellyfin 后台设置
1.  进入 **控制台** > **播放** > **转码**。
2.  **硬件加速**：选择 **Intel QuickSync (QSV)** (首选) 或 **VAAPI** (通用)。
3.  **启用硬件解码**：勾选 H.264, HEVC, MPEG2, VC1, VP9, AV1 (如果 CPU 支持)。
4.  **启用硬件编码**：勾选。
5.  **色调映射 (Tone Mapping)**：**必须勾选**。这是将 HDR 视频转码为 SDR (给不支持 HDR 的手机/显示器看) 的关键，否则画面会发灰。
    *   *注意：开启 VPP 色调映射需要较新的驱动支持。*

## 4. Plex 硬件解码配置

1.  **前提**：拥有 Plex Pass。
2.  **Docker**：同样需要挂载 `/dev/dri:/dev/dri`。
3.  **设置**：
    *   设置 > 转码器。
    *   勾选 **Use hardware acceleration when available**。
    *   勾选 **Use hardware-accelerated video encoding**。
    *   **HDR Tone Mapping**：勾选 "Enable HDR tone mapping"。

## 5. 验证是否生效

如何知道转码是走的 CPU 还是 GPU？

*   **Jellyfin**：
    *   在播放界面点击“齿轮” > “媒体信息”。
    *   查看“转码详情”。如果是“视频：HEVC -> H264 (硬件)”，说明成功。
    *   或者查看 Docker 容器日志，搜索 `ffmpeg` 命令，看是否有 `h264_qsv` 或 `hevc_qsv` 参数。
*   **终端监控**：
    *   SSH 进入 NAS。
    *   安装 `intel-gpu-tools` (需社区源)。
    *   运行 `sudo intel_gpu_top`。
    *   播放视频并触发转码。如果看到 `Video` 或 `Render` 占用率飙升，说明 GPU 在工作。

## 6. 常见问题排查

*   **花屏/绿屏**：通常是驱动问题。
    *   尝试更换 Docker 镜像（如 `linuxserver/jellyfin` 换成 `nyanmisaka/jellyfin`）。
    *   关闭“低电压模式”或特定格式的硬件解码。
*   **字幕导致转码**：
    *   ASS/SSA 特效字幕通常需要 CPU 进行单线程烧录，无法使用 GPU。这会导致性能瓶颈。
    *   **解决**：客户端设置“仅烧录图像字幕”，或者将字幕转为 SRT 格式。
*   **AMD CPU 怎么办？**
    *   基本无解。只能靠 CPU 软解。
    *   或者：使用 **Infuse** 等强力客户端，在本地解码，让 NAS 只负责传输文件（Direct Play），不进行转码。这是 AMD NAS 用户的最佳出路。
