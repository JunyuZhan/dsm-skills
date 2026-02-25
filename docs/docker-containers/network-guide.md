# Container Manager 网络配置详解

Docker 的网络配置往往是新手最头疼的部分。为什么容器无法访问 NAS？为什么 Macvlan 容器无法连接宿主机？本指南将带你彻底搞懂 Bridge、Host 和 Macvlan 三种模式的区别与实战配置。

## 三种网络模式对比

| 模式 | 描述 | 优点 | 缺点 | 适用场景 |
| :--- | :--- | :--- | :--- | :--- |
| **Bridge (默认)** | 桥接模式，Docker 创建一个虚拟网桥，容器通过 NAT 访问外网。 | 端口隔离，安全性高，不占用局域网 IP。 | 需要端口映射，无法直接通过 IP 访问容器。 | 绝大多数应用（如 Jellyfin, Plex, Nextcloud）。 |
| **Host** | 主机模式，容器共享宿主机的网络栈。 | 性能最好，无需端口映射，直接使用 NAS IP。 | 端口容易冲突，安全性较低。 | 需要高性能网络或复杂端口的应用（如 Home Assistant）。 |
| **Macvlan** | 虚拟 MAC 模式，容器拥有独立的局域网 IP。 | 容器像一台独立的物理机，端口全开，无端口冲突。 | 配置复杂，**默认无法与宿主机通信**（需特殊配置）。 | 需要独立 IP 的应用（如 AdGuard Home, OpenWrt）。 |

---

## 实战 1：Bridge 模式端口映射

这是最常用的模式。在 Container Manager 中创建容器时：

1.  **网络** 选择 `bridge`。
2.  **端口设置** 中，左侧是 **本地端口**（NAS 端口），右侧是 **容器端口**（应用内部端口）。
    *   例如安装 Nginx，容器端口是 `80`。
    *   本地端口不能冲突，可以设为 `8080`。
    *   访问地址：`http://NAS_IP:8080`。

---

## 实战 2：Host 模式解决广播问题

某些应用（如 Home Assistant）需要接收局域网内的广播包（用于发现智能设备），Bridge 模式会阻断广播。

1.  **网络** 选择 `host`。
2.  **端口设置** 会被禁用（因为直接使用宿主机端口）。
3.  访问地址：`http://NAS_IP:8123`（假设 HA 默认端口是 8123）。

---

## 实战 3：Macvlan 模式配置（高级）

让容器拥有独立的局域网 IP（例如 NAS 是 192.168.1.2，容器是 192.168.1.100）。

### 第一步：开启 Open vSwitch

在 **控制面板** > **网络** > **网络界面** > **管理** > **Open vSwitch 设置**，勾选 **启用 Open vSwitch**。

### 第二步：创建 Macvlan 网络 (CLI)

SSH 登录 NAS，执行以下命令（请根据实际网络修改）：

```bash
# 假设你的网段是 192.168.1.x，网关是 192.168.1.1
# ovs_eth0 是你的物理网卡名称（可以通过 ip addr 查看）
# 192.168.1.200/29 表示预留 192.168.1.200 到 207 给 Docker 使用

docker network create -d macvlan \
  --subnet=192.168.1.0/24 \
  --gateway=192.168.1.1 \
  --ip-range=192.168.1.200/29 \
  -o parent=ovs_eth0 \
  macvlan_net
```

### 第三步：使用 Macvlan

在 Container Manager 或 Docker Compose 中使用该网络：

```yaml
services:
  adguard:
    image: adguard/adguardhome
    networks:
      macvlan_net:
        ipv4_address: 192.168.1.200 # 指定固定 IP
    restart: always

networks:
  macvlan_net:
    external: true # 使用外部已创建的网络
```

### 第四步：解决 Macvlan 无法访问宿主机问题（必读）

出于安全设计，Macvlan 网络默认无法访问父接口（即 NAS 本身）。如果你在 Macvlan 容器（如 Home Assistant）中尝试连接 NAS 的 MQTT 或数据库，会失败。

**解决方案：添加从接口（Macvlan Bridge）**

在 SSH 中执行（重启失效，需设为开机脚本）：

```bash
# 创建一个名为 macvlan_bridge 的接口连接到 macvlan_net
ip link add macvlan_bridge link ovs_eth0 type macvlan mode bridge

# 给这个接口分配一个专用 IP（要在你的 ip-range 范围内）
ip addr add 192.168.1.207/32 dev macvlan_bridge

# 启用接口
ip link set macvlan_bridge up

# 添加路由：告诉系统，访问 Docker Macvlan 网段的数据包走这个接口
ip route add 192.168.1.200/29 dev macvlan_bridge
```

现在，容器可以通过 `192.168.1.207` 这个 IP 访问 NAS，而 NAS 也可以通过容器 IP 访问容器。

---

## 常见网络问题排查

1.  **容器无法联网**：
    *   检查 DNS 设置。在容器内 `cat /etc/resolv.conf`。
    *   Bridge 模式下，尝试重启 Docker 服务。
2.  **端口冲突**：
    *   使用 `netstat -tunlp | grep 端口号` 检查 NAS 上谁占用了端口。
3.  **Macvlan 创建失败**：
    *   确保未被其他网络占用。
    *   确保物理网卡名称正确（`ovs_eth0` 或 `eth0`）。
