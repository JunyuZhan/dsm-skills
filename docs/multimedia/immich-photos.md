# Immich：下一代 AI 智能相册

如果你在寻找 Google Photos 的完美替代品，**Immich** 是目前唯一的答案。它拥有极其流畅的手机 App，支持后台自动备份、AI 人脸识别、地图模式、回忆杀等功能，且更新速度极快。

## 为什么选择 Immich？

*   **体验极佳**：手机 App（iOS/Android）的流畅度吊打 Synology Photos。
*   **AI 识别**：基于机器学习的人脸识别、物体识别（搜“猫”、“海滩”）、CLIP 语义搜索（搜“穿红衣服在滑雪”）。
*   **地图模式**：在世界地图上查看你的足迹。
*   **多用户**：支持全家人使用，每个人的库独立，也可以共享相册。

## 1. 部署 Immich (Docker Compose)

Immich 架构较为复杂（包含 Server, Microservices, Machine Learning, Redis, PostgreSQL），官方强烈建议使用 Docker Compose。

### 准备工作
1.  在 `/volume1/docker/` 下创建 `immich` 目录。
2.  下载官方 `docker-compose.yml` 和 `.env` 文件。

```bash
cd /volume1/docker/immich
wget https://github.com/immich-app/immich/releases/latest/download/docker-compose.yml
wget https://github.com/immich-app/immich/releases/latest/download/example.env -O .env
```

### 修改配置 (.env)
使用文本编辑器修改 `.env`：
*   `UPLOAD_LOCATION`: 修改为你想存放照片的实际路径，例如 `/volume1/photo/immich`。
*   `DB_PASSWORD`: 设置一个强密码。

### 启动容器
```bash
docker compose up -d
```
*注意：Immich 更新非常频繁，建议定期运行 `docker compose pull && docker compose up -d` 更新。*

## 2. 外部库挂载 (External Libraries)

这是 NAS 用户最关心的功能。你可能已经在 `/volume1/photo` 存了 10 年的照片，不想把它们搬进 Immich 的上传目录。

### 步骤 1：修改 docker-compose.yml
你需要把现有的照片目录挂载进 Immich 容器（只读）。
在 `immich-server` 和 `immich-microservices` 两个服务的 `volumes` 下添加：

```yaml
volumes:
  - ${UPLOAD_LOCATION}:/usr/src/app/upload
  - /volume1/photo:/mnt/media/photo:ro # 添加这行，只读挂载
```
重启容器生效。

### 步骤 2：在 Web 端添加
1.  管理员登录 Immich 网页版 (`http://nas-ip:2283`)。
2.  点击右上角 **管理 (Administration)** > **外部库 (External Libraries)**。
3.  点击 **创建库**。
4.  **导入路径**：填写 `/mnt/media/photo`（容器内路径）。
5.  点击 **扫描**。Immich 会开始索引照片并生成缩略图，但**不会移动或修改**你的原始文件。

## 3. 手机端配置

1.  在 App Store / Google Play 下载 **Immich**。
2.  **Server Endpoint**: `http://nas-ip:2283/api` (注意加上 `/api`)。
3.  登录后，在设置中开启 **后台备份**。
    *   *提示*：iOS 需要开启“后台刷新”权限。建议首次备份时保持 App 在前台运行。

## 4. 机器学习设置 (Machine Learning)

Immich 使用机器学习模型进行人脸和物体识别。

*   **默认模型**：通常够用。
*   **硬件加速**：如果你的 NAS 支持（如 OpenVINO），可以在 `.env` 中开启硬件加速，提高识别速度。
*   **中文支持**：默认的 CLIP 模型对中文理解一般。可以在 **管理** > **机器学习设置** 中更换为支持多语言的模型（如 `XLM-Roberta-Large-Vit-B-16Plus`）。

## 5. 常见问题

### Q1: 占用空间大？
Immich 会生成预览图和转码视频。
*   **缩略图**：通常占用原始照片 10-20% 的空间。
*   **转码**：可以在 **设置** > **视频转码** 中调整策略，例如只转码不兼容的格式。

### Q2: 人脸识别不准？
*   在 **管理** > **Jobs** 中，手动触发 **Face Detection** 和 **Facial Recognition** 任务。
*   可以在人脸页面手动合并人物。

### Q3: 地图不显示？
*   Immich 使用 OpenStreetMap。如果地图加载失败，可能是网络问题。
*   确保你的照片包含 GPS 信息（Exif）。
