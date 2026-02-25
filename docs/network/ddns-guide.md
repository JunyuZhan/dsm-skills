# DDNS (动态域名解析) 深度指南：告别 QuickConnect

QuickConnect 虽然方便，但经过群晖服务器中转，速度慢且不稳定。如果你有公网 IPv4 或 IPv6，**DDNS (Dynamic DNS)** 是实现满速直连的最佳方案。

## 1. 原理与优势

*   **QuickConnect**：NAS <-> 群晖服务器 <-> 你的手机。速度受限于群晖服务器带宽（通常几十 KB/s）。
*   **DDNS**：NAS (动态公网 IP) <-> 你的手机。手机直接连接 NAS，速度取决于你家宽带的上行带宽（通常 30-100Mbps）。

## 2. 获取公网 IP

### IPv4
*   **电信/联通**：打客服电话（10000/10010），说“家里装监控需要公网 IP”，通常会给。
*   **移动**：基本没戏，建议直接用 IPv6。
*   **检测**：百度搜索“IP”，看显示的 IP 与路由器 WAN 口 IP 是否一致。如果一致就是公网。

### IPv6 (未来主流)
*   **优势**：无需申请，几乎所有宽带默认都有公网 IPv6。
*   **配置**：
    1.  **光猫**：改为**桥接模式**（Bridge）。
    2.  **路由器**：开启 IPv6 支持（Native/Passthrough）。
    3.  **NAS**：控制面板 > 网络 > 网络界面 > LAN > IPv6 设置为“自动”。

## 3. 配置 Synology DDNS (最简单)

群晖送了一个免费的二级域名，支持 IPv4/IPv6 双栈解析，且自带 Let's Encrypt 证书。

1.  **控制面板 > 外部访问 > DDNS**。
2.  **新增**。
3.  **服务提供商**：Synology。
4.  **主机名称**：`yourname` (例如 `my-nas-2024`)。
5.  **勾选**：获取 Let's Encrypt 证书。
6.  **确定**。
7.  **效果**：以后访问 `my-nas-2024.synology.me` 就能直连回家。

## 4. 配置第三方 DDNS (阿里云/腾讯云/Cloudflare)

如果你买了顶级域名（如 `example.com`），显得更专业。

### Docker 方案 (推荐，支持所有服务商)
DSM 自带的 DDNS 列表支持的服务商很少。推荐使用 **ddns-go**。

1.  **部署**：
    ```yaml
    services:
      ddns-go:
        image: jeessy/ddns-go
        network_mode: host
        restart: always
        volumes:
          - /volume1/docker/ddns-go:/root
    ```
2.  **配置**：
    *   访问 `http://nas-ip:9876`。
    *   选择 DNS 服务商（阿里云/腾讯云/Cloudflare）。
    *   填入 AccessKey/Token。
    *   **IPv4**：启用，获取方式选“通过接口获取”。
    *   **IPv6**：启用，获取方式选“通过网卡获取”。
3.  **Webhook**：配置失败时推送到微信/钉钉，第一时间知道 IP 变了但解析没更新。

## 5. 常见问题排查

*   **Q: 域名解析正确，但连不上？**
    *   A: 99% 是因为路由器没做**端口转发**。
    *   **IPv4**：路由器后台 > 虚拟服务器/端口转发 > 外部 5001 -> 内部 NAS IP 5001。
    *   **IPv6**：路由器后台 > IPv6 防火墙 > 允许入站连接（注意：IPv6 没有 NAT，不需要端口转发，但需要开防火墙）。
*   **Q: 80/443 端口无法访问？**
    *   A: 运营商封锁了家用宽带的 80/443 端口。解决方法：改用高位端口（如 8443），或者使用 Cloudflare Tunnel (虽然慢点)。
*   **Q: IPv6 地址变了，解析没更新？**
    *   A: IPv6 地址通常由前缀 (Prefix) 和后缀 (Suffix) 组成。前缀会变，后缀通常基于 MAC 地址生成不变。确保 ddns-go 正确识别了网卡。
