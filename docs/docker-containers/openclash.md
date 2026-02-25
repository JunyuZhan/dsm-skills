# OpenClash 旁路由模式部署 (Docker)

在 NAS 上部署 OpenClash，可以接管局域网的网络流量，实现透明代理、去广告等功能，无需刷路由器固件。

## 1. 核心原理：Macvlan

为了让 OpenClash 作为一个独立的网络设备存在（拥有独立的 IP），我们需要使用 Docker 的 **Macvlan** 网络模式。

*   **宿主机 (NAS)**: 192.168.1.10
*   **网关 (路由器)**: 192.168.1.1
*   **OpenClash (容器)**: 192.168.1.2 (旁路由 IP)

## 2. 创建 Macvlan 网络

SSH 登录 NAS，执行以下命令（请根据实际网段修改）：

```bash
# 开启网卡混杂模式 (ovs_eth0 是开启 VMM 后的网卡名，未开 VMM 通常是 eth0)
ip link set ovs_eth0 promisc on

# 创建 Docker 网络
docker network create -d macvlan \
  --subnet=192.168.1.0/24 \
  --gateway=192.168.1.1 \
  -o parent=ovs_eth0 \
  macnet
```

## 3. 部署 OpenClash 容器

推荐使用 `36bian/openclash` 或 `dreamacro/clash` 的封装版。

### Docker Compose 配置
```yaml
services:
  openclash:
    image: 36bian/openclash:latest
    container_name: openclash
    restart: always
    network_mode: macnet # 既然创建了 macnet，这里需要特殊写法，见下文
    privileged: true # 必须开启特权模式
    cap_add:
      - NET_ADMIN
      - NET_RAW
    volumes:
      - ./config:/root/.config/clash
    networks:
      macnet:
        ipv4_address: 192.168.1.2 # 固定分配给 OpenClash 的 IP

networks:
  macnet:
    external: true
```

## 4. 配置旁路由

1.  **访问后台**：浏览器打开 `http://192.168.1.2:9090/ui` (端口视镜像而定，有的用 Yacd 面板)。
2.  **导入订阅**：在配置页面填入你的 Clash 订阅链接。
3.  **开启 TUN 模式**：为了接管所有流量，建议开启 TUN 模式或 Mixed 模式。

## 5. 客户端设置

想要某个设备（如 Apple TV）走 OpenClash 网络？

1.  打开 Apple TV 的网络设置。
2.  **IP 地址**：手动设置 (如 192.168.1.100)。
3.  **路由器 (网关)**：填入 OpenClash 的 IP (**192.168.1.2**)。
4.  **DNS**：填入 OpenClash 的 IP (**192.168.1.2**)。

## 6. 解决宿主机无法访问容器的问题

Docker Macvlan 的安全机制禁止宿主机直接访问容器。如果你需要在 NAS 上访问 OpenClash（例如 Docker 拉取镜像加速），需要建立虚接口。

```bash
# 添加到开机计划任务
ip link add macvlan-shim link ovs_eth0 type macvlan mode bridge
ip addr add 192.168.1.222/32 dev macvlan-shim
ip link set macvlan-shim up
ip route add 192.168.1.2/32 dev macvlan-shim
```
现在，你可以在 NAS 的网络设置中，将网关指向 192.168.1.2，NAS 也可以科学上网了。
