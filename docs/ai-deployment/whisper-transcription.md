# Whisper：全能语音转文字与字幕生成

NAS 不仅仅是存储，还可以利用闲置算力自动整理你的会议录音、视频素材。**Whisper** 是 OpenAI 开源的最强语音识别模型，而在 NAS 上，我们可以使用它的高性能 C++ 实现版 **Whisper.cpp**，无需昂贵的显卡也能跑得飞快。

## 1. 为什么在 NAS 上跑 Whisper？

*   **隐私安全**：会议录音、采访素材无需上传到云端 API，完全本地处理。
*   **自动化**：配合脚本，只要把录音文件丢进 NAS 文件夹，自动生成 Word 文档或 SRT 字幕。
*   **无需显卡**：Whisper.cpp 对 CPU 进行了极致优化，J4125 也能流畅运行 `base` 或 `small` 模型。

## 2. 部署方案 A：Docker (推荐)

最简单的方式是使用打包好的 Docker 镜像。

### docker-compose.yml

```yaml
version: '3.8'

services:
  whisper-webui:
    image: ghcr.io/openai/whisper-webui:latest  # 或者寻找针对 CPU 优化的镜像如 onerahmet/openai-whisper-asr-webservice
    container_name: whisper
    ports:
      - "9000:9000"
    environment:
      - ASR_MODEL=base
      - ASR_LANG=zh  # 默认中文
    volumes:
      - /volume1/docker/whisper/cache:/root/.cache/whisper
    restart: unless-stopped
```

*   **注意**：如果不使用 GPU，官方镜像可能较慢。推荐使用 **Whisper.cpp** 的二进制文件直接运行，或者使用支持 CPU 加速的轻量级镜像。

## 3. 部署方案 B：Whisper.cpp (高性能命令行)

这是目前在低功耗 NAS 上运行 Whisper 的最佳方案。

### 3.1 编译与安装
你需要先在 NAS 上安装 Docker 或通过 SSH 编译。

**推荐 Docker 镜像 (CPU 优化版)**：
```bash
docker run -it --rm \
  -v /volume1/Recordings:/app/data \
  ghcr.io/ggerganov/whisper.cpp:main \
  ./main -m models/ggml-small.bin -f /app/data/meeting.mp3 -osrt
```

### 3.2 自动化脚本 (Watch Folder)

我们创建一个脚本，监控 `/volume1/Recordings/Inbox` 文件夹，发现新录音自动转录。

1.  **准备环境**：下载 `whisper.cpp` 的 `main` 可执行文件和模型文件 (`ggml-small.bin`) 到 `/volume1/docker/whisper/`。
2.  **编写脚本 `auto_transcribe.sh`**：

```bash
#!/bin/bash

WATCH_DIR="/volume1/Recordings/Inbox"
OUTPUT_DIR="/volume1/Recordings/Transcribed"
MODEL="/volume1/docker/whisper/models/ggml-small.bin"
WHISPER_BIN="/volume1/docker/whisper/main"

# 监控 MP3/WAV/M4A 文件
inotifywait -m -e close_write --format '%w%f' "$WATCH_DIR" | while read FILE
do
    EXT="${FILE##*.}"
    if [[ "$EXT" == "mp3" || "$EXT" == "wav" || "$EXT" == "m4a" ]]; then
        FILENAME=$(basename "$FILE")
        echo "Detected new file: $FILENAME"
        
        # 开始转录 (输出 SRT 和 TXT)
        $WHISPER_BIN -m "$MODEL" -f "$FILE" -osrt -otxt -l zh
        
        # 移动源文件和结果到完成目录
        mv "$FILE" "$OUTPUT_DIR/"
        mv "${FILE}.srt" "$OUTPUT_DIR/"
        mv "${FILE}.txt" "$OUTPUT_DIR/"
        
        # 发送通知 (可选)
        synodsmnotify @administrators "Whisper 转录完成" "文件 $FILENAME 已处理完毕"
    fi
done
```

3.  **后台运行**：使用 `nohup` 或群晖任务计划运行该脚本。

## 4. 实战场景

### 场景一：自动为美剧生成字幕
*   配合 **Sonarr/Radarr** 下载的美剧。
*   脚本自动扫描无字幕的视频文件。
*   调用 Whisper 生成 `.srt` 字幕文件。
*   Jellyfin/Plex 自动挂载字幕。

### 场景二：会议记录整理
*   手机录音 (Voice Memos) 自动同步到 NAS (通过 Synology Drive 或 Photo Backup)。
*   NAS 自动转录为 TXT。
*   再调用 **Ollama (Llama 3)** 总结会议纪要：“请总结这篇会议记录的三个核心观点”。
*   最终生成一份完美的会议摘要发到你的邮箱。

## 5. 模型选择建议

| 模型 | 参数量 | 内存需求 | 速度 (J4125) | 准确率 (中文) | 推荐场景 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tiny** | 39 M | ~500 MB | 极快 (<1x) | 较差 | 语音指令 |
| **Base** | 74 M | ~1 GB | 快 (1x) | 一般 | 简单对话 |
| **Small** | 244 M | ~2 GB | 中等 (2x) | **良好** | **推荐日常使用** |
| **Medium** | 769 M | ~5 GB | 慢 (5x) | 优秀 | 复杂会议、专业术语 |
| **Large** | 1550 M | ~10 GB | 极慢 (10x) | 极致 | 字幕组压制 |

*   对于大多数 NAS，**Small** 模型是速度与准确率的最佳平衡点。
