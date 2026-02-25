# 家庭自动化与 IoT 指南

NAS 是家庭数据的中心，也可以成为智能家居的大脑。

## 1. Home Assistant: Docker vs VMM
- **Docker (推荐)**：
    - **优点**：轻量，CPU 占用极低 (1%)，启动快。
    - **缺点**：没有 Supervisor (Add-on 商店)，配置 HACS 稍麻烦。
    - **适合**：有一定动手能力，追求性能的用户。
- **VMM (虚拟机)**：
    - **优点**：完整的 HAOS 体验，一键备份还原，支持 Add-on。
    - **缺点**：吃内存 (至少 2GB)，CPU 占用较高。
    - **适合**：新手，或者不想折腾配置文件的用户。

## 2. MQTT Broker (Mosquitto)
- **作用**：智能家居设备之间的通信桥梁。
- **部署**：推荐使用 Docker 部署 `eclipse-mosquitto`。
- **配置**：务必开启密码验证，不要裸奔。配合 Home Assistant 的 MQTT 集成使用。

## 3. Homebridge / Scrypted
- **Homebridge**：让不支持 HomeKit 的老设备（米家、Tuya）接入 Apple 家庭 App。
- **Scrypted**：专注于摄像头接入 HomeKit Secure Video (HKSV)。
    - **优势**：性能极强，几乎零延迟，支持人脸识别上传 iCloud。
    - **推荐**：如果有摄像头需求，优先用 Scrypted。

## 4. Zigbee/Z-Wave 网关接入
- **问题**：Docker 容器很难直接读取 USB 设备。
- **解决**：
    - **Docker**：使用 `privileged` 模式，或者映射 `/dev/ttyUSB0`。
    - **驱动**：DSM 7.0 移除了很多 USB 驱动。可能需要手动加载 `cp210x.ko` 或 `ch341.ko` 模块 (根据你的 USB 棒芯片)。

## 5. Node-RED 自动化
- **功能**：可视化流程编排。
- **场景**：比 HA 自带的自动化更强大。例如：
    - "当 手机连接 Wi-Fi 且 时间是晚上 -> 打开门厅灯"
    - "当 NAS 温度 > 60度 -> 发送 Telegram 报警并关机"

## 6. NAS 状态监控接入 HA
- **集成**：Home Assistant 自带 **Synology DSM** 集成。
- **功能**：
    - 在 HA 仪表盘显示：CPU 使用率、硬盘温度、存储空间、下载速度。
    - **自动化**：当“下载完成”时，通过 HA 播放语音播报“主人，电影下载好了”。

## 7. ESPHome
- **玩法**：自己动手做智能硬件 (基于 ESP8266/ESP32)。
- **结合**：在 NAS 上部署 ESPHome Dashboard (Docker)，可以在网页上编写 YAML 配置文件，无线 OTA 刷写固件。

## 8. 蓝牙网关
- **限制**：Synology 不支持蓝牙适配器。
- **方案**：使用 **ESP32** 刷写 ESPHome 固件，作为蓝牙代理 (Bluetooth Proxy)，将蓝牙信号转为 WiFi 发送给 Home Assistant。

## 9. 语音助手集成
- **Siri (HomeKit)**：通过 Home Assistant 的 HomeKit Bridge 集成。
- **小爱同学**：通过巴法云 (Bemfa) 或 Blinker 接入。

## 10. 能源监控
- **场景**：统计家里用电量。
- **方案**：
    - 购买支持 P1 接口或 CT 互感器的电量计。
    - 接入 Home Assistant 的 Energy 面板。
    - 配合 NAS 的 UPS 数据，统计服务器的耗电成本。
