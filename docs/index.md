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
- [**File Station 深度指南**](basic-skills/file-station.md): 远程挂载云盘/NAS、文件收集请求、全文搜索与 OCR、ACL 权限详解。
- [**存储管理器深度解析 (必读)**](basic-skills/storage-manager.md): RAID 选型 (SHR vs RAID5)、Btrfs 优势、数据清洗防腐烂。
- [**数据加密与密钥管理**](basic-skills/encryption-manager.md): 文件夹加密、物理 U 盘密钥、防盗指南。
- [**通知中心与日志审计**](basic-skills/notifications-logs.md): 微信/邮件推送配置、Log Center 审计文件删除记录。
- [**系统设置遗珠 (10技巧)**](basic-skills/system-gems.md): 登录界面美化、LED调节、UPS联动、微信推送等。
- [用户主目录服务](basic-skills/user-home.md): 个人空间设置。
- [系统安全性提升](basic-skills/security.md): 2FA、防火墙、自动封锁。
- [内存检查与优化](basic-skills/memory-check.md): 资源监控与优化。

### ⚙️ 硬件与维护 (Hardware & Maintenance)
- [**硬件选购与维护 (10技巧)**](hardware-maintenance/hardware-guide.md): 硬盘避坑(CMR/SMR)、NVMe 存储池、UPS 配置、静音改造。
- [**NVMe 存储池破解**](advanced-skills/nvme-storage-pool.md): 非官方支持机型启用 NVMe 存储空间 (Volume)。
- [**硬件周边选购指南**](hardware-maintenance/buying-guide.md): UPS 推荐、万兆网卡、ECC 内存、Zigbee 网关。

### 🎬 多媒体与娱乐 (Multimedia)
- [**私有云游戏串流 (Sunshine)**](multimedia/game-streaming.md): 4K 低延迟串流、Moonlight 客户端、异地远程唤醒 (WoL)。
- [**Immich AI 智能相册**](multimedia/immich-photos.md): Google Photos 完美替代、AI 人脸/物体识别、地图模式。
- [**MoviePilot 自动化追剧**](multimedia/moviepilot.md): 中文环境优化、微信/Telegram 推送、一站式媒体管理。
- [**Tautulli 媒体监控**](multimedia/tautulli-monitoring.md): Plex/Jellyfin 播放统计、实时转码监控、Telegram 通知。
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
- [**Tailscale 深度实战**](network/tailscale-derp.md): 自建 DERP 中转服务器、Headscale 私有控制台、Exit Node VPN 模式。
- [**Cloudflare Tunnel 深度实战**](network/cloudflare-tunnel.md): Zero Trust 安全防护、Private Network 内网访问、Public Hostname 暴露服务。
- [**ZeroTier 深度实战**](network/zerotier-moon.md): 自建 Moon 加速节点、ztncui 私有控制器、Flow Rules 流量控制。
- [**FRP 自建内网穿透**](network/frp-guide.md): 利用公网 VPS 自建高性能穿透、TCP/UDP/HTTP 协议支持。
- [**企业级身份认证 (AD 域控)**](network/directory-server.md): Windows 统一登录、GPO 组策略、漫游配置文件。
- [**NAS 安全加固与防火墙策略 (10技巧)**](network/security-hardening.md): GeoIP 阻断、SSH 密钥认证、DoS 防护。
- [**反向代理与 HTTPS 配置 (10技巧)**](network/reverse-proxy.md): 泛域名证书、WebSocket 支持、访问控制。
- [**acme.sh 泛域名证书自动化**](network/acme-sh-automation.md): Docker 部署、自动申请 Let's Encrypt 证书、自动部署到 DSM。
- [**MailPlus Server 邮件服务器 (10技巧)**](communication/mailplus-guide.md): 反垃圾策略、SMTP Relay、DKIM/SPF 配置。
- [**Synology Chat 机器人集成 (10技巧)**](communication/chat-integration.md): Webhook 推送、运维机器人、Slash Command。

### 🚀 生产力与办公 (Productivity)
- [**Homepage 导航面板**](productivity/homepage.md): 高颜值 Dashboard、Docker 容器状态监控、API 集成。
- [**Paperless-ngx 无纸化办公**](productivity/paperless-ngx.md): 账单/发票 OCR 自动识别、消费记录分析、全文搜索。
- [**Stirling-PDF 全能工具箱**](productivity/stirling-pdf.md): PDF 合并/拆分/OCR/加密/签名、Web 界面、API 调用。
- [**Synology Drive 深度实战**](productivity/drive-deep-dive.md): 团队协作、版本控制、按需同步、Office 在线编辑。
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

### 🤖 家庭自动化 (Home Automation)
- [**米家接入 HomeKit 深度桥接**](home-automation/homekit-bridge.md): YAML 过滤无用实体、伪装设备类型、虚拟开关触发场景。
- [**Home Assistant 深度实战**](home-automation/ha-deep-dive.md): HACS 插件、米家/HomeKit 双向桥接、自动化脚本。
- [**家庭自动化与 IoT (10技巧)**](home-automation/iot-guide.md): 智能家居网关、HomeBridge、Node-RED。

### 🐳 Docker 容器 (Docker)
- [**必备容器推荐 Top 20**](docker-containers/must-have.md): Portainer, Jellyfin, Nastools, Home Assistant 等。
- [**监控与仪表盘打造指南**](docker-containers/monitoring.md): Grafana, Prometheus, Homepage, Scrutiny。
- [**自动化追剧全家桶 (Arr Suite)**](docker-containers/arr-suite.md): Radarr, Sonarr, Prowlarr 架构与配置。
- [**自建密码库 Vaultwarden (10技巧)**](docker-containers/vaultwarden.md): 数据主权、HTTPS 配置、多端同步。
- [**Container Manager 进阶**](docker-containers/container-manager.md): Project (Compose) 管理、Web Station 门户联动、Internal 网络隔离。
- [**Portainer 深度指南**](docker-containers/portainer-advanced.md): Stacks (GitOps) 自动部署、App Templates 模板库、Edge Agent 远程管理。
- [**Docker Compose 常用堆栈模板 (10技巧)**](docker-containers/compose-templates.md): 媒体中心、HA、NPM、AdGuard Home 一键部署。
- [**AI 大模型本地部署指南**](docker-containers/local-ai.md): Ollama + Open WebUI 打造私人 ChatGPT，RAG 知识库。
- [**Dify AI 应用构建**](ai-deployment/dify-rag.md): 可视化编排 AI Agent、企业级 RAG 知识库、Workflow 工作流。
- [**OpenClaw AI 智能体**](docker-containers/openclaw.md): 部署你的个人 AI 助理，自主执行任务。
- [**OpenClash 旁路由实战**](docker-containers/openclash.md): Macvlan 网络配置、局域网透明代理。
- [**游戏服务器搭建 (Palworld/MC)**](docker-containers/game-servers.md): 幻兽帕鲁、Minecraft 开服教程与内存优化。
- [**Traefik 进阶与泛域名**](docker-containers/traefik-advanced.md): 自动发现容器、自动申请泛域名证书、中间件安全防护。
- [**Nginx Proxy Manager 可视化反代**](docker-containers/nginx-proxy-manager.md): Web 界面管理反向代理、自动 SSL 续期、访问控制列表。
- [**Docker 网络进阶**](docker-containers/network-guide.md): Macvlan 独立 IP、Traefik 自动发现、Socket 代理安全.

### 📦 社群扩展 (Community Extensions)
- [**第三方社群套件源推荐**](community/third-party-repos.md): 我不是矿神、裙下孤魂、SynoCommunity 等优质源。
- [**常用社群套件推荐**](community/essential-packages.md): qBittorrent, Jellyfin, Nastools, Transmission 必装列表。
- [**SynoCommunity 进阶指南**](community/synocommunity-guide.md): 解锁 ffmpeg 解码、CLI 瑞士军刀 (mc/nano/htop)。
- [**社群第三方套件推荐 (10技巧)**](community/packages.md): 基础入门介绍与安装方法。

### 📟 CLI 与终端 (CLI & Terminal)
- [**CLI 终极指南 (10技巧)**](cli/guide.md): Root 权限、synopkg、synosystemctl、磁盘分析。

### 🧑‍💻 开发者进阶 (Developer)
- [**Ansible NAS 自动化运维**](developer-guide/ansible-nas-automation.md): 批量更新 Docker、自动分发证书、磁盘监控报警。
- [**自动化运维 (Ansible) 入门**](developer-guide/ansible-guide.md): 批量管理设备、Playbook 编写、Docker 批量部署。
- [**DSM 自动化开发指南 (API)**](developer-guide/api-automation.md): Python 调用群晖 Web API、抓包逆向、脚本实战。
- [**开发者指南 (10技巧)**](developer-guide/dev-tips.md): SSH 密钥登录、Git Server、Python 环境、Crontab.

### 🛠️ 进阶与自动化 (Advanced)
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
