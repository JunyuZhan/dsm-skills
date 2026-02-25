# Home Assistant 深度实战

Home Assistant (HA) 是智能家居的终极大脑。它可以打破品牌壁垒，让小米、苹果、涂鸦、美的等设备协同工作。

## 1. HACS：插件商店

原版 HA 功能有限，HACS (Home Assistant Community Store) 是必装的第三方商店。

```mermaid
graph LR
    HACS[HACS 社区商店]
    Integration[集成 Integration (如 Xiaomi)]
    Frontend[前端卡片 (如 Mushroom)]
    HA[Home Assistant Core]

    HACS -- 下载 --> Integration
    HACS -- 下载 --> Frontend
    Integration -- 扩展功能 --> HA
    Frontend -- 美化界面 --> HA

    style HACS fill:#f9f,stroke:#333
    style HA fill:#bfb,stroke:#333
```

### 安装步骤
1.  **下载脚本**：SSH 进入 HA 容器。
    ```bash
    docker exec -it homeassistant bash
    wget -O - https://get.hacs.xyz | bash -
    ```
2.  **重启 HA**：在开发者工具 > 重启。
3.  **添加集成**：配置 > 设备与服务 > 添加集成 > 搜索 HACS。
4.  **GitHub 授权**：根据提示登录 GitHub 进行授权。

## 2. 接入小米设备 (Xiaomi Miot Auto)

告别米家 App 的简陋自动化。

1.  在 HACS 中搜索 **Xiaomi Miot Auto** 并安装。
2.  重启 HA。
3.  添加集成 > Xiaomi Miot Auto。
4.  **登录方式**：选择“账号登录”，输入小米账号。
5.  **筛选**：选择要接入的设备。
6.  **效果**：现在你可以用 HA 的强大自动化引擎控制米家设备了（比如：当 NAS CPU 温度 > 60度，打开小米风扇吹 NAS）。

## 3. HomeKit Bridge：让 Siri 控制一切

你有安卓手机，也有 iPad？或者你有不支持 HomeKit 的廉价设备？

*   **功能**：HA 可以模拟成一个 HomeKit 网关，把它管理的所有设备（米家、涂鸦、DIY 设备）全部“桥接”给 Apple Home。
*   **设置**：
    1.  添加集成 > **HomeKit Bridge**。
    2.  选择要暴露的域（如 switch, light, sensor）。
    3.  提交后，会生成一个 **二维码**。
    4.  打开 iPhone 的“家庭”App > 添加配件 > 扫描二维码。
*   **结果**：你现在可以用 Siri 控制几块钱的 DIY 继电器了。

## 4. 自动化 (Automation) 实战案例

### 案例 A：NAS 关机保护
*   **触发**：UPS 电量低于 20%。
*   **条件**：市电状态为“断开”。
*   **动作**：
    1.  发送通知给手机：“电量告急，正在关闭非核心设备”。
    2.  调用 `switch.turn_off` 关闭非核心 Docker 容器。
    3.  调用群晖 API 关机。

### 案例 B：回家自动开灯
*   **触发**：手机连接到家庭 Wi-Fi (device_tracker 状态变为 home)。
*   **条件**：太阳已下山 (sun.sun 为 below_horizon)。
*   **动作**：打开客厅灯，播放欢迎语音。

## 5. 面板美化 (Lovelace)

原生界面太丑？用 **Mushroom Cards** 美化。

1.  在 HACS > 前端 (Frontend) > 搜索 **Mushroom** 并安装。
2.  在仪表盘右上角 > 编辑仪表盘 > 添加卡片。
3.  选择 Mushroom Light Card / Chip Card。
4.  **效果**：打造像 Apple Home 一样优雅的控制面板，支持滑动调节亮度、颜色。

## 6. 备份与恢复

HA 的配置非常复杂，崩了就完蛋了。

*   **Docker 用户**：定期备份 `/volume1/docker/homeassistant` 整个文件夹。
*   **自动化备份**：使用脚本每天打包 config 目录并上传到云端（参考 [自动化脚本](../advanced-skills/automation-scripts.md)）。

## 7. 远程访问

*   **内网穿透**：通过 Tailscale 或 Cloudflare Tunnel 访问 HA。
*   **App 配置**：在 HA 手机 App 中，填入你的内网 IP (在家用) 和 外网域名 (在外用)。App 会自动切换。
