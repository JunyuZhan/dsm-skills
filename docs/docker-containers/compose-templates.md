# Docker Compose 常用堆栈模板

Docker Compose 是管理多容器应用的神器。与其在 Container Manager 界面一个个手填参数，不如直接复制粘贴以下经过验证的 `docker-compose.yml` 模板。

!!! tip "使用方法"
    1.  在 **Container Manager** > **项目** > **新增**。
    2.  输入项目名称（如 `media-center`）。
    3.  选择路径（建议 `/docker/projects/media-center`）。
    4.  选择 **创建 docker-compose.yml** 并粘贴下方代码。

## 1. 家庭媒体中心 (Jellyfin + TMM)

最基础的影视管理组合。Jellyfin 负责播放，tinyMediaManager (TMM) 负责刮削海报和整理文件名。

```yaml
version: '3.8'
services:
  jellyfin:
    image: jellyfin/jellyfin:latest
    container_name: jellyfin
    environment:
      - PUID=1026 # 替换为你的 admin UID (ssh 输入 id admin 查看)
      - PGID=100  # 替换为你的 users GID
      - TZ=Asia/Shanghai
    volumes:
      - /volume1/docker/jellyfin/config:/config
      - /volume1/video:/data/media
    ports:
      - 8096:8096
    devices:
      - /dev/dri:/dev/dri # 开启核显硬解（仅限 Intel CPU）
    restart: unless-stopped

  tmm:
    image: tinymediamanager/tinymediamanager:latest
    container_name: tmm
    environment:
      - GROUP_ID=100
      - USER_ID=1026
      - TZ=Asia/Shanghai
    volumes:
      - /volume1/docker/tmm/config:/data
      - /volume1/video:/media
    ports:
      - 5800:5800 # Web 界面端口
    restart: unless-stopped
```

## 2. 智能家居中枢 (Home Assistant + MQTT)

Home Assistant (HA) 必装的三件套：HA 本体 + Mosquitto (MQTT 代理) + Zigbee2MQTT (如果用 Zigbee 设备)。

```yaml
version: '3.8'
services:
  homeassistant:
    container_name: homeassistant
    image: "ghcr.io/home-assistant/home-assistant:stable"
    volumes:
      - /volume1/docker/homeassistant/config:/config
      - /etc/localtime:/etc/localtime:ro
    network_mode: host # 必须使用 Host 模式以发现局域网设备
    restart: unless-stopped

  mosquitto:
    image: eclipse-mosquitto
    container_name: mosquitto
    volumes:
      - /volume1/docker/mosquitto/config:/mosquitto/config
      - /volume1/docker/mosquitto/data:/mosquitto/data
      - /volume1/docker/mosquitto/log:/mosquitto/log
    ports:
      - 1883:1883
      - 9001:9001
    restart: unless-stopped
```

## 3. 全能下载神器 (qBittorrent + VueTorrent UI)

原版 qBittorrent 界面太丑？加上 VueTorrent 主题，瞬间高大上。

```yaml
version: "3"
services:
  qbittorrent:
    image: lscr.io/linuxserver/qbittorrent:latest
    container_name: qbittorrent
    environment:
      - PUID=1026
      - PGID=100
      - TZ=Asia/Shanghai
      - WEBUI_PORT=8080
    volumes:
      - /volume1/docker/qbittorrent/config:/config
      - /volume1/downloads:/downloads
    ports:
      - 8080:8080 # Web UI
      - 6881:6881 # BT TCP
      - 6881:6881/udp # BT UDP
    restart: unless-stopped
```
*安装后在设置中将 WebUI 主题路径指向 VueTorrent 文件夹（需自行下载主题放入 config）。*

## 4. 强大的反向代理 (Nginx Proxy Manager)

如果你觉得群晖自带的反向代理不够用（比如不支持 404 自定义页面、访问权限控制不够细），NPM 是最佳替代品。

```yaml
version: '3'
services:
  app:
    image: 'jc21/nginx-proxy-manager:latest'
    restart: unless-stopped
    ports:
      - '80:80'   # HTTP
      - '81:81'   # 管理后台
      - '443:443' # HTTPS
    volumes:
      - /volume1/docker/npm/data:/data
      - /volume1/docker/npm/letsencrypt:/etc/letsencrypt
```
*注意：这将占用 NAS 的 80/443 端口，如果 Web Station 已占用，需先修改 Web Station 端口或将 NPM 映射为其他端口（如 10080:80）。*

## 5. 个人导航页 (Homarr)

应用装多了记不住端口？装个漂亮的导航页。

```yaml
version: '3'
services:
  homarr:
    container_name: homarr
    image: ghcr.io/ajnart/homarr:latest
    restart: unless-stopped
    volumes:
      - /volume1/docker/homarr/configs:/app/data/configs
      - /volume1/docker/homarr/icons:/app/public/icons
      - /volume1/docker/homarr/data:/data
    ports:
      - 7575:7575
```

## 6. 网络去广告与 DNS (AdGuard Home)

```yaml
version: "3"
services:
  adguardhome:
    image: adguard/adguardhome
    container_name: adguardhome
    ports:
      - 53:53/tcp
      - 53:53/udp
      - 3000:3000/tcp # 初始化设置页面
      - 853:853/tcp
    volumes:
      - /volume1/docker/adguardhome/work:/opt/adguardhome/work
      - /volume1/docker/adguardhome/conf:/opt/adguardhome/conf
    restart: unless-stopped
```
*注意：53 端口通常被 DSM 的 DNS Server 占用。建议使用 Macvlan 模式部署 AdGuard Home（详见 [网络配置详解](network-guide.md)）。*

## 7. 自动追剧 (Nastools 替代品：MoviePilot)

由于 Nastools 闭源收费，MoviePilot 是目前最强的开源替代品。

*(由于配置极其复杂，涉及 Cookie、认证站点等，建议参考 GitHub 官方 Wiki，此处仅提供基础结构)*

```yaml
version: '3'
services:
  moviepilot:
    image: jxxghp/moviepilot:latest
    volumes:
      - /volume1/docker/moviepilot/config:/config
      - /volume1/docker/moviepilot/core:/moviepilot/.cache/ms-playwright
    environment:
      - NGINX_PORT=3001
      - PORT=3000
    ports:
      - 3000:3000
    restart: always
```

## 8. 代码服务器 (VS Code Server)

在浏览器里写代码，iPad 生产力神器。

```yaml
version: "2.1"
services:
  code-server:
    image: lscr.io/linuxserver/code-server:latest
    container_name: code-server
    environment:
      - PUID=1026
      - PGID=100
      - TZ=Asia/Shanghai
      - PASSWORD=password # 设置登录密码
    volumes:
      - /volume1/docker/code-server/config:/config
      - /volume1/projects:/home/coder/project
    ports:
      - 8443:8443
    restart: unless-stopped
```

## 9. 数据库 (MySQL / MariaDB)

很多应用需要数据库。

```yaml
version: '3.1'
services:
  db:
    image: mariadb:10.5
    container_name: mariadb
    environment:
      MYSQL_ROOT_PASSWORD: mysecretpassword
    volumes:
      - /volume1/docker/mariadb/data:/var/lib/mysql
    ports:
      - 3306:3306
    restart: always
```

## 10. 容器自动更新 (Watchtower)

自动检查并更新所有容器。

```yaml
version: "3"
services:
  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --interval 3600 --cleanup # 每小时检查一次并清理旧镜像
    restart: unless-stopped
```
