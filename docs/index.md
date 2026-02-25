# 群晖 DSM 7.x 技巧大全

欢迎来到群晖 DSM 7.x 技巧大全项目。本项目旨在收集和分享关于群晖 NAS 系统 DSM 7.x 版本的各种实用技巧，帮助用户更好地使用群晖设备。

**当前已收录 200+ 个实用技巧！**

!!! warning "免责声明"
    本项目提供的所有技巧、脚本和建议仅供参考。虽然我们已尽力确保内容的准确性和可靠性，但在实际操作中（特别是涉及底层系统修改、硬件改造或 SSH 命令时）仍可能存在风险。
    
    *   **数据备份**：在执行任何高风险操作前，请务必备份重要数据。
    *   **保修失效**：部分硬件改造（如更换风扇、电源）可能会导致官方保修失效。
    *   **责任自负**：作者不对因使用本指南而导致的任何数据丢失、硬件损坏或系统故障承担责任。

## 目录索引

### 🔰 基础入门 (Basic Skills)
- [**黑群晖安装指南 (RR 引导)**](installation/rr-loader-guide.md): 傻瓜式 Web 配置、自动驱动、SA6400/DS920+ 选型。
- [**存储管理器深度解析 (必读)**](basic-skills/storage-manager.md): RAID 选型 (SHR vs RAID5)、Btrfs 优势、数据清洗防腐烂。
- [**数据加密与密钥管理**](basic-skills/encryption-manager.md): 文件夹加密、物理 U 盘密钥、防盗指南。
- [**通知中心与日志审计**](basic-skills/notifications-logs.md): 微信/邮件推送配置、Log Center 审计文件删除记录。
- [**系统设置遗珠 (10技巧)**](basic-skills/system-gems.md): 登录界面美化、LED调节、UPS联动、微信推送等。
- [用户主目录服务](basic-skills/user-home.md): 个人空间设置。
- [系统安全性提升](basic-skills/security.md): 2FA、防火墙、自动封锁。
- [内存检查与优化](basic-skills/memory-check.md): 资源监控与优化。

### ⚙️ 硬件与维护 (Hardware & Maintenance)
- [**硬件选购与维护 (10技巧)**](hardware-maintenance/hardware-guide.md): 硬盘避坑(CMR/SMR)、NVMe 存储池、UPS 配置、静音改造。
- [**硬件周边选购指南**](hardware-maintenance/buying-guide.md): UPS 推荐、万兆网卡、ECC 内存、Zigbee 网关。

### 🎬 多媒体与娱乐 (Multimedia)
- [**Photos 进阶技巧 (10技巧)**](multimedia/photos-tricks.md): 人脸识别、条件相册、权限管理。
- [**Photos 深度优化与迁移 (10技巧)**](multimedia/photos-advanced.md): 人脸识别补丁、Google Photos 迁移、ExifTool 修复。
- [**Video Station 与影视中心 (10技巧)**](multimedia/video-audio.md): TMDB搜刮修复、DTS解码、字幕插件。
- [**Jellyfin/Plex 硬件解码与转码详解**](multimedia/transcoding-guide.md): Intel QSV 核显直通、HDR 色调映射、转码验证。
- [**Download Station 进阶下载 (10技巧)**](download-tools/download-station.md): RSS 自动追剧、搜索插件 DLM、eMule。

### 👁️ 视频监控 (Surveillance)
- [**Surveillance Station 监控指南 (10技巧)**](surveillance/guide.md): 免费授权迁移、H.265 省空间、智能动作侦测、Home Mode。

### 🌐 网络与安全 (Network)
- [**网络与远程访问 (10技巧)**](network/access-security.md): QuickConnect vs DDNS、IPv6、端口转发、VPN Server。
- [**内网穿透与异地组网指南**](network/tunneling-guide.md): Tailscale 子网路由、Cloudflare Tunnel、ZeroTier 配置。
- [**企业级身份认证 (AD 域控)**](network/directory-server.md): Windows 统一登录、GPO 组策略、漫游配置文件。
- [**NAS 安全加固与防火墙策略 (10技巧)**](network/security-hardening.md): GeoIP 阻断、SSH 密钥认证、DoS 防护。
- [**反向代理与 HTTPS 配置 (10技巧)**](network/reverse-proxy.md): 泛域名证书、WebSocket 支持、访问控制。
- [**MailPlus Server 邮件服务器 (10技巧)**](communication/mailplus-guide.md): 反垃圾策略、SMTP Relay、DKIM/SPF 配置。
- [**Synology Chat 机器人集成 (10技巧)**](communication/chat-integration.md): Webhook 推送、运维机器人、Slash Command。

### 🚀 生产力与办公 (Productivity)
- [**生产力工具 (10技巧)**](productivity/drive-office.md): Drive 版本回溯、Office 协作、Note Station 剪藏。
- [**知识管理与协同工作流 (10技巧)**](productivity/knowledge-workflow.md): Obsidian 同步、Zotero 文献库、Gitea 代码托管、PXE 启动。
- [**自托管替代方案汇总**](productivity/self-hosted-alternatives.md): 替代 Notion, Google Drive, Google Photos, Spotify。

### 💻 虚拟化与建站 (Virtualization & Web)
- [**Virtual Machine Manager 实战 (10技巧)**](virtualization/vmm-guide.md): Windows LTSC 优化、OpenWrt 软路由、USB 直通。
- [**Web Station 建站指南 (10技巧)**](web-dev/website-hosting.md): PHP 优化、WordPress 加速、Node.js 部署。
- [**Web Station 建站进阶**](web-dev/web-station-advanced.md): 静态网站自动化、WordPress Redis 缓存、Python Web 部署。

### 🖥️ 系统深度集成 (OS Integration)
- [**Mac 极致优化指南**](platform-specific/mac-optimization.md): Time Machine 提速、Spotlight 搜索优化、禁止 .DS_Store。
- [**Mac/Windows 集成 (10技巧)**](platform-specific/os-integration.md): 映射网络驱动器、iSCSI 挂载游戏盘、NFS 权限。

### 🐳 Docker 容器 (Docker)
- [**必备容器推荐 Top 20**](docker-containers/must-have.md): Portainer, Jellyfin, Nastools, Home Assistant 等。
- [**监控与仪表盘打造指南**](docker-containers/monitoring.md): Grafana, Prometheus, Homepage, Scrutiny。
- [**自动化追剧全家桶 (Arr Suite)**](docker-containers/arr-suite.md): Radarr, Sonarr, Prowlarr 架构与配置。
- [**自建密码库 Vaultwarden (10技巧)**](docker-containers/vaultwarden.md): 数据主权、HTTPS 配置、多端同步。
- [**Docker Compose 常用堆栈模板 (10技巧)**](docker-containers/compose-templates.md): 媒体中心、HA、NPM、AdGuard Home 一键部署。
- [**Container Manager 网络配置详解 (10技巧)**](docker-containers/network-guide.md): Bridge vs Host vs Macvlan、互通问题。

### 🏠 家庭自动化 (Home Automation)
- [**家庭自动化与 IoT 指南 (10技巧)**](home-automation/iot-guide.md): HA Docker vs VMM、MQTT、Homebridge、Scrypted 摄像头接入。

### 📦 社群扩展 (Community Extensions)
- [**社群第三方套件推荐 (10技巧)**](community/packages.md): SynoCommunity、Entware、ffmpeg、Zsh/Fish。

### 📟 CLI 与终端 (CLI & Terminal)
- [**CLI 终极指南 (10技巧)**](cli/guide.md): Root 权限、synopkg、synosystemctl、磁盘分析。

### 👨‍💻 开发者进阶 (Developer)
- [**开发者进阶指南 (10技巧)**](developer-guide/dev-tips.md): Entware 包管理、Git Server、Python 虚拟环境、交叉编译。

### 🛠️ 进阶与自动化 (Advanced)
- [**勒索病毒防护与快照锁定**](advanced-skills/ransomware-protection.md): 3-2-1 备份最后防线、不可变快照 (Immutable)、WORM 技术。
- [**任务计划与脚本管理进阶**](advanced-skills/task-scheduler.md): Shell 脚本安全规范、环境变量陷阱、自动化清理。
- [**混合云架构实战**](advanced-skills/hybrid-cloud.md): Cloud Sync 联动网盘、Hyper Backup + S3 冷备、Hybrid Share。
- [**PXE 网络启动服务器 (10技巧)**](advanced-skills/pxe-boot.md): 网络重装 Windows、救砖神器 netboot.xyz。
- [**3-2-1 备份策略详解**](advanced-skills/backup-strategy.md): Hyper Backup, Active Backup for Business, 快照防护。
- [**Active Backup for Business 深度指南 (10技巧)**](advanced-skills/abb-guide.md): PC/Server/VM 整机备份、全局重删、VMM 即时还原。
- [**数据迁移与灾难恢复指南 (10技巧)**](migration/guide.md): 硬盘迁移、Migration Assistant、Hyper Backup 异地恢复。
- [**脚本与自动化 (10技巧)**](advanced-skills/automation.md): 开机脚本、Docker Compose、SSH 命令。
- [SSD 缓存配置](advanced-skills/ssd-cache.md): 缓存避坑指南。
- [Docker 与 Virtual DSM](advanced-skills/docker-guide.md): 基础教程。
- [跨 NAS 同步与备份](advanced-skills/cross-nas-sync.md): ShareSync 实战。

### 🔧 故障排除 (Troubleshooting)
- [**常见故障排除 (10技巧)**](troubleshooting/common-issues.md): 忘记密码、无法休眠、Docker下载失败、存储损毁。
- [**常见故障排查案例集**](troubleshooting/advanced-cases.md): RAID 降级修复、系统分区爆满、僵尸容器处理、循环登录自救。

### 🎁 其他 (Misc)
- [**冷知识与隐藏功能 (10技巧)**](misc/hidden-features.md): 快捷键、文件请求、日志报警。

## 贡献指南

欢迎提交 Pull Request 分享你的技巧！
