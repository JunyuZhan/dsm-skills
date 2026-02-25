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
    image: ghcr.io/koush/scrypted
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
2.  在右侧面板点击 **Extensions**。
3.  勾选 **HomeKit**。
4.  进入 **HomeKit** 标签页。
    *   **Pairing**: 点击 **Pairing QR Code**。
    *   **Standalone**: 建议勾选。这会让每个摄像头作为一个独立的 HomeKit 配件，而不是全部挂在一个网关下。这样更稳定，且如果一个坏了不影响其他。
5.  用 iPhone 扫描二维码添加。

## 4. 开启 HKSV (HomeKit 安全视频)

要使用 iCloud 录像和人脸识别，你需要：
1.  iCloud+ 订阅（50GB 支持 1 个，200GB 支持 5 个，2TB 无限）。
2.  HomePod 或 Apple TV 作为家庭中枢。

**配置步骤**：
1.  在 Scrypted 摄像头设置 > HomeKit。
2.  **Recording Support**: 选择 **HomeKit Secure Video**。
3.  **Motion Detection**: Scrypted 需要知道什么时候录像。
    *   **OpenCV (推荐)**: 安装 OpenCV 插件，使用 CPU 进行移动检测（准确率高，但吃 CPU）。
    *   **Camera Motion**: 使用摄像头自带的移动检测（省 CPU，但可能不准）。
4.  在 iPhone 家庭 App 中，点击摄像头 > 设置 > 录制选项 > 选择“流传输与允许录制”。

## 5. 常见问题

*   **Q: 直播卡顿或延迟高？**
    *   A: 尝试在 Stream Management 中将 **RTSP Parser** 设置为 `FFmpeg` 或 `Scrypted`。
    *   A: 确保摄像头的主码流编码是 H.264 (H.265 在旧设备上兼容性差)。
*   **Q: HKSV 不录像？**
    *   A: 检查 Motion Detection 是否正常触发（在 Scrypted 控制台看日志）。
    *   A: 确保家庭中枢网络正常。
