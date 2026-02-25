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
- [**系统设置遗珠 (10技巧)**](basic-skills/system-gems.md): 登录界面美化、LED调节、UPS联动、微信推送等。
- [用户主目录服务](basic-skills/user-home.md): 个人空间设置。
- [系统安全性提升](basic-skills/security.md): 2FA、防火墙、自动封锁。
- [内存检查与优化](basic-skills/memory-check.md): 资源监控与优化。

### ⚙️ 硬件与维护 (Hardware & Maintenance)
- [**硬件选购与维护 (10技巧)**](hardware-maintenance/hardware-guide.md): 硬盘避坑(CMR/SMR)、NVMe 存储池、UPS 配置、静音改造。

### 🎬 多媒体与娱乐 (Multimedia)
- [**Photos 进阶技巧 (10技巧)**](multimedia/photos-tricks.md): 人脸识别、条件相册、权限管理。
- [**Video Station 与影视中心 (10技巧)**](multimedia/video-audio.md): TMDB搜刮修复、DTS解码、字幕插件。
- [**Download Station 进阶下载 (10技巧)**](download-tools/download-station.md): RSS 自动追剧、搜索插件 DLM、eMule。

### 👁️ 视频监控 (Surveillance)
- [**Surveillance Station 监控指南 (10技巧)**](surveillance/guide.md): 免费授权迁移、H.265 省空间、智能动作侦测、Home Mode。

### 🌐 网络与安全 (Network)
- [**网络与远程访问 (10技巧)**](network/access-security.md): QuickConnect vs DDNS、IPv6、端口转发、VPN Server。
- [**反向代理与 HTTPS 配置 (10技巧)**](network/reverse-proxy.md): 泛域名证书、WebSocket 支持、访问控制。
- [**MailPlus Server 邮件服务器 (10技巧)**](communication/mailplus-guide.md): 反垃圾策略、SMTP Relay、DKIM/SPF 配置。
- [**Synology Chat 机器人集成 (10技巧)**](communication/chat-integration.md): Webhook 推送、运维机器人、Slash Command。

### 🚀 生产力与办公 (Productivity)
- [**生产力工具 (10技巧)**](productivity/drive-office.md): Drive 版本回溯、Office 协作、Note Station 剪藏。

### 💻 虚拟化与建站 (Virtualization & Web)
- [**Virtual Machine Manager 实战 (10技巧)**](virtualization/vmm-guide.md): Windows LTSC 优化、OpenWrt 软路由、USB 直通。
- [**Web Station 建站指南 (10技巧)**](web-dev/website-hosting.md): PHP 优化、WordPress 加速、Node.js 部署。

### 🖥️ 系统深度集成 (OS Integration)
- [**Mac/Windows 深度集成技巧 (10技巧)**](platform-specific/os-integration.md): Time Machine 优化、Spotlight 索引、iSCSI 游戏库、AD 域控。

### 🐳 Docker 容器 (Docker)
- [**必备容器推荐 Top 20**](docker-containers/must-have.md): Portainer, Jellyfin, Nastools, Home Assistant 等。
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
- [**3-2-1 备份策略详解**](advanced-skills/backup-strategy.md): Hyper Backup, Active Backup for Business, 快照防护。
- [**Active Backup for Business 深度指南 (10技巧)**](advanced-skills/abb-guide.md): PC/Server/VM 整机备份、全局重删、VMM 即时还原。
- [**数据迁移与灾难恢复指南 (10技巧)**](migration/guide.md): 硬盘迁移、Migration Assistant、Hyper Backup 异地恢复。
- [**脚本与自动化 (10技巧)**](advanced-skills/automation.md): 开机脚本、Docker Compose、SSH 命令。
- [SSD 缓存配置](advanced-skills/ssd-cache.md): 缓存避坑指南。
- [Docker 与 Virtual DSM](advanced-skills/docker-guide.md): 基础教程。
- [跨 NAS 同步与备份](advanced-skills/cross-nas-sync.md): ShareSync 实战。

### 🔧 故障排除 (Troubleshooting)
- [**常见故障排除 (10技巧)**](troubleshooting/common-issues.md): 忘记密码、无法休眠、Docker下载失败、存储损毁。

### 🎁 其他 (Misc)
- [**冷知识与隐藏功能 (10技巧)**](misc/hidden-features.md): 快捷键、文件请求、日志报警。

## 贡献指南

欢迎提交 Pull Request 分享你的技巧！
