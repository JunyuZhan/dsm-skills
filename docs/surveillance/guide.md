# Surveillance Station 监控指南

Surveillance Station 是 Synology 最强大的套件之一，它能将你的 NAS 变成专业的 NVR (网络视频录像机)。

## 1. 免费许可证策略
- **现状**：每台 Synology NAS 默认附带 **2 个** 免费摄像头许可证。
- **技巧**：
    - 如果你有旧的闲置群晖（即使是白群晖），可以将它们的许可证迁移到新机器上（需在旧机器上删除，在新机器上添加）。
    - **CMS (集中化管理系统)**：如果你有多台 NAS，可以通过 CMS 将所有 NAS 的摄像头集中在一个界面管理，充分利用每台机器的免费授权，而无需购买额外授权。

## 2. 摄像头选购建议
- **协议**：优先选择支持 **ONVIF** 协议的摄像头（海康、大华、TP-Link 等主流品牌都支持）。
- **避坑**：小米、360 等云台摄像机通常**不支持** ONVIF/RTSP，无法接入 Surveillance Station（除非刷第三方固件）。
- **推荐**：TP-Link (普联) 的 IPC 系列性价比极高，且完美支持 ONVIF。

## 3. 节省存储空间的技巧
- **H.265 (HEVC)**：务必在摄像头后台和 SS 设置中开启 H.265 编码，相比 H.264 可节省 50% 硬盘空间。
- **智能动态帧率**：设置在画面静止时降低帧率（如 5fps），画面有动作时恢复高帧率（如 25fps）。
- **仅侦测录像**：只在检测到运动时才录像，全天 24 小时录像非常浪费空间且检索困难。

## 4. 智能动作侦测 (Smart Motion Detection) 进阶
- **痛点**：传统移动侦测误报率极高，风吹草动、光线变化都会触发录像，导致一天几百条无效报警。
- **解决方案**：
    1.  **AI 摄像机联动**：
        - 如果你的摄像头本身支持 AI 人形/车辆检测（如海康威视智谱系列），在 SS 中添加摄像头时，**事件检测源** 选择 "By Camera" (由摄像机)。这样 SS 只会接收摄像头处理过的高精度报警。
    2.  **SS 本地算法**：
        - 如果是普通摄像头，在 SS 中启用 **Advanced Event (高级事件)**。虽然不如专业 AI 准，但比像素对比法好很多。
    3.  **第三方 AI 插件 (Scrypted / Frigate)**：
        - **进阶玩法**：在 Docker 中部署 Scrypted 或 Frigate，将摄像头流推给它们进行 AI 分析（支持 Apple HomeKit Secure Video），只把精准的事件录像回传给 SS 或 Home Assistant。

## 5. Home Assistant 深度集成
- **场景**：当摄像头检测到有人时，自动开灯；或者离家模式下有人闯入，自动播放警报音。
- **步骤**：
    1.  在 Home Assistant 中安装 **Synology DSM** 集成。
    2.  输入 NAS IP、端口、用户名（建议新建专用账号）、密码。
    3.  勾选 "Surveillance Station"。
    4.  **自动化示例**：
        ```yaml
        trigger:
          platform: state
          entity_id: binary_sensor.camera_motion
          to: 'on'
        condition:
          condition: state
          entity_id: group.family
          state: 'not_home'
        action:
          service: notify.mobile_app
          data:
            message: "有人闯入！"
        ```

## 6. Home Mode (居家模式)
- **场景**：你在家时不想被摄像头一直盯着，或者不想一直收到报警推送。
- **技巧**：
    - 设置 **Geofence (地理围栏)**：当你的手机连接家里 Wi-Fi 或进入 GPS 范围时，自动进入 Home Mode。
    - **规则**：在 Home Mode 下，可以设置停止录像、关闭通知，或者降低录像分辨率。
    - **联动 HA**：通过 Home Assistant 的位置追踪来自动切换 SS 的 Home Mode，比 DS cam 自带的围栏更省电、更准。

## 6. 延时摄影 (Time Lapse)
- **功能**：Surveillance Station 自带“智能延时”功能。
- **玩法**：你可以把一整天的监控录像自动压缩成几分钟的延时视频，非常适合记录风景、工地进度或孩子在客厅的一天。

## 7. 手机端 DS cam 优化
- **技巧**：
    - **多路查看**：DS cam 支持同时查看多路直播。
    - **时间线回放**：新版 App 支持类似相册的时间线快速回放。
    - **硬件解码**：在设置中开启硬件解码，减少手机发热。

## 8. 桌面客户端 (Synology Surveillance Station Client)
- **建议**：不要用浏览器看监控（占用 CPU 高，且可能不支持 H.265）。
- **技巧**：下载官方的桌面客户端，支持 GPU 加速，操作更流畅，且支持多屏幕显示。

## 9. 鱼眼矫正 (Dewarping)
- **场景**：如果你用的是全景/鱼眼摄像头。
- **技巧**：在 SS 中配置挂载方式（吸顶/壁挂），软件会自动把鱼眼画面矫正为正常的平铺画面。

## 10. 异地备份与云同步
- **安全**：万一小偷把 NAS 也偷走了怎么办？
- **策略**：
    - **C2 Surveillance**：Synology 官方的云录像服务，实时上传关键片段。
    - **双重录像**：在 CMS 模式下，可以设置主服务器和录像服务器同时录像。
    - **脚本备份**：使用脚本定期将当天的录像上传到百度网盘或阿里云盘。
