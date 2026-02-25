# Video Station 深度指南：解决“能看”到“好用”的最后一公里

Video Station 是 DSM 自带的影音中心，虽然界面精美，但默认情况下对 DTS/EAC3 音频和 HEVC 视频的支持非常糟糕。本指南将教你如何彻底解锁它的潜力。

## 1. 核心痛点与解决方案

| 痛点 | 现象 | 根源 | 解决方案 |
| :--- | :--- | :--- | :--- |
| **DTS/EAC3 无声** | 播放 MKV 电影时有画面没声音，提示“不支持的音频格式”。 | 授权费太贵，群晖没买。 | 安装 FFmpeg + 破解脚本。 |
| **HEVC/H.265 黑屏** | 网页版播放 iPhone 拍的视频黑屏或转圈。 | 浏览器不支持 HEVC，且 DSM 没激活解码器。 | 安装 AME 套件 + 激活。 |
| **搜刮失败** | 电影海报全是灰色，搜不到信息。 | TMDB API 被墙。 | 修改 hosts 或使用代理。 |

## 2. 解锁 DTS/EAC3/TrueHD 音频

这是最关键的一步。

### 步骤 A：安装 FFmpeg
1.  **添加社群源**：套件中心 > 设置 > 套件来源 > 新增 `https://packages.synocommunity.com`。
2.  **安装套件**：在社群标签下搜索 **FFmpeg 6** (推荐) 或 FFmpeg 4。安装它。

### 步骤 B：运行破解脚本 (Wrapper)
FFmpeg 只是个工具，我们需要告诉 Video Station 去调用它。
1.  **SSH 登录 NAS**。
2.  **一键脚本** (推荐 DarkNebula 的项目)：
    ```bash
    # 这是一个通用的 Wrapper 脚本，会自动替换 Video Station 的转码器
    curl https://raw.githubusercontent.com/AlexPresso/VideoStation-FFMPEG-Patcher/main/patcher.sh | bash
    ```
3.  **选择项**：脚本运行过程中会问你是否要把 DTS 转码为 AAC，或者是 AC3。建议选 AAC，兼容性最好。
4.  **重启**：脚本运行完毕后，去套件中心停用再启用 Video Station。

**验证**：找一部带 DTS 音轨的电影播放，如果耳朵怀孕了，说明成功。

## 3. 激活 HEVC (H.265) 支持

### 步骤 A：安装 AME
1.  在套件中心安装 **Advanced Media Extensions (AME)**。
2.  **必须登录**：打开 AME，它会要求你登录 Synology Account。登录后它会自动下载解码包（HEVC/AAC）。

### 步骤 B：黑群晖的痛 (半白/全白)
*   **全白 (有 SN/MAC)**：直接登录即可激活。
*   **黑群晖**：AME 3.x 版本验证非常严格。如果你无法登录，需要使用破解补丁。
    *   搜索脚本：`AME 3.x Patch`。
    *   原理：模拟官方授权文件，欺骗 AME 以为已激活。

## 4. 搜刮器 (TMDB) 网络优化

海报墙是 Video Station 的灵魂。

### 修改 Hosts 法
1.  在电脑上 ping `api.themoviedb.org`，找到一个响应最快的 IP（如 `13.224.161.90`）。
2.  SSH 登录 NAS。
3.  编辑 hosts：`sudo vi /etc/hosts`。
4.  添加一行：`13.224.161.90 api.themoviedb.org`。
5.  重启 Video Station，重新索引。

### 代理法 (更稳)
如果你有软路由或透明代理，确保 NAS 的流量经过代理即可。

## 5. 命名规范与 NFO

即使网络通了，文件名太乱也搜不到。

*   **标准命名**：
    *   `Avatar (2009).mkv`
    *   `Inception (2010)/Inception (2010).mp4`
*   **剧集**：
    *   `Friends/Season 1/Friends - S01E01.mkv`
*   **终极方案 (TinyMediaManager)**：
    *   在电脑上用 TMM 搜刮好，生成 `movie.nfo` 和 `poster.jpg`。
    *   Video Station 会优先读取本地 NFO，**100% 准确**，无需联网。

## 6. Video Station vs Plex/Emby/Jellyfin

什么时候该放弃 Video Station？

*   **坚持用 Video Station**：
    *   你只在局域网看片。
    *   你是正版群晖用户，不想折腾 Docker。
    *   你需要 DS Video 这种原生 App 的丝滑体验（虽然功能弱）。
*   **转向 Plex/Emby**：
    *   你需要**杜比视界 (Dolby Vision)** 支持。
    *   你有大量 ASS 特效字幕（Video Station 对特效字幕支持极差）。
    *   你需要跨平台同步播放进度（在电视看了一半，去厕所用手机接着看）。
    *   你的海报墙有几千部电影（Video Station 会卡顿）。

## 7. 离线转码 (Offline Transcoding)

如果你的 NAS CPU 太弱（如 J1900 或 ARM），实时转码会卡死。
*   **技巧**：利用闲时（半夜）进行离线转码。
*   **操作**：在影片上右键 > **离线转码** > 选择目标质量（如 1080P 高画质）。
*   **结果**：NAS 会生成一个兼容性极好的 MP4 版本。以后播放时直接串流这个 MP4，CPU 占用率为 0。
