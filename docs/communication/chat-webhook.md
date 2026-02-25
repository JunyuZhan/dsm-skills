# Synology Chat 进阶：Webhook 自动化集成指南

Synology Chat 不仅仅是一个聊天工具，通过 **Webhook**，它可以成为你 NAS 的**通知中心**和**运维控制台**。相比于邮件通知，Chat 消息更及时、更安全，且完全免费。

## 1. 什么是 Webhook？

*   **Incoming Webhook (传入)**：外部服务（如 NAS 脚本、GitHub、IFTTT）向 Chat 发送消息。
    *   *场景*：NAS 掉线报警、Docker 容器重启通知、下载完成提醒。
*   **Outgoing Webhook (传出)**：Chat 向外部服务发送消息。
    *   *场景*：在聊天窗口输入 `/ip`，机器人回复当前 NAS 的公网 IP；输入 `/restart plex`，自动重启 Plex 容器。

## 2. Incoming Webhook：打造通知中心

### A. 获取 Webhook URL
1.  打开 **Synology Chat** 网页版。
2.  点击右上角 **头像** > **整合**。
3.  点击 **传入 Webhook** > **创建**。
4.  **自定义名称**：例如 "NAS Alert"。
5.  **发布频道**：选择一个频道（如 "#General"）或创建一个专用频道（如 "#Ops"）。
6.  **复制 Webhook URL**。

### B. Shell 脚本发送通知
你可以编写一个简单的 Shell 函数，在任何脚本中调用它发送通知。

```bash
#!/bin/bash

# 替换为你的 Webhook URL
CHAT_URL="https://your-nas-ip/webapi/entry.cgi?api=SYNO.Chat.External&method=incoming&version=2&token=%22YOUR_TOKEN%22"

# 发送消息函数
send_chat_msg() {
    local message="$1"
    # 使用 curl 发送 POST 请求
    # payload 需要 URL 编码，这里使用 jq 构建 JSON (需安装 jq: opkg install jq)
    # 或者简单的字符串拼接：
    payload="payload={\"text\": \"$message\"}"
    curl -X POST --data-urlencode "$payload" "$CHAT_URL"
}

# 测试
send_chat_msg "⚠️ NAS 磁盘空间不足 10%！"
```

### C. 进阶：发送带链接和图片的消息
Chat 支持部分 Markdown 语法。
*   **链接**：`[点击查看](http://google.com)`
*   **图片**：`file_url` 参数（图片必须是公网可访问的 URL）。

## 3. 实战案例：Docker 容器状态监控

我们来写一个脚本，每 5 分钟检查一次关键容器（如 `jellyfin`）是否在运行。如果挂了，自动重启并发送 Chat 通知。

1.  **编写脚本** `/volume1/scripts/monitor_docker.sh`:
    ```bash
    #!/bin/bash
    CONTAINER_NAME="jellyfin"
    CHAT_URL="你的WebhookURL"

    # 检查容器状态
    if [ "$(docker inspect -f '{{.State.Running}}' $CONTAINER_NAME)" = "false" ]; then
        echo "容器 $CONTAINER_NAME 已停止，正在重启..."
        docker start $CONTAINER_NAME
        
        # 发送通知
        curl -X POST --data-urlencode "payload={\"text\": \"🚨 警告：$CONTAINER_NAME 容器异常停止，已自动重启！\"}" "$CHAT_URL"
    fi
    ```
2.  **设置任务计划**：
    *   **控制面板** > **任务计划** > **新增** > **计划的任务** > **用户定义的脚本**。
    *   **用户**：root。
    *   **计划**：每 5 分钟运行一次。
    *   **脚本**：`bash /volume1/scripts/monitor_docker.sh`

## 4. Outgoing Webhook：简单的交互机器人

让 Chat 变成你的命令行终端。

### A. 配置传出 Webhook
1.  **整合** > **传出 Webhook** > **创建**。
2.  **自定义名称**：OpsBot。
3.  **触发词**：`!` (当消息以 ! 开头时触发)。
4.  **传出 URL**：这是你的后端服务地址（例如 `http://192.168.1.5:5000/chat`）。

### B. 搭建后端服务 (Python Flask)
我们需要一个 HTTP 服务器来接收 Chat 的 POST 请求，并执行命令。

1.  **部署 Flask 容器**：
    创建一个 `app.py`：
    ```python
    from flask import Flask, request, jsonify
    import subprocess

    app = Flask(__name__)

    @app.route('/chat', methods=['POST'])
    def chat():
        data = request.form
        text = data.get('text', '') # 获取用户发送的消息，例如 "!ip"
        
        if text == '!ip':
            # 获取公网 IP
            result = subprocess.check_output(['curl', 'ifconfig.me']).decode('utf-8')
            return jsonify({'text': f"当前公网 IP: {result}"})
            
        elif text == '!uptime':
            result = subprocess.check_output(['uptime', '-p']).decode('utf-8')
            return jsonify({'text': f"运行时间: {result}"})
            
        return jsonify({'text': "未知命令"})

    if __name__ == '__main__':
        app.run(host='0.0.0.0', port=5000)
    ```
2.  **运行容器**：
    将 `app.py` 放入 Docker 运行（需安装 Flask 和 curl）。

### C. 测试
在 Chat 窗口输入 `!ip`，机器人会立刻回复你的公网 IP。

## 5. 整合 IFTTT / Zapier

虽然 Chat 没有原生接入 IFTTT，但我们可以利用 Webhook 中转。
*   **场景**：当 RSS 订阅更新时（IFTTT Trigger），发送消息到 Chat。
*   **配置**：
    *   **IFTTT Action**: Webhooks > Make a web request。
    *   **URL**: 你的 Chat Incoming Webhook URL。
    *   **Method**: POST。
    *   **Content Type**: application/x-www-form-urlencoded。
    *   **Body**: `payload={"text": "📰 新文章发布：<<<EntryTitle>>>"}`

通过这种方式，你可以把全世界的信息流都汇聚到你的 Synology Chat 中。
