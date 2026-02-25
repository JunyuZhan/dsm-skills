# 网络与远程访问索引

打通内网与外网，构建安全、高速的远程访问体系。

## 目录

### 1. 基础连接
*   [**DDNS 动态域名解析**](ddns-guide.md): 告别 QuickConnect 的龟速，利用公网 IPv4/IPv6 实现满速直连。
*   [**端口转发与 UPnP**](port-forwarding.md): 路由器设置指南，如何正确开放端口而不暴露风险。

### 2. 内网穿透 (无公网 IP)
*   [**内网穿透终极指南**](tunneling-guide.md): Tailscale, ZeroTier, Cloudflare Tunnel 三大方案横向评测。
*   [**Tailscale 深度实战**](tailscale-derp.md): 自建 DERP 中转服务器，实现全网满速互联。
*   [**FRP 自建穿透**](frp-guide.md): 如果你有一台云服务器，FRP 是最可控的高性能方案。

### 3. 安全与加密
*   [**反向代理与 HTTPS**](reverse-proxy.md): 用一个 443 端口访问所有服务，配置 WebSocket 支持。
*   [**SSL 证书自动化 (acme.sh)**](acme-sh-automation.md): 自动申请泛域名证书，自动部署到 DSM，彻底告别“不安全”提示。
*   [**安全加固与防火墙**](security-hardening.md): GeoIP 阻断、SSH 密钥登录、蜜罐诱捕，构建纵深防御体系。

### 4. 进阶网络服务
*   [**DNS Server 实战**](dns-server.md): 搭建 Split-DNS，实现内网域名解析，解决 NAT 回流问题。
*   [**WebDAV 远程挂载**](webdav-guide.md): 将 NAS 挂载为本地磁盘，解决中文乱码与性能优化。
