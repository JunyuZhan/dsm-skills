# NVMe 存储池破解指南 (非官方支持机型)

许多 Synology NAS（如 DS918+, DS920+, DS1621+, DS1821+）虽然配备了 M.2 NVMe 插槽，但官方只允许将其用作缓存，**不允许创建存储池 (Volume)**。这对于想要在高速 SSD 上运行 Docker、虚拟机或数据库的用户来说极其浪费。

本指南将教你如何通过 SSH 命令解除限制，让 NVMe 变成普通的存储空间。

!!! warning "高风险操作警告"
    此操作涉及修改系统底层配置，虽然已被社区广泛验证可行，但仍存在风险：
    1.  **数据丢失**：操作失误可能导致数据丢失。请务必备份重要数据。
    2.  **官方支持**：群晖官方不支持此操作，可能会影响技术支持服务。
    3.  **系统更新**：DSM 大版本更新后可能需要重新执行脚本。
    4.  **散热问题**：NVMe 长期读写发热量大，请注意散热，否则会降速。

## 1. 准备工作

*   **硬件**：已安装 M.2 NVMe SSD（单条或两条均可）。
*   **SSH**：开启 SSH 功能（控制面板 > 终端机和 SNMP > 启动 SSH 功能）。
*   **工具**：Putty (Windows) 或 Terminal (Mac)。

## 2. 自动脚本法 (推荐)

社区大神 `007revad` 开发了一个强大的脚本，可以一键解决 NVMe 存储池问题。

### 步骤
1.  **下载脚本**：
    SSH 登录 NAS，下载最新版脚本：
    ```bash
    wget https://github.com/007revad/Synology_HDD_db/releases/latest/download/syno_hdd_db.sh
    chmod +x syno_hdd_db.sh
    ```
    *注意：如果无法连接 GitHub，请使用代理或手动下载后上传到 NAS。*

2.  **运行脚本**：
    ```bash
    sudo ./syno_hdd_db.sh -n
    ```
    *   `-n`: 表示处理 NVMe 驱动器。
    *   脚本会自动检测你的 NAS 型号、DSM 版本，并修改 `/etc.defaults/synoinfo.conf` 等配置文件，添加 NVMe 支持。

3.  **重启 NAS**：
    脚本运行完毕后，必须重启 NAS 才能生效。
    ```bash
    reboot
    ```

4.  **创建存储池**：
    重启后，打开 **存储管理器** > **存储** > **创建** > **创建存储池**。
    你会惊喜地发现，现在的 M.2 SSD 已经可以像普通硬盘一样被选中了！

## 3. 手动修改法 (硬核)

如果脚本失效，或者你想了解原理，可以手动操作。原理是伪装 NAS 型号或者修改 `support_nvme_pool` 参数。

### 步骤
1.  **查看 NVMe 设备路径**：
    ```bash
    ls /dev/nvme*n1
    # 通常是 /dev/nvme0n1 和 /dev/nvme1n1
    ```

2.  **创建分区**：
    使用 `synopartition` 工具（注意：危险操作，确保选对盘！）。
    ```bash
    synopartition --part /dev/nvme0n1 12
    # 12 代表创建数据分区
    ```

3.  **创建存储池 (RAID)**：
    *   **单盘 Basic**：
        ```bash
        mdadm --create /dev/md3 --level=1 --raid-devices=1 --force /dev/nvme0n1p3
        ```
    *   **双盘 RAID 1**：
        ```bash
        mdadm --create /dev/md3 --level=1 --raid-devices=2 --force /dev/nvme0n1p3 /dev/nvme1n1p3
        ```
    *   *注意：`/dev/md3` 是新的 RAID 设备名，如果已有 md3，请顺延使用 md4。*

4.  **格式化 (Btrfs)**：
    ```bash
    mkfs.btrfs -f /dev/md3
    ```

5.  **重启**：
    重启后，存储管理器中会显示一个“可用”的存储池，但可能会提示“系统分区未格式化”或“检测到未验证的硬盘”。点击“在线重组”或忽略警告即可。

## 4. 常见问题 (FAQ)

### Q1: 创建完存储池后，可以把套件迁移过去吗？
可以。
*   **方法**：使用第三方脚本 `app-mover`，或者卸载套件重新安装，安装时选择新的 NVMe 存储空间。
*   **Docker**：停止 Docker 服务，将 `/volume1/docker` 移动到 `/volume2/docker`（假设 NVMe 是 volume2），修改 Docker 配置指向新路径。

### Q2: 速度有多快？
*   **连续读写**：受限于 PCIe 通道（通常是 PCIe 2.0 x1 或 x2），速度在 500MB/s - 1000MB/s 之间。虽然跑不满 NVMe 的 3000MB/s，但比 SATA SSD 快，更是吊打 HDD。
*   **随机读写 (IOPS)**：这是质的飞跃。虚拟机启动、Docker 容器加载、大量小文件索引（如 Photos）会变得极其流畅。

### Q3: 关机后数据会丢吗？
不会。数据是持久化存储在 SSD 闪存颗粒里的。但如果 SSD 坏了，数据就真没了。**强烈建议组 RAID 1，并定期备份重要数据到 HDD 存储池。**
