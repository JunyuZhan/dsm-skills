# ZeroTier 深度实战：Moon 节点与自建控制器

ZeroTier 是最早普及的 P2P 异地组网工具。虽然 Tailscale 后来居上，但 ZeroTier 依然有很多死忠粉，特别是在**完全自建控制器**（Controller）和**自定义路由规则**（Flow Rules）方面，它更加灵活。

本指南将教你如何自建 **Moon 节点**（加速中转），以及如何搭建 **Planet**（根服务器）级别的完全私有网络。

## 1. 为什么选择 ZeroTier？

*   **P2P 穿透**：通过 UDP 打洞，直接连接两台设备，不经过中转服务器（如果打洞成功）。
*   **Moon 节点**：类似于 Tailscale 的 DERP，你可以自建中转服务器，加速连接。
*   **Flow Rules**：强大的流量控制规则，可以精确到“只允许 IP A 访问 IP B 的 80 端口”。
*   **多路径 (Multipath)**：新版本支持绑定多条线路（如宽带 + 4G），自动负载均衡。

## 2. 部署 Moon 节点 (加速中转)

如果你发现 ZeroTier 连接经常断线（Relay 状态），说明官方根服务器（Planet）在海外，延迟太高。你需要一台国内 VPS（或有公网 IP 的 NAS）作为 Moon。

### 准备工作
1.  **VPS**：有公网 IP。
2.  **ZeroTier**：已安装并在运行。

### 生成 Moon 配置文件
在 VPS 上执行：
```bash
cd /var/lib/zerotier-one
zerotier-idtool initmoon identity.public > moon.json
```

### 修改 moon.json
编辑 `moon.json`，找到 `"roots": []` 部分，填入 VPS 的公网 IP 和端口（默认 9993）。
```json
"roots": [
  {
    "identity": "你的10位NodeID",
    "stableEndpoints": [
      "1.2.3.4/9993" // VPS公网IP/端口
    ]
  }
]
```

### 生成签名文件
```bash
zerotier-idtool genmoon moon.json
```
会生成一个 `000000xxxxxxxx.moon` 文件。

### 启用 Moon
1.  在 VPS 上创建目录 `moons.d`：
    ```bash
    mkdir moons.d
    mv 000000xxxxxxxx.moon moons.d/
    service zerotier-one restart
    ```
2.  **客户端连接 Moon**：
    在 NAS 或其他客户端上执行：
    ```bash
    zerotier-cli orbit <Moon_ID> <Moon_ID>
    ```
    *   `<Moon_ID>` 就是 VPS 的 10 位 Node ID（在 `zerotier-cli info` 查看）。
    *   验证：`zerotier-cli listpeers`，如果看到 VPS 的 IP 后面显示 `MOON`，说明加速成功。

## 3. 自建控制器 (ztncui / ZTNet)

ZeroTier 官方允许你在官网管理网络（免费 25 个设备）。如果你想突破限制，可以自建 Controller。

### 部署 ztncui (Docker)
`ztncui` 是一个开源的 Web UI，用于管理自建的 ZeroTier Controller。

```yaml
services:
  ztncui:
    image: keynetworks/ztncui
    container_name: ztncui
    ports:
      - 3000:3000
    environment:
      - MYADDR=1.2.3.4 # VPS 公网 IP
      - HTTP_PORT=3000
      - HTTP_ALL_INTERFACES=yes
      - ZTNCUI_PASSWD=password
    volumes:
      - ./zt-data:/var/lib/zerotier-one
      - ./ztncui-data:/opt/key-networks/ztncui/etc
    restart: always
```

### 使用
1.  访问 `http://1.2.3.4:3000`。
2.  默认账号 `admin`，密码 `password`。
3.  创建一个 Network，获得 Network ID。
4.  在客户端执行 `zerotier-cli join <Network_ID>`。
5.  在 Web UI 中批准设备加入。

## 4. Flow Rules (流量控制)

ZeroTier 的 Flow Rules 类似于企业级防火墙。你可以在官网（或 ztncui）的 Flow Rules 编辑框中输入规则。

### 示例：只允许访问 Web 服务
```
# 允许 ARP, IPv4, IPv6
accept ethertype arp;
accept ethertype ipv4;
accept ethertype ipv6;

# 允许 TCP 80, 443
accept
  ipprotocol tcp
  and dport 80 or dport 443;

# 拒绝其他所有流量
drop;
```

### 示例：隔离两个部门
```
# 定义标签
tag department
  id 1
  enum 0 red
  enum 1 blue;

# 拒绝跨部门访问
drop
  not tag department = zt.tag.department;
```

## 5. 常见问题

### Q1: Moon 节点没效果？
*   检查 VPS 防火墙（UDP 9993）。
*   检查客户端是否成功 orbit（`listpeers` 确认）。
*   Moon 只是“中转”，如果两端网络极差，UDP 丢包严重，Moon 也救不了（TCP 模式效率极低）。

### Q2: 找不到设备？
*   ZeroTier 依赖广播（Broadcast）发现设备。
*   在群晖 NAS 上，有时防火墙会拦截 UDP 9993。
*   尝试在 NAS 的防火墙规则中，放行 ZeroTier 的虚拟网卡（如 `zt0` 或 `tun` 接口）。
