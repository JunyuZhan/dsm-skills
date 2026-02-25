# 反向代理与 HTTPS 配置指南

通过反向代理（Reverse Proxy），你可以用一个端口（443）访问 NAS 上的所有服务，无需在路由器上映射几十个端口，配合 HTTPS 证书，既安全又优雅。

## 什么是反向代理？

*   **没有反向代理**：访问 `http://nas-ip:5000` (DSM), `http://nas-ip:8096` (Jellyfin), `http://nas-ip:8123` (HA)。
*   **有反向代理**：访问 `https://dsm.yourdomain.com`, `https://video.yourdomain.com`, `https://ha.yourdomain.com`。所有流量都通过 443 端口进入，NAS 根据域名自动分发给不同的服务。

```mermaid
graph LR
    User[用户 (互联网)]
    Router[路由器 (端口映射 443)]
    NAS[NAS (反向代理服务器)]
    
    DSM[DSM (localhost:5000)]
    Jellyfin[Jellyfin (localhost:8096)]
    HA[Home Assistant (localhost:8123)]

    User -- https://video.yourdomain.com --> Router
    Router -- 端口转发 443 --> NAS
    NAS -- 解析域名: video --> Jellyfin
    NAS -- 解析域名: ha --> HA
    NAS -- 解析域名: dsm --> DSM

    style NAS fill:#f9f,stroke:#333
    style Jellyfin fill:#bfb,stroke:#333
    style HA fill:#bfb,stroke:#333
```

---

## 准备工作

1.  **域名**：购买一个域名，或者使用群晖自带的 `*.synology.me` DDNS。
2.  **公网 IP**：需要公网 IPv4 或 IPv6。
3.  **端口映射**：在路由器上将外网 `443` 端口映射到 NAS 的 `443` 端口。

---

## 步骤 1：申请泛域名证书 (Wildcard SSL)

推荐申请泛域名证书（如 `*.yourdomain.com`），这样增加子域名时无需重新申请证书。

1.  **控制面板** > **安全性** > **证书**。
2.  **新增** > **添加新证书** > **获取证书** > **Let's Encrypt**。
3.  **域名**：输入 `yourdomain.com`。
4.  **主题备用名称**：输入 `*.yourdomain.com`（注意：群晖自带的 DDNS 自动支持泛域名，第三方域名可能需要 DNS 验证支持）。
    *   *技巧：如果使用阿里云/腾讯云域名，建议使用 `acme.sh` 脚本通过 Docker 自动申请并部署到群晖，比自带的更稳定。*

---

## 步骤 2：配置反向代理规则

以 Jellyfin 为例（内部端口 8096）：

1.  **控制面板** > **登录门户** > **高级** > **反向代理服务器**。
2.  点击 **新增**。
3.  **常规**：
    *   **描述**：Jellyfin
    *   **来源**：
        *   协议：`HTTPS`
        *   主机名：`video.yourdomain.com`
        *   端口：`443`
        *   启用 HSTS：勾选（强制 HTTPS）
    *   **目的地**：
        *   协议：`HTTP`
        *   主机名：`localhost`
        *   端口：`8096`
4.  **自定义标题 (WebSocket 支持)**：
    *   很多应用（Jellyfin, Home Assistant, Bitwarden）需要 WebSocket 支持，否则会报错或无法连接。
    *   点击 **自定义标题** 选项卡。
    *   点击 **新增** > **WebSocket**。系统会自动添加 `Upgrade` 和 `Connection` 两个头。
5.  点击 **保存**。

---

## 步骤 3：证书分配

创建完规则后，默认使用的是系统默认证书。你需要将新域名的证书分配给对应的反向代理规则。

1.  回到 **控制面板** > **安全性** > **证书**。
2.  点击 **设置**。
3.  在列表中找到刚才创建的 `video.yourdomain.com`（服务名称通常显示为反向代理的描述）。
4.  将对应的证书修改为你申请的 `*.yourdomain.com` 证书。
5.  点击 **确定**。

现在，访问 `https://video.yourdomain.com` 即可直接进入 Jellyfin，浏览器显示安全锁图标。

---

## 进阶技巧：访问控制 (Access Control)

有些服务（如 Portainer、路由器后台、下载器 WebUI）涉及核心安全，不应暴露给全网，但又想在公司或咖啡厅通过域名访问。

1.  **控制面板** > **登录门户** > **高级** > **访问控制配置文件**。
2.  **新增** 一个策略，例如“仅限国内和局域网”。
3.  **规则设计**：
    *   **规则 1**：CIDR IP `192.168.1.0/24` -> **允许** (局域网直连)。
    *   **规则 2**：地理位置 `中国` -> **允许** (国内访问)。
    *   **规则 3**：`所有` -> **拒绝** (屏蔽海外)。
4.  **应用**：回到 **反向代理服务器** 规则编辑页面，在 **访问控制配置文件** 中选择该策略。

**效果**：即使你的域名解析到了公网 IP，俄罗斯黑客访问时只会看到 403 Forbidden，而你在公司（中国 IP）可以正常访问。

## 进阶技巧：自定义标题 (HSTS & Security Headers)

为了通过安全审计（如 Mozilla Observatory 评分 A+），你需要添加安全头。

1.  在反向代理规则的 **自定义标题** 中新增：
    *   `Strict-Transport-Security`: `max-age=31536000; includeSubDomains; preload` (强制 HSTS)
    *   `X-Frame-Options`: `SAMEORIGIN` (防止点击劫持)
    *   `X-Content-Type-Options`: `nosniff`
2.  **WebSocket 支持**：
    *   务必添加 `Upgrade` ($http_upgrade) 和 `Connection` ($connection_upgrade)，否则 Jellyfin/HomeAssistant 无法正常工作。
