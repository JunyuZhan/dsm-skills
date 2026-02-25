# Surveillance Station 进阶：自动化与集成

Surveillance Station (SS) 不仅仅是录像机，它还是一个强大的物联网 (IoT) 中心。通过 **行动规则**、**CMS** 和 **API**，你可以让监控系统“活”起来。

## 1. CMS (集中化管理系统)

如果你有多个地点的监控（如家、父母家、店铺），不需要分别登录三台 NAS。

1.  **主机 (Host)**：选择性能最强的一台 NAS 作为 CMS 主机。安装 **CMS** 套件（在 SS 内部的应用中心）。
2.  **录像服务器 (Recording Server)**：在其他 NAS 上启用 SS。
3.  **添加**：在主机的 CMS 界面添加录像服务器。
4.  **效果**：
    *   **统一画面**：在一个屏幕上同时看三个地方的监控。
    *   **许可证共享**：所有 NAS 的免费许可证汇聚到一个池子里。例如 3 台 NAS = 6 个免费授权，你可以全部用在一台机器上。
    *   **故障转移**：如果一台 NAS 挂了，CMS 可以让另一台 NAS 接管它的摄像头（需额外配置）。

## 2. 行动规则 (Action Rules)

这是 SS 的“自动化引擎”，类似于 IFTTT。

### 场景 A：有人按门铃 -> 弹出画面
*   **事件**：摄像头检测到运动（或门铃被按下）。
*   **动作**：在 Surveillance Station Client 电脑端自动弹窗显示该摄像头的实时画面。

### 场景 B：离家模式 -> 开启录像
*   **事件**：进入 Home Mode（离家）。
*   **动作**：启用所有室内摄像头的录像计划。

### 场景 C：Webhook 集成
*   **事件**：摄像头检测到入侵。
*   **动作**：发送 Webhook 到 ServerChan/Telegram，推送到手机。

## 3. I/O 模块与物理联动

SS 支持连接 I/O 控制器（如 Axis 模块）。
*   **输入**：连接红外探头、烟雾报警器、门磁。
*   **输出**：连接警报器、电磁门锁、灯光。
*   **联动**：当烟雾报警器触发（输入） -> SS 控制所有摄像头转向该区域录像 -> 打开警报器（输出） -> 解锁逃生门（输出）。

## 4. API 开发集成

Surveillance Station 提供了非常完善的 Web API。

### 获取实时快照 (Snapshot)
你可以把摄像头的快照嵌入到自己的网页或 Home Assistant Dashboard 中。

URL 格式：
`http://nas-ip:5000/webapi/SurveillanceStation/camera.cgi?api=SYNO.SurveillanceStation.Camera&method=GetSnapshot&version=1&cameraId=1&_sid=你的SID`

### 自动 PTZ 巡航
如果你的摄像头支持 PTZ (云台)，可以通过 API 控制它定时转向不同角度。
`http://nas-ip:5000/webapi/SurveillanceStation/ptz.cgi?api=SYNO.SurveillanceStation.PTZ&method=Move&version=1&cameraId=1&direction=home`

## 5. 深度视频分析 (DVA 系列独占)

如果你使用的是 DVA3221 / DVA1622，你可以开启 AI 分析任务：
*   **人脸识别**：建立 VIP 和黑名单数据库。
*   **车牌识别**：联动道闸系统，自动抬杆。
*   **人数统计**：统计商场客流热力图。
*   **入侵检测**：划定虚拟围栏，只有在特定时间翻越围栏才报警（比普通移动检测更准）。
