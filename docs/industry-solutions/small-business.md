# 中小企业 (SMB)：构建低成本、高效率的办公协作中心

对于 10-50 人的小微企业，购买昂贵的服务器和微软授权往往成本过高。群晖 NAS 是一台开箱即用的企业级文件服务器、备份服务器和协作平台。

## 核心办公场景与替代方案

| 场景 | 传统昂贵方案 | 群晖免费方案 | 推荐 Docker 补充 |
| :--- | :--- | :--- | :--- |
| **文件共享** | Windows Server | **Synology Drive** / SMB 共享 | Nextcloud |
| **文档协作** | Office 365 / Google Docs | **Synology Office** | OnlyOffice |
| **企业邮箱** | Exchange / G Suite | **Synology MailPlus** (5 用户免费) | Postal |
| **即时通讯** | Slack / Teams | **Synology Chat** | Rocket.Chat / Mattermost |
| **全机备份** | Veeam | **Active Backup for Business** | UrBackup |
| **密码管理** | 1Password Team | - | **Vaultwarden** (Bitwarden) |

## 1. 企业级文件服务器搭建 (File Server)

### 团队文件夹 (Team Folder) 权限设计
不要让每个人都看到所有文件！
*   **架构建议**：
    *   `/Company` (只读：公司制度、Logo) - `Everyone: Read`
    *   `/Department/Sales` (读写：销售部) - `Group: Sales`
    *   `/Department/HR` (读写：人事部) - `Group: HR`
    *   `/Project/Project_A` (读写：项目组 A) - `User: Alice, Bob`
*   **权限继承**：尽量在根目录设置权限，子目录继承，避免复杂的 ACL 冲突。
*   **禁止删除**：启用 **WORM (Write Once Read Many)** 或在高级权限中勾选“禁止删除子文件夹和文件”，防止误删。

### Synology Drive 企业云盘
让员工像使用百度网盘一样工作。
1.  **启用团队文件夹**：在 Drive 管理控制台中启用 `/Company` 等文件夹。
2.  **版本控制**：设置保留 32 个历史版本，防止文件覆盖或勒索病毒。
3.  **按需同步**：在客户端开启“按需同步”，不占用员工电脑硬盘空间，只在打开文件时下载。

## 2. 勒索病毒防御与数据安全

### Active Backup for Business (ABB)
免费的企业级备份神器。
*   **整机备份**：一键备份员工 Windows 电脑系统盘。电脑坏了？插上恢复 U 盘，1 小时还原整个系统。
*   **文件服务器备份**：备份公司其他 Linux/Windows 服务器。
*   **虚拟机备份**：备份 VMware/Hyper-V 虚拟机。
*   **全局重删**：极为节省空间，10 台电脑备份可能只占 1.5 倍空间。

### Snapshot Replication (快照)
*   **防御勒索病毒**：如果公司中了勒索病毒，文件被加密。
*   **秒级恢复**：打开快照列表，还原到“今天早上 9:00”的状态，只需 1 秒。
*   **策略**：建议工作时间每小时拍一次快照，保留 24 小时；每天拍一次，保留 30 天。

## 3. 协同办公套件

### Synology Office
*   多人实时在线编辑 Word、Excel、PPT。
*   支持批注、修订模式。
*   完美兼容 Microsoft Office 格式 (.docx, .xlsx)。

### Synology Chat
*   企业内部聊天工具，数据私有化，不经过微信/钉钉服务器。
*   支持 Webhook，可集成 Gitlab 通知、Zabbix 报警。
*   *移动端*：有 iOS/Android APP，支持推送。

## 4. 推荐 Docker 企业应用

### Vaultwarden (密码管理)
企业最大的安全隐患是员工用弱密码或便利贴记密码。
*   **功能**：自建 Bitwarden 服务器，支持组织架构、密码共享。
*   **部署**：
    ```yaml
    version: '3'
    services:
      vaultwarden:
        image: vaultwarden/server:latest
        container_name: vaultwarden
        restart: always
        environment:
          - WEBSOCKET_ENABLED=true  # 开启 WebSocket 支持实时同步
          - SIGNUPS_ALLOWED=false   # 禁止外部注册，只允许管理员邀请
        volumes:
          - ./vw-data:/data
        ports:
          - 8085:80
    ```
*   **安全**：务必配合 HTTPS 使用！

### Paperless-ngx (无纸化办公)
将发票、合同、收据数字化并 OCR 识别。
*   **流程**：扫描仪扫描 -> 自动上传到 NAS -> Paperless 自动识别文字、归档、打标签。
*   **搜索**：以后找“2023 年 5 月 餐饮 发票”，直接搜索关键词即可，无需翻阅纸质文件。

## 5. 远程办公与 VPN

### VPN Server
*   **L2TP/IPSec**：兼容性好，所有电脑/手机自带客户端。
*   **OpenVPN**：安全性高，抗干扰强。
*   **使用场景**：员工在家办公，连接 VPN 后，就像在公司内网一样访问 NAS 和内部系统 (OA/ERP)。

### Tailscale (零配置组网)
如果公司没有公网 IP，Tailscale 是最佳选择。
*   在套件中心安装 Tailscale。
*   员工电脑安装 Tailscale 并登录同一账号。
*   直接通过 Tailscale IP 访问，无需端口转发，且支持 ACL 访问控制。

## 6. 硬件选型建议

*   **盘位**：建议 4 盘位起步 (DS923+, DS423+)，支持 RAID 5/6/10。
*   **网络**：如果多人同时访问大文件，建议配置双网口聚合或升级万兆。
*   **UPS**：**必须配备 UPS 不间断电源**！断电可能导致 RAID 损毁，数据无价。
