# Mac/Windows 深度集成技巧

让 NAS 真正融入你的操作系统，像本地硬盘一样丝滑。

## Mac 专属技巧

### 1. Time Machine (时间机器) 优化
- **配额限制**：务必为 Time Machine 创建一个单独的共享文件夹，并为该文件夹（或用户）设置**配额**（例如 2TB）。否则 TM 会吃光你 NAS 的所有空间。
- **SMB vs AFP**：虽然 Apple 发明了 AFP，但现在**强烈建议使用 SMB**。AFP 已被弃用。在“文件服务 > 高级”中，勾选“通过 SMB 播送 Bonjour Time Machine”。

### 2. Spotlight 索引 (搜索 NAS 文件)
- **痛点**：默认情况下，Mac 的 Spotlight (Cmd+Space) 搜不到 NAS 里的文件。
- **解决**：
    1.  **Universal Search**：在 NAS 上安装此套件，它会建立服务端索引。
    2.  **挂载索引**：在 Mac 终端中启用索引（需谨慎，可能会导致网络流量激增）。
    3.  **替代方案**：使用 **Find Any File** 或 **EasyFind** 等第三方工具搜索网络驱动器，或者直接在 DSM 网页版用 Universal Search。

### 3. 访达 (Finder) 侧边栏固定
- **技巧**：连接 NAS 后，将共享文件夹直接拖动到 Finder 左侧的“个人收藏”栏。这样下次点击时会自动挂载，无需每次都 `Cmd+K`。

### 4. 解决 .DS_Store 垃圾文件
- **痛点**：Mac 会在每个目录生成 `.DS_Store`。
- **解决**：
    - 在 NAS 的 SMB 设置中，虽然有“禁止 Mac 写入 .DS_Store”的选项，但可能会影响 Finder 记住视图设置（如图标位置）。建议忍受它，或者在 Git 中忽略它。

### 5. 传输速度优化
- **技巧**：在“网络 > 网络界面”中，如果 Mac 和 NAS 都支持万兆 (10GbE)，务必开启**巨型帧 (Jumbo Frame)** (MTU 9000)，可以显著提升大文件传输效率。

---

## Windows 专属技巧

### 6. iSCSI 游戏库 (Steam Library)
- **场景**：电脑硬盘不够装 3A 大作？
- **原理**：iSCSI 把 NAS 的一部分空间模拟成一个**本地物理硬盘**（如 D 盘），而不是网络映射驱动器。
- **优势**：Steam/Epic 会认为它是本地盘，完美支持游戏安装和运行。
- **配置**：
    1.  NAS: 存储管理器 > iSCSI Manager > 创建 Target 和 LUN。
    2.  PC: 搜索 "iSCSI 发起程序" > 输入 NAS IP > 连接。
    3.  PC: 磁盘管理 > 初始化新磁盘 > 格式化为 NTFS。

### 7. WS-Discovery (网上邻居发现)
- **痛点**：在“网络”里看不到 NAS 图标。
- **解决**：控制面板 > 文件服务 > SMB > 高级设置 > 勾选 **启用 WS-Discovery**。

### 8. 卷影复制 (Shadow Copy / 以前的版本)
- **功能**：在 Windows 资源管理器中右键文件 > 属性 > 以前的版本，可以直接恢复 NAS 文件的历史版本。
- **配置**：需在 NAS 上安装 **Snapshot Replication** 套件，并开启快照功能。Windows 会自动通过 SMB 协议读取快照信息。

### 9. 离线文件 (Offline Files)
- **场景**：笔记本带回家工作，到公司自动同步。
- **设置**：右键映射的网络驱动器 > 始终脱机可用。
- **注意**：这会占用电脑本地硬盘空间，且容易产生冲突，建议改用 **Synology Drive Client** 进行同步。

### 10. AD 域控集成 (Active Directory)
- **场景**：企业环境。
- **功能**：将 NAS 加入 Windows AD 域。
- **优势**：员工可以直接使用域账号（如 `company\zhangsan`）登录 NAS，无需单独创建账号，权限管理与 Windows Server 无缝对接。
