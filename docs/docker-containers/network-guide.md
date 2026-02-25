# Docker 网络进阶

Docker 的网络配置是很多新手的噩梦。理解 Bridge、Host、Macvlan，能让你解锁软路由、旁路由等高级玩法。

## 1. 网络模式详解

| 模式 | IP 地址 | 端口映射 | 适用场景 |
| :--- | :--- | :--- | :--- |
| **Bridge** (默认) | 172.17.0.x (内网) | 需要 (`-p 8080:80`) | 绝大多数应用。隔离性好，不占用宿主机端口。 |
| **Host** | **与 NAS 相同** | **不需要** | 即使性能要求高、或者需要广播发现的应用（如 Home Assistant, DLNA）。 |
| **Macvlan** | **独立局域网 IP** | **不需要** | 需要独立 IP 的应用（如 AdGuard Home, OpenWrt）。 |

## 2. Macvlan 实战：给容器分配独立 IP

**场景**：你想部署 AdGuard Home 做 DNS 服务器，但 NAS 的 53 端口已经被占用了。或者你想让容器拥有一个独立的 `192.168.1.x` IP。

### 步骤 1：创建 Macvlan 网络
SSH 登录 NAS，执行：
```bash
# 假设你的网关是 192.168.1.1，网段是 192.168.1.0/24
# parent=ovs_eth0 是关键，如果你开了 VMM，通常网卡名是 ovs_eth0，否则是 eth0
docker network create -d macvlan \
  --subnet=192.168.1.0/24 \
  --gateway=192.168.1.1 \
  -o parent=ovs_eth0 \
  macnet
```

### 步骤 2：部署容器
```yaml
services:
  adguard:
    image: adguard/adguardhome
    container_name: adguard
    networks:
      macnet:
        ipv4_address: 192.168.1.5 # 指定一个未被使用的 IP
    restart: always

networks:
  macnet:
    external: true
```

### 步骤 3：解决宿主机无法访问容器的问题 (安全机制)
Macvlan 有个特性：**宿主机 (NAS) 无法直接访问自己的 Macvlan 容器**。
**破解**：建立一个虚接口桥接。
```bash
# 在任务计划（开机触发）中添加：
ip link add macvlan-shim link ovs_eth0 type macvlan mode bridge
ip addr add 192.168.1.222/32 dev macvlan-shim # 给虚接口一个专用 IP
ip link set macvlan-shim up
ip route add 192.168.1.5/32 dev macvlan-shim # 告诉 NAS，去往容器 IP 走这条路
```

## 3. Traefik：自动服务发现与反向代理

如果你有几十个 Docker 容器，一个个配反向代理太累了。Traefik 可以自动监听 Docker 事件，容器一启动，域名就自动生效。

### 核心配置 (docker-compose.yml)
```yaml
services:
  traefik:
    image: traefik:v2.9
    command:
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
    ports:
      - "80:80"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"

  whoami:
    image: traefik/whoami
    labels:
      - "traefik.http.routers.whoami.rule=Host(`whoami.localhost`)"
```
*   **效果**：启动 `whoami` 容器后，直接访问 `http://whoami.localhost` 即可，无需手动配置 Nginx。

## 4. Docker Socket 安全代理

很多面板（Portainer, Homepage）需要挂载 `/var/run/docker.sock`。但这有安全风险：一旦容器被黑，黑客就拥有了宿主机的 Root 权限。

### 解决方案：Tecnativa/Docker-Socket-Proxy
部署一个只读的 Socket 代理，其他容器连接这个代理，而不是直连 Socket。

```yaml
services:
  dockerproxy:
    image: tecnativa/docker-socket-proxy
    environment:
      - CONTAINERS=1 # 只允许列出容器，不允许创建/删除
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    ports:
      - 2375
```
其他容器连接 `tcp://dockerproxy:2375`，安全无忧。
