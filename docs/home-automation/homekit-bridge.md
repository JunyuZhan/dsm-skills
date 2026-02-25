# 米家接入 HomeKit 深度桥接指南

虽然 Home Assistant (HA) 可以接入各种设备，但对于苹果用户来说，最终目标通常是**把所有非 HomeKit 设备（如米家、涂鸦、美的）通过 HA 桥接到 Apple Home (家庭 App)**，实现 Siri 控制和 HomeKit 自动化。

本指南将深入讲解如何优雅、稳定地实现这一目标，特别是针对**实体筛选**和**类型映射**的高级配置。

## 1. 核心思路

*   **接入层**：使用 `Xiaomi Miot Auto` 集成将米家设备接入 HA。
*   **桥接层**：使用 `HomeKit Bridge` 集成将 HA 中的实体暴露给 Apple Home。
*   **过滤层**：通过 YAML 配置，**只暴露需要的设备**，避免 Apple Home 里出现几百个无用的传感器（如“信号强度”、“电池电量”等垃圾实体）。

## 2. 步骤一：接入米家设备

1.  **安装集成**：在 HACS 中搜索 `Xiaomi Miot Auto` 并安装。
2.  **配置集成**：配置 > 设备与服务 > 添加集成 > Xiaomi Miot Auto > 账号登录。
3.  **筛选设备**：建议选择“Exclude”模式，默认接入所有设备，或者“Include”模式，只接入指定设备。
4.  **验证**：在 HA 概览页确认能控制米家灯、插座、风扇等。

## 3. 步骤二：配置 HomeKit Bridge (YAML 模式)

虽然 UI 也可以配置 HomeKit Bridge，但强烈推荐使用 YAML 配置，因为它可以**精准过滤实体**，防止 HomeKit 变卡。

编辑 `configuration.yaml`，添加以下内容：

```yaml
homekit:
  - name: HA Bridge
    port: 21063
    filter:
      include_domains:
        - light
        - switch
        - cover  # 窗帘/车库门
        - fan
        - climate # 空调/恒温器
        - lock
        - media_player
      include_entities:
        - sensor.temperature_humidity_sensor # 只暴露特定的传感器
      exclude_entities:
        - switch.unavailable_device # 排除特定坏设备
    entity_config:
      switch.living_room_fan:
        type: fan # 将插座伪装成风扇
      switch.humidifier:
        type: humidifier # 将插座伪装成加湿器
```

*   **name**: 在家庭 App 中显示的网关名称。
*   **port**: 默认 51827，如果有多个 Bridge，端口不能冲突。
*   **filter**: 核心部分。建议只 `include_domains` 主要控制类设备，传感器按需添加。
*   **entity_config**: **这是大招**。很多米家风扇接入 HA 后是 `switch` 类型（因为是通过智能插座控制的），在 HomeKit 里显示为开关图标很丑。通过 `type: fan`，可以让它在 HomeKit 里显示为风扇图标，且支持 Siri "打开风扇" 命令。

## 4. 步骤三：配对 HomeKit

1.  重启 HA。
2.  在 HA 通知中心（左下角）会看到一个二维码和配对码（如 `123-45-678`）。
3.  打开 iPhone **家庭 App** > **+** > **添加配件** > 扫描二维码。
4.  如果是“未认证配件”，点击“强制添加”。
5.  逐个分配房间。

## 5. 进阶技巧：虚拟开关与场景触发

有时候我们需要用 Siri 触发一个复杂的 HA 脚本（比如“观影模式”：关灯、放幕布、打开投影）。HomeKit 原生不支持直接运行 HA 脚本。

**解法**：创建一个虚拟开关 (Input Boolean)。

1.  **HA 配置**：
    配置 > 辅助元素 > 创建 **开关 (Input Boolean)**，命名为 `input_boolean.movie_mode`。
2.  **HA 自动化**：
    *   触发：`input_boolean.movie_mode` 变为 `on`。
    *   动作：运行“观影模式”脚本，然后延时 1 秒，**自动把开关设回 `off`**（这就变成了一个点动按钮）。
3.  **暴露给 HomeKit**：
    这个虚拟开关会自动暴露给 HomeKit。
4.  **Apple Home**：
    你现在可以说：“嘿 Siri，打开观影模式”。

## 6. 常见问题 (Troubleshooting)

### Q1: HomeKit 显示“无响应”？
*   **网络组播**：HomeKit 依赖 mDNS (Bonjour)。确保你的路由器开启了 IGMP Snooping，且 NAS 和 HomePod/Apple TV 在同一个网段。
*   **实体过多**：如果一次性暴露超过 100 个实体，HomeKit 可能会卡死。请优化 `filter` 规则，只保留核心设备。
*   **重置配对**：如果彻底崩了，删除集成中的 HomeKit Bridge 实例，删除 `.storage/homekit_*.json` 文件，重启 HA，重新配对。

### Q2: 摄像头视频流卡顿？
*   HomeKit 对视频流编码要求极其严格（H.264, AAC）。
*   大部分米家摄像头不支持标准 RTSP。建议使用 **Scrypted** 插件（Docker 部署），它专门用于将非标摄像头转为 HomeKit Secure Video，秒开且支持人脸识别。

### Q3: 为什么设备在 HA 正常，HomeKit 不更新？
*   尝试在 HA 中手动重载 HomeKit 集成。
*   检查 HA 日志，看是否有 HomeKit 相关的报错。
