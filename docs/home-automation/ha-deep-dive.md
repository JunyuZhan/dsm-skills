# Home Assistant 深度实战

Home Assistant (HA) 是智能家居的终极大脑。它可以打破品牌壁垒，让小米、苹果、涂鸦、美的等设备协同工作。

## 1. HACS：插件商店

原版 HA 功能有限，HACS (Home Assistant Community Store) 是必装的第三方商店。

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
    2.  调用 switch.turn_off 关闭非核心 Docker 容器。
    3.  调用群晖 API 关机。

### 案例 B：回家模式
*   **触发**：你的手机连接到家里 Wi-Fi（基于 ASUS Router 或 Unifi 集成）。
*   **条件**：时间是晚上。
*   **动作**：
    1.  打开客厅灯。
    2.  小爱音箱播放：“欢迎主人回家”。
    3.  NAS 开启高性能模式（解除限速）。

## 5. 面板美化 (Lovelace)

原生面板太丑？

*   **Mushroom Cards**：在 HACS 前端部分搜索安装。极其精美的卡片风格。
*   **Mini Graph Card**：画出漂亮的温湿度曲线、CPU 占用曲线。
*   **Floorplan**：上传你家的户型图，直接在图上点击开关灯。

## 6. 数据库优化

HA 默认使用 SQLite，记录久了会变慢。
*   **建议**：在 Docker 中部署 **MariaDB**，并在 HA 的 `configuration.yaml` 中配置连接。
    ```yaml
    recorder:
      db_url: mysql://user:password@192.168.1.x:3306/homeassistant
      purge_keep_days: 30 # 只保留 30 天历史
    ```
