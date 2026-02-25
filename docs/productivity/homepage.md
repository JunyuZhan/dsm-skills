# Homepage：打造高颜值 NAS 导航面板

当你的 NAS 上跑了几十个服务，每次都要手动输入 `IP:端口` 是一件很痛苦的事。**Homepage** 是一个现代、快速、高度可定制的导航页，它不仅能当书签用，还能通过 API 实时展示容器状态、下载速度、CPU 占用等信息。

## 为什么选择 Homepage？

*   **颜值即正义**：界面极简，支持自动获取网站图标 (Favicon)，支持深色模式。
*   **实时数据**：直接在卡片上显示 qBittorrent 下载速度、Jellyfin 正在播放、AdGuard 拦截数。
*   **Docker 集成**：自动发现并列出所有运行中的容器（需挂载 Docker Socket）。
*   **静态配置**：所有配置通过 YAML 文件管理，备份迁移极其方便（GitOps 友好）。

## 1. 部署 Homepage (Docker Compose)

创建一个 `docker-compose.yml`：

```yaml
services:
  homepage:
    image: ghcr.io/gethomepage/homepage:latest
    container_name: homepage
    ports:
      - 3000:3000
    volumes:
      - /volume1/docker/homepage/config:/app/config # 配置文件目录
      - /var/run/docker.sock:/var/run/docker.sock:ro # 可选：用于显示容器状态
    environment:
      - PUID=1026
      - PGID=100
    restart: always
```

启动后，访问 `http://nas-ip:3000`。你会看到默认的示例配置。

## 2. 核心配置文件详解

Homepage 的所有配置都在 `/app/config` 目录下的 YAML 文件中：
1.  **services.yaml**: 定义具体的服务卡片（如下载器、媒体库）。
2.  **widgets.yaml**: 定义顶部的小组件（如天气、系统资源）。
3.  **bookmarks.yaml**: 定义普通的书签链接（如 Google、Bilibili）。
4.  **settings.yaml**: 全局设置（标题、背景图、语言）。
5.  **docker.yaml**: Docker 集成配置。

### 2.1 配置服务卡片 (services.yaml)

这是最核心的部分。你可以分组定义服务。

```yaml
---
# 分组名称
- 媒体中心:
    - Jellyfin:
        icon: jellyfin.png
        href: http://192.168.1.100:8096
        description: 影音库
        # API 集成（可选）
        widget:
          type: jellyfin
          url: http://192.168.1.100:8096
          key: your_jellyfin_api_key
          enableBlocks: true # 显示当前播放
          enableNowPlaying: true

    - qBittorrent:
        icon: qbittorrent.png
        href: http://192.168.1.100:8080
        widget:
          type: qbittorrent
          url: http://192.168.1.100:8080
          username: admin
          password: password
```

*   **icon**: 支持本地图标（放在 `config/icons`）或在线图标库（如 `mdi-home`）。
*   **widget**: 這是 Homepage 的杀手锏。通过 API 获取服务状态。

### 2.2 配置小组件 (widgets.yaml)

顶部的信息栏。

```yaml
- resources:
    cpu: true
    memory: true
    disk: / # 显示根目录占用

- search:
    provider: google
    target: _blank

- weather:
    apiKey: your_openweathermap_api_key
    latitude: 31.2304
    longitude: 121.4737
    units: metric
```

### 2.3 配置 Docker 集成 (docker.yaml)

如果你不想手动配每个服务，可以让 Homepage 自动发现。

```yaml
my-docker:
  socket: /var/run/docker.sock # 本地 Docker
  # socket: tcp://192.168.1.200:2375 # 远程 Docker
```

然后在 `services.yaml` 中引用：

```yaml
- 我的应用:
    - MyContainer:
        server: my-docker # 对应 docker.yaml 中的名字
        container: container_name # 容器名
        showStats: true # 显示 CPU/内存占用
```

## 3. 进阶玩法

### 3.1 使用图标库
Homepage 内置了 `dashboard-icons` 库。
*   在 `icon:` 字段直接填 `qbittorrent`，它会自动去库里找。
*   如果是 SVG 图标，填 `mdi-home`。

### 3.2 布局调整 (settings.yaml)
```yaml
title: 我的家庭云
background:
  image: https://images.unsplash.com/photo-1506744038136-46273834b3fb
  brightness: 50 # 背景亮度
layout:
  Media:
    style: row # 横向排列
    columns: 4 # 每行 4 个
```

### 3.3 状态监控
支持的服务包括但不限于：
*   **AdGuard Home**: 拦截统计
*   **Unifi Controller**: 网络状态
*   **Portainer**: 容器管理
*   **Proxmx VE**: 虚拟机状态
*   **Synology**: DSM 系统信息（需开启 SNMP 或 API）

## 4. 常见问题

### Q1: 图标不显示？
*   检查文件名大小写。Linux 对大小写敏感。
*   如果是本地图片，放在 `config/images` 还是 `config/icons`？通常建议放在 `config/public/icons` 并引用 `/icons/xxx.png`。

### Q2: API 连接失败？
*   检查容器网络。Homepage 容器必须能访问目标服务的 IP。如果它们在不同的 Docker 网络，建议使用宿主机 IP。
*   API Key 是否正确？是否有权限？
