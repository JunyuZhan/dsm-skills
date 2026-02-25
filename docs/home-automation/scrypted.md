# Scrypted：让 HomeKit 拥抱非官方摄像头 (HKSV)

如果你是 Apple 全家桶用户，一定听说过 **HomeKit Secure Video (HKSV)**。它能让你的摄像头视频直接在“家庭”App 中查看，支持人脸识别、云端录像（不占 NAS 空间，存 iCloud），且极其安全。

但原生支持 HKSV 的摄像头（如 Aqara, Logitech）通常很贵。**Scrypted** 是一个高性能的视频桥接平台，能把几百块的海康威视、TP-Link、甚至 USB 摄像头接入 HomeKit，并完美支持 HKSV。

## 1. 为什么选 Scrypted 而不是 Home Assistant？

*   **性能**：Scrypted 专为视频设计，延迟极低（毫秒级），打开直播几乎秒开。
*   **HKSV 支持**：它对 HKSV 的支持比 HomeBridge 和 Home Assistant 更完善，配置更简单。
*   **预缓冲**：支持 Pre-buffer，点击推送瞬间就能看到录像，不再转圈圈。

## 2. 部署 (Docker Compose)

Scrypted 需要占用较多端口用于 HomeKit 配对，建议使用 `host` 网络模式。

```yaml
version: '3.5'
services:
  scrypted:
    image: koush/scrypted
    container_name: scrypted
    restart: unless-stopped
    network_mode: host # 关键
    volumes:
      - /volume1/docker/scrypted/config:/server/volume
    environment:
      - SCRYPTED_WEBHOOK_UPDATE_AUTHORIZATION=Bearer 你的Token # 可选
```

## 3. 配置流程

### A. 安装插件
1.  打开 `https://nas-ip:10443`。
2.  创建账号登录。
3.  点击 **Plugins** > **Install Plugin**。
4.  搜索并安装以下插件：
    *   **HomeKit**: 用于接入 Apple 家庭。
    *   **ONVIF**: 通用协议，支持 99% 的摄像头（海康/大华/TP-Link）。
    *   **Rebroadcast Plugin** (可选): 重新广播流，降低摄像头负载。

### B. 添加摄像头
1.  点击 **Device** > **ONVIF**。
2.  **Add New Device**。
3.  输入摄像头的 IP、用户名、密码。
4.  Scrypted 会自动发现摄像头的配置（主码流、子码流）。
    *   *技巧：如果发现失败，请手动在 ONVIF 设置中填入 RTSP 地址。*

### C. 配置 HomeKit
1.  点击左侧刚添加的摄像头。
2.  在右侧面板点击 **Extensions**，勾选 **HomeKit**。
3.  点击 **HomeKit** 选项卡。
4.  **Pairing**:
    *   选择 **Standalone Accessory** (推荐) 或 Bridge。独立配件模式性能更好。
    *   你会看到一个二维码。
5.  打开 iPhone **家庭 App** > **添加配件** > 扫描二维码。
6.  添加成功！现在你可以在家庭 App 里看到直播了。

## 4. 开启 HKSV (录像与 AI)

要启用 iCloud 录像和人脸识别，需要额外配置。

1.  **要求**：你需要订阅 iCloud+ (50GB+)。
2.  在 Scrypted 摄像头设置页面，点击 **HomeKit**。
3.  **Recording**:
    *   勾选 **HomeKit Secure Video**。
    *   配置 **Motion Detection** (运动检测)。
        *   Scrypted 支持使用摄像头自带的运动检测（On-Device Motion），或者使用软件算法（OpenCV）。
        *   **推荐**：使用 **ONVIF Motion**（如果摄像头支持）。这不仅节省 NAS CPU，而且反应更快。
        *   如果摄像头不支持，安装 **OpenCV** 插件并启用。
4.  **家庭 App 设置**：
    *   在 iPhone 上点开摄像头 > 设置 > **录像选项**。
    *   选择 **流传输与允许录像**。

## 5. 进阶优化

### A. 编解码器 (Codec)
HomeKit 强制要求 **H.264** 视频和 **AAC** 音频。
*   如果你的摄像头输出 H.265，Scrypted 会自动转码（非常吃 CPU）。
*   **最佳实践**：进入摄像头网页后台，将主码流设置为 **H.264**，音频设置为 **AAC** (或 G.711，Scrypted 转码音频很轻松)。这样可以实现 **Direct Copy**，几乎不占 CPU。

### B. 快照 (Snapshot)
*   家庭 App 的预览图是定时刷新的。
*   确保 ONVIF 插件能正确获取 Snapshot URL。如果不行，可以在 Snapshot 插件中手动填入 JPG 地址。

### C. 延迟优化
*   如果直播卡顿，尝试在 **Stream Management** 中，将 **Rebroadcast** 启用。这会让 Scrypted 保持与摄像头的连接，当你打开 App 时，直接从缓存推流，无需等待握手。
