# Synology Chat 机器人与集成指南

Synology Chat 不仅仅是一个聊天工具，通过 Webhook 和机器人，它可以成为你的**通知中心**和**运维控制台**。

## 1. Incoming Webhook (消息推送)
最简单的集成方式，向 Chat 发送消息。
- **场景**：NAS 掉线报警、GitHub 代码提交通知、股票价格提醒。
- **配置**：Chat >以此用户头像 > 整合 > 传入 Webhook > 创建。
- **使用 (Curl)**：
    ```bash
    curl -X POST \
    --data-urlencode 'payload={"text": "Hello World"}' \
    "https://your-nas/webapi/entry.cgi?api=SYNO.Chat.External&method=incoming&version=2&token=YOUR_TOKEN"
    ```
- **进阶**：支持 Markdown 链接 `[Link](url)`，但不支持复杂的富文本。

## 2. Outgoing Webhook (交互式机器人)
让 Chat 能“听懂”你的指令。
- **场景**：在聊天窗口输入 `/ip`，机器人回复当前 NAS 的公网 IP。
- **原理**：Chat 将你的消息 POST 给一个外部 HTTP 服务器，服务器处理后返回 JSON。
- **配置**：Chat > 整合 > 传出 Webhook。
    - **触发词**：例如 `!` 或 `/`。
- **后端**：可以使用 Docker 部署一个简单的 Python Flask 或 Node.js 服务来处理请求。

## 3. 机器人 (Bots)
- **区别**：Webhook 是被动的，Bot 是主动的账号。
- **技巧**：创建一个专门的“运维机器人”账号，专门用来发送系统通知，避免和真人混淆。

## 4. 斜杠命令 (Slash Commands)
- **技巧**：虽然 Chat 官方叫“斜杠命令”，但实际上是通过 Outgoing Webhook 实现的。
- **案例**：
    - `/docker restart jellyfin`：重启容器。
    - `/wol pc`：唤醒电脑。

## 5. 整合第三方服务 (IFTTT / Zapier)
- **技巧**：虽然 Chat 没有直接接入 IFTTT，但可以通过 Webhook 中转。
- **流程**：IFTTT (Trigger) -> Webhook (Action) -> Synology Chat Incoming URL。

## 6. 发送文件与图片
- **限制**：Incoming Webhook 主要发送文本。
- **技巧**：如果需要发送图片（如监控截图），可以在 payload 中使用 `file_url` 参数（图片必须是公网可访问的 URL）。

## 7. 频道管理与权限
- **私有频道**：适合敏感通知（如 SSH 登录报警）。
- **公有频道**：适合通用的公告（如“今晚服务器维护”）。
- **技巧**：Webhook 可以绑定到特定频道，也可以绑定到特定用户。

## 8. 结合 Task Scheduler (任务计划)
- **脚本**：编写 Shell 脚本监控磁盘空间，当空间 < 10% 时，通过 `curl` 调用 Chat Webhook 发送报警。
- **代码片段**：
    ```bash
    #!/bin/bash
    USAGE=$(df -h /volume1 | awk 'NR==2 {print $5}' | tr -d '%')
    if [ "$USAGE" -gt 90 ]; then
        curl -X POST --data-urlencode 'payload={"text": "⚠️ 警告：磁盘空间不足！当前使用率：'$USAGE'%"}' "YOUR_WEBHOOK_URL"
    fi
    ```

## 9. 桌面客户端快捷键
- **技巧**：
    - `Ctrl + K`：快速跳转频道（类似 Slack）。
    - `Up` 键：编辑上一条消息。
    - `Ctrl + F`：搜索聊天记录。

## 10. 消息加密
- **功能**：Chat 支持端到端加密频道。
- **注意**：加密频道**不支持** Webhook 和机器人。如果需要机器人功能，必须使用普通频道。
