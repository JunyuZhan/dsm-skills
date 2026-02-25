# AI 大模型本地部署指南 (Local AI)

NAS 不仅是存储，只要内存够大，它就是你的私人 AI 算力中心。通过 Ollama，我们可以在 NAS 上轻松运行 Llama 3、Qwen 等大语言模型，打造完全隐私的“私人 ChatGPT”。

## 1. 硬件准备

AI 对硬件有一定要求，并非所有 NAS 都能跑。

*   **CPU**：必须支持 **AVX2** 指令集（J4125、N5105、AMD Ryzen 系列均支持）。老旧 CPU（如 J3455）可能无法运行或极慢。
*   **内存 (RAM)**：
    *   **8GB**：勉强运行 7B (70 亿参数) 模型。
    *   **16GB+**：推荐配置。可以流畅运行 7B/14B 模型，或者更大量级的量化模型。
*   **GPU (可选)**：如果你的 NAS 有独显（如 DVA3221 或 PCIe 扩展卡），Ollama 支持调用 GPU 加速，速度提升 10 倍以上。

## 2. 部署 Ollama (后端核心)

Ollama 是目前最流行的本地 LLM 运行时工具。

### Docker Compose 部署
```yaml
services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    ports:
      - "11434:11434"
    volumes:
      - /volume1/docker/ollama:/root/.ollama
    restart: always
    # 如果你有 NVIDIA 显卡，取消下面注释
    # deploy:
    #   resources:
    #     reservations:
    #       devices:
    #         - driver: nvidia
    #           count: 1
    #           capabilities: [gpu]
```

### 下载模型
容器启动后，需要下载模型才能使用。
1.  **SSH 进入 NAS**。
2.  进入容器：`docker exec -it ollama bash`
3.  下载模型：
    *   **Llama 3 (8B)**：`ollama run llama3` (英文能力强)
    *   **Qwen 2 (7B)**：`ollama run qwen2` (通义千问，中文能力极佳)
    *   **Gemma 2 (9B)**：`ollama run gemma2` (谷歌出品)

## 3. 部署 Open WebUI (前端界面)

光有后端不行，我们需要一个类似 ChatGPT 的漂亮界面。Open WebUI (原 Ollama WebUI) 是最佳选择。

### Docker Compose 部署
```yaml
services:
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    ports:
      - "3000:8080"
    environment:
      - OLLAMA_BASE_URL=http://192.168.1.x:11434 # 填 NAS 的局域网 IP
    volumes:
      - /volume1/docker/open-webui:/app/backend/data
    restart: always
```

## 4. 进阶玩法：RAG (知识库问答)

Open WebUI 自带 **RAG (检索增强生成)** 功能。你可以把你的 PDF 文档、Markdown 笔记喂给它，让 AI 基于你的私有数据回答问题。

1.  打开 Open WebUI 网页 (`http://NAS_IP:3000`)。
2.  点击左侧 **Documents**。
3.  上传你的 PDF/TXT 文件（例如《群晖 DSM 说明书》）。
4.  在聊天框输入 `#` 号，选择刚才上传的文档集合。
5.  提问：“怎么修复 RAID？”AI 会根据说明书内容回答你，且不会产生幻觉。

## 5. 远程访问

*   配合 **Tailscale** 或 **Cloudflare Tunnel**，你可以在手机上随时随地访问家里的私有 AI。
*   Open WebUI 适配了移动端界面，体验极佳。

## 6. 注意事项

*   **CPU 占用**：推理时 CPU 会瞬间飙升到 100%，这是正常的。建议限制容器的 CPU 权重，防止影响 NAS 其他服务。
*   **模型大小**：不要贪大。NAS 这种纯 CPU 推理环境，**7B 或 8B 的 Q4_K_M 量化版本**是速度与质量的最佳平衡点。尝试运行 70B 模型会让你的 NAS 卡死。
