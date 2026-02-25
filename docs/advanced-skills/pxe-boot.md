# PXE 网络启动服务器配置

这是一个非常“极客”且实用的功能。想象一下，家里任何一台电脑需要重装系统，不需要找 U 盘，不需要制作启动盘，插上网线，开机按 F12，直接从 NAS 读取安装镜像。

## 原理简介

**PXE (Preboot Execution Environment)** 允许计算机通过网卡启动。
你需要：
1.  **DHCP 服务器**：分配 IP 并告诉电脑“启动文件在哪里”。
2.  **TFTP 服务器**：传输微小的启动文件。
3.  **HTTP/NFS/SMB 服务器**：传输庞大的系统镜像 (ISO)。

## 1. 准备启动文件 (netboot.xyz)

为了简化配置，我们使用神器 **netboot.xyz**。它是一个只有几 MB 的启动文件，启动后会自动联网下载各种系统（Windows, Ubuntu, Debian, Arch...）的安装程序。

1.  下载 [netboot.xyz.kpxe](https://boot.netboot.xyz/ipxe/netboot.xyz.kpxe) (适用于传统 BIOS)。
2.  下载 [netboot.xyz.efi](https://boot.netboot.xyz/ipxe/netboot.xyz.efi) (适用于 UEFI)。
3.  在 NAS 上创建一个共享文件夹 `pxe`，把这两个文件放进去。

## 2. 启用 TFTP 服务

1.  **控制面板** > **文件服务** > **高级** > **TFTP**。
2.  勾选 **启用 TFTP 服务**。
3.  **TFTP 根文件夹**：选择刚才创建的 `pxe` 文件夹。
4.  点击 **应用**。

## 3. 配置 DHCP 服务器

如果你的主路由（如 OpenWrt）支持设置 DHCP Option 66/67，建议在路由器上设。如果路由器不支持，可以用 Synology 的 DHCP Server。

**方案 A：使用 Synology DHCP Server**
1.  **控制面板** > **DHCP Server** > **网络界面** > 启用 LAN 口的 DHCP。
2.  **编辑** > **PXE**。
3.  勾选 **启用 PXE (pre-boot execution environment)**。
4.  **TFTP 服务器**：填 NAS 的 IP。
5.  **引导加载程序**：选择 `netboot.xyz.kpxe` (或者 EFI 版，视你的客户端而定)。
    *   *注意：这可能会导致局域网冲突，如果你已经有路由器发 DHCP，需要关闭路由器的 DHCP 或确保网段不冲突。*

**方案 B：配置 OpenWrt/RouterOS (推荐)**
*   **OpenWrt**: 在 DHCP 选项中添加 `66,NAS_IP` 和 `67,netboot.xyz.efi`。
*   **RouterOS**: IP > DHCP Server > Network > Next Server (NAS IP) > Boot File Name (netboot.xyz.efi)。

## 4. 实战：网络重装 Windows

1.  电脑开机，狂按 F12 (或 F8/Del) 进入启动菜单。
2.  选择 **LAN / Network Boot / PXE**。
3.  如果配置正确，你会看到 netboot.xyz 的彩虹菜单。
4.  选择 **Windows** > **Install Windows**。
5.  它会要求你提供一个存放 Windows ISO 解压文件的 SMB 共享路径。
    *   在 NAS 的 `pxe` 文件夹下新建 `windows10`，把 Win10 ISO 解压进去。
    *   在 netboot.xyz 菜单中填入 SMB 路径 `smb://NAS_IP/pxe/windows10`。
6.  开始安装！速度取决于你的局域网速度（千兆/2.5G）。

## 5. 实战：网络启动 Live Linux (救砖神器)

电脑中毒了？硬盘挂了？
1.  PXE 启动进入 netboot.xyz。
2.  选择 **Live CDs** > **Ubuntu** 或 **GParted**。
3.  直接在内存中运行 Linux 系统，挂载本地硬盘进行数据抢救或分区修复。

## 6. 自定义菜单 (iPXE)

如果你不想依赖 netboot.xyz 的在线菜单（断网就废了），可以编写自己的 `boot.ipxe` 脚本。
1.  在 `pxe` 文件夹新建 `boot.ipxe`。
2.  内容示例：
    ```ipxe
    #!ipxe
    menu My PXE Boot Menu
    item ubuntu Install Ubuntu 22.04
    item winpe  Windows PE
    choose target && goto ${target}

    :ubuntu
    kernel http://NAS_IP/pxe/ubuntu/vmlinuz
    initrd http://NAS_IP/pxe/ubuntu/initrd
    imgargs vmlinuz ip=dhcp url=http://NAS_IP/pxe/ubuntu/ubuntu.iso
    boot
    ```
3.  将 DHCP 的引导文件指向支持读取脚本的 `undionly.kpxe`。

## 7. 配合 VMM 测试

你不需要找台物理机测试。
1.  打开 **Virtual Machine Manager**。
2.  新建虚拟机。
3.  **ISO 文件用于启动**：留空。
4.  **网络**：选择连接到 NAS 局域网的虚拟交换机。
5.  启动虚拟机，它会自动尝试 PXE 启动。如果能看到菜单，说明配置成功。

## 8. 常见坑点

*   **UEFI vs Legacy**：现代电脑大多是 UEFI，必须推 `netboot.xyz.efi`。老电脑是 Legacy BIOS，必须推 `netboot.xyz.kpxe`。
*   **Secure Boot**：PXE 启动的二进制文件通常没有微软签名，需要在 BIOS 中关闭 Secure Boot。
*   **大小写敏感**：Linux (NAS) 对文件名大小写敏感，Windows 不敏感。引用文件路径时务必注意。
