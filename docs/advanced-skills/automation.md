# 脚本与自动化 (Advanced Scripts)

对于进阶用户，SSH 和脚本能解锁 DSM 的无限潜力。

## 1. 开机自启动脚本 (Startup Script)
DSM 默认没有 `rc.local`。
- **方法**：
    1.  控制面板 > 任务计划 > 新增 > 触发的任务 > 用户定义的脚本。
    2.  事件：开机。
    3.  用户：root。
    4.  脚本内容：输入你的 shell 命令，例如 `docker start my-container`。

## 2. 自动备份配置到云
不仅仅是 Hyper Backup。
- **脚本**：编写脚本打包 `/etc` 和 `/usr/syno/etc` 目录。
- **上传**：使用 `rclone` (需自行安装) 将备份包上传到 Google Drive 或 OneDrive。

## 3. Docker Compose 一键部署
比点点点快多了。
- **技巧**：在 Container Manager 中创建一个“项目”，直接粘贴 `docker-compose.yml` 内容。
- **优势**：更新容器时，只需 `docker-compose pull && docker-compose up -d`，配置不会丢。

## 4. SSH 常用命令
- `synouser`：管理用户（如修改密码、添加用户）。
    - `synouser --setpw admin newpassword` (重置 admin 密码)
- `synoshare`：管理共享文件夹。
- `synoservice`：管理系统服务（重启服务）。
    - `synoservice --restart pkgctl-SynologyDrive` (重启 Drive)

## 5. 修改 Host 文件
解决某些网站无法访问或内网 DNS 问题。
- **文件**：`/etc/hosts`。
- **注意**：DSM 更新可能会覆盖此文件，建议写个脚本在开机时自动追加内容。

## 6. 第三方社群源 (SynoCommunity)
获取更多套件。
- **URL**：`https://packages.synocommunity.com`
- **添加**：套件中心 > 设置 > 套件来源 > 新增。
- **软件**：FFmpeg, Git, Vim, Python3, Zsh 等。

## 7. USB 设备挂载与共享
- **技巧**：插入 USB 硬盘后，默认挂载在 `/volumeUSB1/usbshare`。
- **脚本**：可以编写 `udev` 规则，当插入特定 USB 设备时自动执行备份脚本（类似 USB Copy 套件，但更灵活）。

## 8. 虚拟机 VMM (Virtual Machine Manager)
- **用途**：运行 Windows 10/11 或 Ubuntu。
- **技巧**：
    - 安装 **Guest Tool** 以获得更好的性能和驱动支持。
    - **VirtIO**：硬盘和网卡务必选择 VirtIO 模式，性能差异巨大。

## 9. Active Backup for Business (ABB)
免费的企业级备份神器。
- **功能**：整机备份 Windows PC、服务器、虚拟机。
- **技巧**：
    - 支持 **全局重删**：10 台电脑备份，相同的系统文件只存一份，极度节省空间。
    - **即时还原**：备份的虚拟机可以直接在 VMM 中启动，秒级恢复业务。

## 10. Hyper Backup 版本轮换
- **策略**：Smart Recycle。
- **解释**：
    - 过去 24 小时：每小时保留一个版本。
    - 过去 1 个月：每天保留一个版本。
    - 更早：每周保留一个版本。
    - 这种策略既保证了近期数据的细颗粒度恢复，又避免了远期备份占用过多空间。
