# 第三方社群套件源推荐 (SPK)

虽然 Docker 是目前的主流，但对于不想折腾命令行的用户，或者需要底层驱动支持（如核显驱动、USB 驱动）的场景，**社群套件 (SPK)** 依然是首选。

本文整理了目前国内最活跃、最好用的第三方套件源，让你的一键安装体验拉满。

## 1. 我不是矿神 (imnks)

这是目前国内**最强、最全、更新最快**的第三方源。作者制作了大量高质量的 SPK 包，完美适配 DSM 7.x。

*   **源地址**：`https://spk7.imnks.com/`
*   **适用系统**：DSM 7.x (DSM 6.x 请用 `https://spk.imnks.com/`)
*   **必装套件**：
    *   **Jellyfin / Emby / Plex**：针对不同 CPU 架构（Intel/AMD/ARM）优化的版本，比 Docker 版更容易调用核显。
    *   **qBittorrent**：包含 4.x 和 5.x 版本，且集成了最新的 WebUI 主题。
    *   **Transmission**：带中文 WebUI，优化了连接数限制。
    *   **Nastools**：虽然原版已闭源，但矿神源保留了最后一个可用版本，且修复了部分刮削问题。
    *   **FRP 客户端**：提供图形化界面配置 frpc.ini，小白福音。
    *   **AliyunDriveWebDAV**：将阿里云盘挂载为 WebDAV，方便 Emby 直接读取云端资源。

## 2. 裙下孤魂 (Synology-CNO)

这是一个专注于**破解与魔改**的源，适合进阶玩家。

*   **源地址**：`http://packages.synology-cno.cc` (注意是 http)
*   **特色套件**：
    *   **AME (Advanced Media Extensions) 破解版**：解决 Photos 无法查看 HEIC/HEVC 图片和视频的问题（无需登录群晖账号）。
    *   **Surveillance Station 授权破解**：解除摄像头数量限制（需配合特定版本）。
    *   **Video Station DTS 补丁**：让 Video Station 支持 DTS/EAC3 音频解码。

## 3. 云梦 (CoCo)

比较老牌的源，虽然更新频率不如矿神，但有些老版本套件依然好用。

*   **源地址**：`https://spk.520810.xyz:666`
*   **特色**：
    *   提供了一些去广告版的套件。
    *   集成了一些网络工具。

## 4. SynoCommunity (官方社群)

这是群晖官方认可的全球最大社群源，虽然服务器在国外（下载慢），但它的套件最规范、最安全。

*   **源地址**：`https://packages.synocommunity.com/`
*   **必装套件**：
    *   **SynoCli File Tools**：包含 `nano`, `vim`, `mc`, `screen` 等命令行工具，SSH 党必备。
    *   **SynoCli Network Tools**：包含 `nmap`, `iperf3`, `rsync` 等网络调试工具。
    *   **Git**：比群晖自带的版本更新，支持更多特性。
    *   **Python 3.10/3.11**：为其他套件提供运行环境。
    *   **ffmpeg**：提供最全的解码器支持，Video Station 和 Photos 的幕后功臣。

## 5. 4PDA (俄语大神)

俄罗斯大神的源，包含了很多破解和去限制的套件。

*   **源地址**：`https://spk.4pda.to`
*   **注意**：部分界面是俄语，需要配合翻译使用。

## 6. 常见问题

### Q1: 添加源提示“无效的位置”？
*   **HTTPS/HTTP**：检查前缀。DSM 7 默认要求 HTTPS，如果源只有 HTTP，系统会拦截。
*   **证书问题**：进入 **套件中心** > **设置** > **证书**，导入该源的根证书（如果有提供）。
*   **网络问题**：部分源（如 SynoCommunity）在国外，可能需要科学上网或使用代理才能添加。

### Q2: 安装套件提示“无效的数字签名”？
*   进入 **套件中心** > **设置** > **常规** > **信任级别**。
*   选择 **“任何发行者”**（最宽松）。
*   安装完后建议改回 **“Synology Inc. 和信任的发行者”** 以保证安全。

### Q3: 矿神源的套件和 Docker 版有什么区别？
*   **权限**：SPK 套件运行在系统层面，权限较高，调用 `/dev/dri` (核显) 或 `/dev/ttyUSB0` (Zigbee 棒) 更方便。
*   **文件结构**：Docker 版文件都在映射的文件夹里，迁移方便；SPK 版文件分散在系统目录，卸载可能残留。
*   **推荐**：
    *   **小白/不想折腾**：选矿神 SPK。
    *   **极客/有洁癖**：选 Docker。
