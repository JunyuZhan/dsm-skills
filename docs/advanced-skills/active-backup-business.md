# Active Backup for Business (ABB) 深度指南

如果说 Snapshot Replication 是 NAS 数据的守护神，那么 **Active Backup for Business (ABB)** 就是你所有电脑、服务器和虚拟机的守护神。

它是群晖送给用户的**企业级备份软件**（市面上同类软件如 Veeam, Acronis 授权费动辄几千美元）。

## 1. 核心功能

*   **整机备份 (Bare-metal Backup)**：不仅备份文件，连 Windows 系统、驱动、软件设置一起备份。电脑中毒或硬盘坏了？用恢复 U 盘引导，一键还原整个系统。
*   **全局重删 (Global Deduplication)**：如果你公司有 10 台电脑，大家都装了 Windows 10 和 Office。ABB 只会存储一份系统文件副本，极大地节省 NAS 空间。
*   **无感备份**：后台静默运行，占用资源极低，用户无感知。

## 2. 激活与安装

ABB 需要激活才能使用（免费）。
1.  **安装**：在套件中心安装 "Active Backup for Business"。
2.  **激活**：首次打开会提示登录 Synology Account。登录即可激活。

## 3. 备份 Windows 电脑 (PC/Mac)

### 步骤 1：NAS 端配置模板
1.  打开 ABB > **设置** > **模板**。
2.  创建一个新模板（如 "Office PC"）。
3.  **设备类型**：Windows / macOS。
4.  **保留策略**：建议开启。例如保留最近 7 天的每日版本，最近 4 周的每周版本。

### 步骤 2：客户端安装
1.  在电脑上下载 **Synology Active Backup for Business Agent**。
2.  安装并运行。
3.  输入 NAS IP、用户名、密码。
4.  连接成功后，备份会自动开始（或者按照模板设定的时间运行）。

## 4. 备份物理服务器 / 虚拟机

ABB 支持备份 Linux 服务器 (通过 SSH) 和 VMware/Hyper-V 虚拟机。

### Linux 服务器备份
不需要安装 Agent，直接通过 SSH 备份文件系统。
*   **模式**：支持“多版本”和“镜像”模式。
*   **关键点**：确保 SSH 账号有 root 权限（或 sudo 权限）。

### 虚拟机备份 (VMware/Hyper-V)
这是 ABB 最强大的地方。
1.  **添加 Hypervisor**：输入 vCenter 或 ESXi 的 IP 和凭据。
2.  **无代理备份**：ABB 会直接调用 VMware API 进行快照备份，不需要在每个虚拟机里装软件。
3.  **瞬时还原 (Instant Restore)**：
    *   虚拟机挂了？
    *   点击“在 Synology VMM 中还原”。
    *   NAS 会直接把备份文件挂载为虚拟磁盘，启动虚拟机。
    *   **耗时：几十秒**。业务瞬间恢复，然后再慢慢把数据迁移回生产环境。

## 5. 灾难恢复 (Bare-metal Recovery)

当电脑蓝屏、硬盘损坏时，如何还原？

### 制作恢复介质
1.  下载 **Synology Active Backup for Business Recovery Media Creator** 工具。
2.  插入一个空 U 盘。
3.  运行工具，它会自动下载 WinPE 环境并写入 U 盘。

### 还原流程
1.  将 U 盘插入故障电脑。
2.  BIOS 设置从 U 盘启动。
3.  进入 PE 界面，输入 NAS 地址连接 ABB。
4.  选择一个时间点的备份版本。
5.  选择目标硬盘（新硬盘）。
6.  点击还原。睡一觉，醒来电脑就回到了备份时的状态，连桌面图标都没变。

## 6. 常见问题

*   **Q: 备份速度慢？**
    *   A: 首次备份是全量备份，取决于网络和硬盘速度。后续都是增量备份 (CBT - Changed Block Tracking)，速度非常快。
*   **Q: macOS 支持吗？**
    *   A: 支持。需要 macOS Catalina 10.15.7 或更高版本。注意：macOS 需要授予“完全磁盘访问权限”。
*   **Q: 需要多大的 NAS？**
    *   A: ABB 极其节省空间（重删技术）。备份 10 台 500GB 的办公电脑，实际占用可能不到 2TB。但建议使用 **Plus 系列** 机型并开启 **Btrfs** 文件系统。
