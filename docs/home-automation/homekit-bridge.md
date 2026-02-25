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
*   **filter**: 最关键的部分。只包含你真正想在 HomeKit 里看到的设备。
*   **entity_config**: 修改设备类型。
    *   *场景*：你把电风扇插在了小米智能插座上。在 HA 里它是个 `switch`（开关）。在 HomeKit 里，你想让它显示为风扇图标，而不是插座图标。
    *   *做法*：`type: fan`。

## 4. 步骤三：iOS 配对

1.  **重启 HA**：配置生效。
2.  **通知中心**：HA 左下角通知中心会弹出一个 **QR Code** (二维码) 和配对码。
3.  **家庭 App**：
    *   打开 iPhone > 家庭 > 添加配件。
    *   扫描屏幕上的二维码。
    *   如果提示“未认证的配件”，点击“仍要添加”。
4.  **分配房间**：将设备分配到对应的房间。

## 5. 进阶技巧

### A. 多个 Bridge 分流 (解决 150 个配件限制)
HomeKit 协议规定一个网关最多带 150 个配件。如果你家豪宅设备太多，或者为了提高响应速度，可以开多个 Bridge。

```yaml
homekit:
  - name: HA Lights
    port: 21063
    filter:
      include_domains:
        - light

  - name: HA Sensors
    port: 21064
    filter:
      include_domains:
        - sensor
```
这样你会得到两个二维码，分别扫码添加。

### B. 重置配对
如果 HomeKit 显示“无响应”且无法恢复：
1.  在家庭 App 中删除该网关。
2.  删除 HA 配置目录下的 `.homekit.state` 文件。
3.  重启 HA。
4.  重新扫码配对。

### C. 延迟启动
如果你的 HA 启动时米家设备还没准备好，HomeKit 可能会漏掉设备。
```yaml
homekit:
  - name: HA Bridge
    ip_address: 192.168.1.100
    # 等待 Z-Wave/Zigbee 网络就绪后再启动 HomeKit 服务
```
通常不需要手动设置，HA 现在会自动处理。

## 6. 常见问题

*   **Q: 为什么设备在 HomeKit 里名字乱了？**
    *   A: 首次同步后，HomeKit 会记住名字。后续在 HA 改名不会自动同步过去。需要在家庭 App 里手动改名。
*   **Q: 为什么一直“更新中...”？**
    *   A: 通常是网络组播 (mDNS) 问题。
        *   检查路由器是否开启了 IGMP Snooping（建议关闭或尝试开启）。
        *   NAS 的防火墙是否放行了 21063 端口 (TCP) 和 5353 端口 (UDP)。
