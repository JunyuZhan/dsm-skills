# 自由职业者与数字游民：随身携带的数字办公室

对于自由职业者 (Freelancer) 和数字游民 (Digital Nomad)，**随时随地访问 (Remote Access)**、**多设备同步 (Sync)** 和**自动化业务流 (Automation)** 是核心需求。群晖 NAS 能够让您在巴厘岛的海滩上，也能像在办公室一样高效工作。

## 核心痛点与解决方案

| 痛点 | 解决方案 | 核心技术 |
| :--- | :--- | :--- |
| **异地访问文件** | 无需公网 IP 的内网穿透 | **Tailscale** / **QuickConnect** |
| **发票与记账** | 自动化账单管理 | **Invoice Ninja** (Docker) |
| **多设备同步** | 手机/平板/电脑无缝切换 | **Synology Drive** |
| **客户提案展示** | 在线作品集与交付 | **File Station** / **Photo Station** |
| **数据安全** | 防止笔记本丢失数据泄露 | **Active Backup for Business** |

## 1. 全球访问网络优化 (Remote Access)

在星巴克或酒店 Wi-Fi 下，如何快速连接家里的 NAS？

### 方案 A：Tailscale (零配置组网 - 强烈推荐)
*   **原理**：基于 WireGuard 的网状网络，无需公网 IP，穿透率极高。
*   **部署**：
    1.  在套件中心安装 Tailscale。
    2.  手机/笔记本安装 Tailscale 客户端并登录同一账号。
    3.  开启 **MagicDNS**，直接通过机器名访问（如 `http://nas:5000`）。
    4.  **Exit Node (出口节点)**：在不安全的公共 Wi-Fi 下，开启 NAS 的 Exit Node 功能，让手机流量全部加密经过家里的 NAS 转发，保护隐私。

### 方案 B：Cloudflare Tunnel (穿透)
*   如果你有自己的域名，可以使用 Cloudflare Tunnel 将 NAS 服务映射到公网（如 `nas.yourdomain.com`）。
*   *参考*：[Cloudflare Tunnel 实战](../network/cloudflare-tunnel.md)

## 2. 自动化业务流：Invoice Ninja (Docker)

告别手动 Excel 记账和发 PDF 账单。Invoice Ninja 是开源的自由职业者神器。
*   **功能**：
    *   创建专业发票 PDF，直接发邮件给客户。
    *   客户点击链接查看发票，甚至可以在线支付（Stripe/PayPal）。
    *   记录工时（Time Tracking），自动生成账单。
    *   管理客户 CRM 信息。
*   **部署**：需要 MySQL 和 Nginx 支持，建议使用 Docker Compose。

## 3. 多设备无缝同步 (Synology Drive)

数字游民通常有 MacBook、iPad Pro 和 iPhone。
*   **按需同步**：
    *   在 MacBook 上安装 Synology Drive Client，开启“按需同步”。
    *   平时不占用硬盘空间，点击文件时瞬间下载。
*   **iPad 生产力**：
    *   使用 iOS Files (文件) APP，添加 Synology Drive 位置。
    *   在 iPad 上直接编辑 NAS 里的 Word/PPT，或用 LumaFusion 剪辑 NAS 里的视频（需内网速度快）。

## 4. 客户交付与作品集

不要用微信传压缩包！显得不专业。
*   **专属交付门户**：
    *   为每个客户创建一个共享文件夹 `/Client/Customer_A`。
    *   设置独立的用户名/密码，或通过 **File Station** 生成带密码和有效期的链接。
    *   自定义登录界面背景图为您的个人品牌 Logo。

## 5. 数据安全与防丢失

笔记本在旅途中容易丢失或损坏。
*   **实时备份**：
    *   配置 **Synology Drive Backup**，只要有网，文件修改立即上传回 NAS。
    *   **版本控制**：误删文件也能找回。
*   **加密**：
    *   笔记本硬盘开启 BitLocker (Windows) 或 FileVault (Mac)。
    *   NAS 端的敏感数据开启文件夹加密。

## 6. 推荐 Docker 工具

### Monica (个人 CRM)
管理您的人脉关系。
*   记录客户的生日、喜好、上次联系时间。
*   设置提醒：“该联系老客户 Alice 了”。

### Firefly III (个人记账)
管理您的多币种财务。
*   支持多账户、多币种（USD, CNY, EUR）。
*   生成收支报表，规划预算。

### SearXNG (元搜索引擎)
保护隐私的搜索引擎。
*   聚合 Google, Bing, DuckDuckGo 的结果。
*   不追踪您的搜索记录，无广告。

## 7. 离线下载与娱乐

在飞机/高铁上无聊？
*   **离线下载**：出发前一晚，在 **DS video** 或 **Plex** 手机端点击“下载”，将电影缓存到本地。
*   **电子书**：通过 **Calibre-web** (Docker) 将电子书推送到 Kindle 或 iPad。
