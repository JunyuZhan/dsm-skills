# Stable Diffusion on NAS：打造私人 AI 绘画工作室

群晖 NAS 不仅仅是存照片的，它完全可以成为你的私人 AI 绘画服务器。虽然大多数 NAS 没有强劲的独立显卡，但通过合理的配置和优化，我们依然可以运行 **Stable Diffusion**，或者将其作为高性能 PC 的模型仓库。

本指南将介绍两种方案：
1.  **NAS 直跑方案**：适合拥有 DVA 系列（带显卡）或高性能 CPU 机型的用户。
2.  **存储分离方案**：适合普通 NAS 用户，NAS 存模型，PC 跑计算。

## 方案一：NAS 直跑 (Docker 部署)

### 1. 硬件要求

*   **CPU**：必须支持 AVX2 指令集（J4125, N5105, AMD Ryzen 等）。
*   **内存**：至少 16GB（SDXL 模型极其吃内存）。
*   **显卡 (可选)**：
    *   **NVIDIA 显卡**：支持 DVA3221 或 PCIe 扩展卡，速度快。
    *   **无显卡 (CPU 模式)**：速度较慢（生成一张图约 1-5 分钟），但可用。

### 2. 部署 Stable Diffusion WebUI (Automatic1111)

我们将使用 Docker 部署最流行的 SD WebUI。

#### docker-compose.yml

```yaml
version: '3.8'

services:
  sd-webui:
    image: universityofwa/stable-diffusion-webui:latest
    container_name: sd-webui
    ports:
      - "7860:7860"
    volumes:
      - /volume1/docker/sd-webui/data:/data
      - /volume1/docker/sd-webui/outputs:/output
      - /volume1/docker/sd-webui/models:/models
    environment:
      - CLI_ARGS=--listen --api --no-half --precision full --skip-torch-cuda-test
    # 如果你有 NVIDIA 显卡，请取消下方注释并删除上面的 CLI_ARGS
    # deploy:
    #   resources:
    #     reservations:
    #       devices:
    #         - driver: nvidia
    #           count: 1
    #           capabilities: [gpu]
    # environment:
    #   - CLI_ARGS=--listen --api
    restart: unless-stopped
```

*   **CLI_ARGS 说明**：
    *   `--listen`：允许局域网访问。
    *   `--no-half` / `--precision full`：CPU 模式下必须开启，防止精度错误。
    *   `--skip-torch-cuda-test`：CPU 模式下跳过显卡检测。

### 3. 模型管理

Docker 启动后，你需要下载模型文件（.safetensors）放入 `/volume1/docker/sd-webui/models/Stable-diffusion` 目录。

*   **推荐模型**：
    *   **DreamShaper** (通用性好)
    *   **ChilloutMix** (真人质感)
    *   **SDXL Turbo** (速度极快，适合 CPU 用户尝试)

## 方案二：ComfyUI (轻量级/工作流)

相比 WebUI，ComfyUI 资源占用更低，启动更快，且支持节点式工作流。

### docker-compose.yml

```yaml
version: '3.8'

services:
  comfyui:
    image: yanwk/comfyui-boot:cpu  # CPU 版本，N卡用户请换成 latest
    container_name: comfyui
    ports:
      - "8188:8188"
    volumes:
      - /volume1/docker/comfyui/storage:/root/ComfyUI/output
      - /volume1/docker/comfyui/models:/root/ComfyUI/models
    restart: always
```

## 方案三：NAS 作为模型仓库 (最推荐)

对于大多数使用 J4125/N5105 的用户，NAS 跑图实在太慢。更高效的方案是：**PC 跑图，NAS 存图和模型**。

### 痛点
一张 SDXL 模型 6GB，加上各种 LoRA、ControlNet，轻松占用 500GB 空间。你的 MacBook 或 PC 硬盘很快就红了。

### 解决方案：符号链接 (Symbolic Link)

我们把 WebUI/ComfyUI 的 `models` 文件夹映射到 NAS。

#### Windows 步骤
1.  在 NAS 创建共享文件夹 `/volume1/AI_Models`。
2.  在 Windows 上挂载为 `Z:` 盘。
3.  删除本地 WebUI 的 `models` 文件夹。
4.  以管理员身份打开 CMD：
    ```cmd
    mklink /D "C:\sd-webui\models" "Z:\models"
    ```

#### macOS 步骤
1.  挂载 NAS 到 `/Volumes/AI_Models`。
2.  终端运行：
    ```bash
    ln -s /Volumes/AI_Models/models ~/sd-webui/models
    ```

### 优势
*   **无限空间**：随便下载 Civitai 上的模型，不用担心塞满电脑。
*   **多端同步**：台式机和笔记本共享同一套模型库，无需重复下载。
*   **自动归档**：生成的图片直接存入 NAS，配合 Synology Photos 管理和展示。

## 4. 远程访问与 API 调用

如果你在 NAS 上成功部署了 SD (方案一/二)，你可以通过 **Tailscale** 实现远程画图。

1.  手机连接 Tailscale。
2.  浏览器访问 `http://nas-ip:7860`。
3.  **配合 iOS 快捷指令**：
    *   SD WebUI 开启 `--api` 参数。
    *   使用 iOS 快捷指令调用 NAS 上的 SD API，实现“Siri，帮我画一只猫”。

## 总结

*   **高性能 NAS**：直接 Docker 跑 ComfyUI，享受 24 小时在线的 AI 绘画服务。
*   **普通 NAS**：做完美的模型仓库和产出物归档中心，让算力回归 PC。
