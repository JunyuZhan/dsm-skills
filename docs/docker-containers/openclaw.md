# OpenClaw 本地 AI 智能体部署

[OpenClaw](https://github.com/openclaw/openclaw) (又名 Clawbot) 是一个基于“龙虾”理念的个人 AI 助手。它可以像 AutoGPT 一样自主执行任务，但更轻量、更易于部署。

## 1. 部署 OpenClaw (Docker)

OpenClaw 官方提供了 Docker 镜像，部署非常简单。

### Docker Compose 配置

创建一个 `docker-compose.yml` 文件：

```yaml
services:
  openclaw:
    image: ghcr.io/phioranex/openclaw-docker:latest
    container_name: openclaw
    restart: unless-stopped
    ports:
      - "18789:18789" # Web 界面端口
    volumes:
      - ./config:/home/node/.openclaw # 配置文件持久化
      - ./workspace:/home/node/.openclaw/workspace # 任务工作区
    environment:
      - OPENCLAW_API_KEY=sk-xxxx # (可选) 如果你有 OpenClaw Cloud 的 Key
```

### 启动与初始化
1.  `docker-compose up -d` 启动容器。
2.  查看日志：`docker logs -f openclaw`。
3.  首次启动可能需要初始化。如果日志提示运行 setup，可以使用：
    ```bash
    docker exec -it openclaw openclaw onboard
    ```
4.  访问 Web 界面：`http://NAS_IP:18789`。

## 2. 配置 LLM 后端

OpenClaw 需要一个大语言模型作为大脑。

*   **OpenAI**: 直接在设置中填入 API Key。
*   **Ollama (本地)**:
    *   如果你按照[AI 大模型本地部署指南](local-ai.md)部署了 Ollama。
    *   在 OpenClaw 设置中，LLM Provider 选择 `Ollama`。
    *   Base URL 填入 `http://192.168.1.x:11434` (注意不要填 `localhost`，因为是在容器内部)。
    *   Model 填入 `llama3` 或 `qwen2`。

## 3. 技能 (Skills) 安装

OpenClaw 的强大之处在于它可以调用工具。

*   **Web Search**: 允许 AI 联网搜索（需配置 Google/Bing API）。
*   **File System**: 允许 AI 读写 NAS 上的文件（通过挂载的 workspace 目录）。
*   **Shell**: 允许 AI 执行 Shell 命令（**高风险**，建议仅在沙箱环境开启）。

### 安装技能
进入容器安装 npm 包：
```bash
docker exec -it openclaw npm install -g @openclaw/skill-browser
```
然后在配置文件 `config.yml` 中启用该技能。

## 4. 自动化任务示例

你可以对 OpenClaw 说：
> "帮我每天早上 8 点搜索最新的『群晖 NAS』新闻，总结成日报，并保存到 workspace 目录下的 `daily_news.md` 文件中。"

OpenClaw 会：
1.  调用搜索工具。
2.  阅读网页内容。
3.  调用 LLM 总结。
4.  调用文件写入工具保存文件。
