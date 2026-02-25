# 监控与仪表盘打造指南

NAS 稳定运行后，如何直观地了解它的“健康状况”？虽然 DSM 自带资源监控，但不够酷炫，且无法监控 Docker 容器内部细节。

通过 **Prometheus + Grafana** 组合，你可以打造好莱坞科幻电影级别的监控大屏。而 **Homepage** 则是目前最现代化的个人导航页。

## 1. 现代化导航页：Homepage

不同于传统的 Heimdall 或 Homarr，Homepage 极其轻量，基于 YAML 配置，且深度集成了 Docker API。

### 特性
*   **实时状态**：直接在图标上显示容器 CPU/内存占用。
*   **服务集成**：直接显示 Jellyfin 在播内容、Transmission 下载速度、AdGuard 拦截统计。
*   **无需数据库**：所有配置都在一个 YAML 文件里，备份迁移极方便。

### 部署 (Docker Compose)

```yaml
version: "3.3"
services:
  homepage:
    image: ghcr.io/gethomepage/homepage:latest
    container_name: homepage
    ports:
      - 3000:3000
    volumes:
      - /volume1/docker/homepage/config:/app/config
      - /var/run/docker.sock:/var/run/docker.sock:ro # 读取 Docker 状态必须
    environment:
      PUID: 1026
      PGID: 100
    restart: unless-stopped
```

### 快速配置示例 (`services.yaml`)

```yaml
- Docker:
    - Portainer:
        icon: portainer.png
        href: http://nas-ip:9000
        server: my-docker # 在 settings.yaml 定义
        container: portainer # 容器名称，自动显示状态
```

## 2. 企业级监控：Prometheus + Grafana

这是一套专业的监控方案。
*   **Node Exporter**：采集 NAS 硬件数据（CPU、温度、磁盘 I/O）。
*   **Prometheus**：收集并存储这些数据。
*   **Grafana**：将数据画成漂亮的图表。

### 步骤 1：部署 Node Exporter

需要在 Host 模式下运行，才能读取到真实的宿主机数据。

```yaml
  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    command:
      - '--path.rootfs=/host'
    pid: host
    restart: unless-stopped
    volumes:
      - '/:/host:ro,rslave'
```

### 步骤 2：部署 Prometheus

创建一个 `prometheus.yml` 配置文件，指向 Node Exporter 的 IP:9100。

```yaml
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    volumes:
      - /volume1/docker/prometheus/config:/etc/prometheus
      - /volume1/docker/prometheus/data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
    ports:
      - 9090:9090
```

### 步骤 3：部署 Grafana

```yaml
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    user: "1026"
    volumes:
      - /volume1/docker/grafana/data:/var/lib/grafana
    ports:
      - 3001:3000
```

### 步骤 4：配置大屏

1.  打开 Grafana (`http://nas-ip:3001`)。
2.  添加数据源：选择 **Prometheus**，URL 填 `http://nas-ip:9090`。
3.  **导入仪表盘**：点击 Import，输入 ID **1860** (Node Exporter Full)。
4.  瞬间，你将看到一个包含 CPU 频率、磁盘剩余空间、网络流量吞吐的详细仪表盘。

## 3. 轻量级监控：Glances

如果你觉得 Grafana 太重，只想在终端里看一眼。

*   **部署**：`docker run -d --restart="always" -p 61208:61208 -e GLANCES_OPT="-w" -v /var/run/docker.sock:/var/run/docker.sock:ro --pid host nicolargo/glances`
*   **使用**：
    *   网页版：`http://nas-ip:61208`
    *   终端版：SSH 登录后输入 `glances` (需安装) 或通过 API 集成到 Homepage。

## 4. 硬盘健康监控：Scrutiny

DSM 自带的 SMART 信息查看比较繁琐。Scrutiny 提供了一个漂亮的 Web 界面来监控硬盘 S.M.A.R.T 数据。

*   **特性**：自动记录历史温度、预测硬盘寿命、发送报警。
*   **部署**：需要映射 `/run/udev` 和 `/dev` 设备。

```yaml
  scrutiny:
    image: ghcr.io/analogj/scrutiny:master-omnibus
    container_name: scrutiny
    cap_add:
      - SYS_RAWIO
    devices:
      - /dev/sda
      - /dev/sdb
    volumes:
      - /run/udev:/run/udev:ro
      - /volume1/docker/scrutiny/config:/opt/scrutiny/config
    ports:
      - 8080:8080
```
