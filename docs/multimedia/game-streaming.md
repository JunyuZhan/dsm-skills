# 私有云游戏串流 (Sunshine + Moonlight)

想在客厅电视上玩书房电脑里的 3A 大作？或者在公司摸鱼玩家里的游戏？**Sunshine + Moonlight** 是目前延迟最低、画质最好的串流方案。

## 1. 核心原理

*   **Sunshine (服务端)**：安装在你的高性能 PC (Windows) 或高性能 NAS (如果有独显) 上。它替代了 NVIDIA GeForce Experience 的 GameStream 功能（NVIDIA 已停止支持）。
*   **Moonlight (客户端)**：安装在电视 (Android TV/Apple TV)、手机、iPad 或轻薄本上。

## 2. Sunshine 服务端部署 (NAS 版)

如果你的 NAS 有高性能独显 (如 DVA3221 的 GTX1650，或魔改的 Tesla P4)，可以在 NAS 上跑服务端。否则，建议在主力 PC 上装 Sunshine。

### Docker 部署
```yaml
services:
  sunshine:
    image: lizardbyte/sunshine:latest
    container_name: sunshine
    runtime: nvidia # 关键：需要 NVIDIA Container Toolkit 支持
    network_mode: host # 必须 Host 模式
    environment:
      - PUID=1026
      - PGID=100
    volumes:
      - /volume1/docker/sunshine/config:/config
    restart: unless-stopped
```

## 3. 客户端连接 (Moonlight)

1.  **下载**：在 Apple TV / Android TV / iPad 上下载 **Moonlight Game Streaming**。
2.  **配对**：
    *   确保客户端和服务端在同一局域网。
    *   Moonlight 会自动发现 Sunshine 主机。
    *   点击连接，屏幕出现 4 位 PIN 码。
    *   在 Sunshine 后台 (`https://NAS_IP:47990`) 输入 PIN 码。
3.  **开始游戏**：连接成功后，你会看到 Steam、Desktop 等图标，点击即可串流。

## 4. 异地串流 (ZeroTier / Tailscale)

*   **Tailscale**：最简单。服务端和客户端都装 Tailscale，Moonlight 中手动添加服务端的 Tailscale IP。实测延迟增加 10-20ms，完全可玩。
*   **公网直连**：如果在路由器做了端口映射（TCP 47984, 47989, 48010; UDP 47998-48000, 48002, 48010），延迟最低。

## 5. 虚拟显示器 (HDMI 诱骗器)

**痛点**：串流时，如果显示器关闭，显卡可能不渲染画面。
**解法**：
*   **物理**：买个 HDMI 诱骗器 (几块钱)，插在显卡上，伪装成一个 4K 显示器。
*   **软件**：使用 **Virtual Display Driver** (IddSampleDriver)，在 Windows 上创建一个虚拟屏幕。

## 6. 局域网唤醒 (WoL)

想玩的时候再开机。
1.  **BIOS**：开启 PC 的 Wake on LAN。
2.  **网卡**：在 Windows 设备管理器中，允许网卡唤醒计算机。
3.  **Moonlight**：在客户端设置中，点击主机图标，选择“发送唤醒数据包”。
