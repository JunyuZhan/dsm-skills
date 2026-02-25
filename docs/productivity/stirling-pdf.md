# Stirling-PDF：全能 PDF 办公瑞士军刀

在工作中，我们经常需要处理 PDF：拆分、合并、转 Word、加水印、OCR 文字识别... 以前你可能需要购买 Adobe Acrobat，或者冒着隐私泄露的风险上传到 SmallPDF 等在线网站。

现在，你可以在 NAS 上部署 **Stirling-PDF**，拥有一个完全私有、免费、功能强大的 PDF 工具箱。

## 为什么选择 Stirling-PDF？

*   **全能工具箱**：包含 40+ 种 PDF 工具（合并、拆分、旋转、OCR、转换、加水印、签名、加密...）。
*   **完全私有**：所有文件都在本地 NAS 处理，不经过任何第三方服务器，保护商业机密。
*   **Web 界面**：无需安装客户端，浏览器打开即用，支持多语言（含中文）。
*   **Docker 部署**：一键安装，升级方便。

## 1. 部署 Stirling-PDF (Docker Compose)

Stirling-PDF 支持多种 OCR 语言包，建议使用完整的 Docker 镜像。

### 准备工作
1.  在 `/volume1/docker/` 下创建 `stirling-pdf` 目录。
2.  创建 `docker-compose.yml`。

```yaml
version: '3.3'
services:
  stirling-pdf:
    image: frooodle/s-pdf:latest
    container_name: stirling-pdf
    ports:
      - 8080:8080
    volumes:
      - /volume1/docker/stirling-pdf/trainingData:/usr/share/tessdata # OCR 训练数据持久化
      - /volume1/docker/stirling-pdf/extraConfigs:/configs
      - /volume1/docker/stirling-pdf/logs:/logs
    environment:
      - DOCKER_ENABLE_SECURITY=false
      - INSTALL_BOOK_AND_ADVANCED_HTML_OPS=false
      - SYSTEM_DEFAULT_LOCALE=zh_CN
    restart: unless-stopped
```

### 关键配置
*   `SYSTEM_DEFAULT_LOCALE=zh_CN`: 设置默认语言为简体中文。
*   `/usr/share/tessdata`: 如果你需要更好的中文 OCR 效果，可以手动下载 `chi_sim.traineddata` 放入此目录。

## 2. 核心功能实战

启动后访问 `http://nas-ip:8080`，你会看到琳琅满目的工具图标。

### 2.1 PDF 合并与拆分
*   **合并**：拖入多个 PDF 文件，调整顺序，一键生成一个新文件。
*   **拆分**：按页码拆分、按大小拆分，或者提取特定页面。

### 2.2 OCR 文字识别
这是最常用的功能之一。
1.  上传扫描版的 PDF 或图片。
2.  选择源语言（如 Chinese Simplified）。
3.  点击处理。
4.  几秒钟后，原本无法选中的文字变成了可复制的文本，甚至可以搜索。

### 2.3 格式转换
*   **PDF 转 Word/Excel/PPT**：虽然排版可能不如 Adobe 完美，但对于提取内容完全够用。
*   **图片 转 PDF**：将身份证正反面照片合并为一个 A4 PDF。
*   **HTML 转 PDF**：输入网址，直接保存为 PDF。

### 2.4 安全与签名
*   **加密**：给工资单 PDF 加上密码。
*   **签名**：在 PDF 上手写签名，或者加盖电子公章（PNG 图片）。
*   **水印**：给机密文档加上“绝密”水印，防止截屏泄露。

## 3. 进阶玩法：API 调用

Stirling-PDF 不仅有 Web 界面，还提供了丰富的 REST API。如果你是开发者，或者想结合 n8n/Node-RED 自动化工作流，可以直接调用它的 API。

*   API 文档地址：`http://nas-ip:8080/swagger-ui/index.html`

### 示例：自动加水印
你可以编写一个脚本，监控某个文件夹。当有新 PDF 放入时，自动调用 Stirling-PDF API 加上水印，然后保存到另一个文件夹。

```bash
curl -X POST "http://nas-ip:8080/api/v1/security/watermark" \
  -H "accept: application/pdf" \
  -H "Content-Type: multipart/form-data" \
  -F "fileInput=@test.pdf" \
  -F "text=CONFIDENTIAL" \
  -o "watermarked.pdf"
```

## 4. 常见问题

### Q1: 中文乱码？
*   如果在转换过程中出现乱码，通常是缺少中文字体。
*   **解决**：将中文字体（如 `SimSun.ttf`, `Microsoft YaHei.ttf`）放入挂载的 `/configs` 目录下的 `fonts` 文件夹中（如果没有则创建）。重启容器。

### Q2: 性能问题？
*   OCR 和格式转换是非常消耗 CPU 的操作。
*   如果多人同时使用，或者处理几百页的大文件，NAS CPU 可能会飙升。建议限制容器的 CPU 使用率，或者安排在空闲时间处理。
