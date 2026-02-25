# Video Station 与影视中心技巧

打造你的私人 Netflix，这里有 10 个关于 Video Station 和影音管理的技巧。

## 1. 解决搜刮器 (TMDB) 连接问题
Video Station 默认连接 TMDB 搜刮海报，但国内网络常导致连接失败。
- **技巧**：
    1.  申请 TMDB API Key (免费)。
    2.  设置 DNS 为公共 DNS (223.5.5.5 或 114.114.114.114)。
    3.  **进阶**：SSH 登录 NAS，修改 `/etc/hosts`，强制指定 `api.themoviedb.org` 的 IP 地址（通过 ping 检测最快的 IP）。

## 2. 视频命名规范
搜刮不到海报通常是文件名太乱。
- **规范**：
    - 电影：`电影名 (年份).mp4` 例如 `Avatar (2009).mkv`
    - 剧集：`剧集名/Season 1/剧集名 - S01E01.mp4`
- **工具**：推荐在电脑上用 **TMM (TinyMediaManager)** 先整理好，生成 NFO 文件，Video Station 可以直接读取 NFO。

## 3. 字幕插件配置
- **技巧**：Video Station 设置 > 插件。
- **Shooter (射手网)**：虽然官方插件有时不稳定，但可以尝试第三方修复版。
- **OpenSubtitles**：需要注册账号。
- **最佳实践**：还是建议下载视频时顺便下载字幕，或者用 **ChineseSubFinder** 这种 Docker 容器自动下载字幕。

## 4. 离线转码 vs 实时转码
- **实时转码**：播放时 CPU 实时解码。对 CPU 要求高（J4125 以上支持 4K 硬件转码）。
- **离线转码**：闲时把不兼容的格式（如 HEVC/DTS）转换成兼容性好的 MP4 (H.264/AAC)。
- **操作**：在视频上右键 > 离线转码。

## 5. DTS 音频编码问题
由于授权原因，Video Station 默认不支持 DTS/EAC3 音轨，播放时会没声音。
- **解决方案**：
    1.  安装第三方 **FFmpeg** 套件 (来自 SynoCommunity 源)。
    2.  使用 GitHub 上的 `Synology VideoStation-FFMPEG-Patcher` 脚本，一键破解 DTS 支持。

## 6. 使用 Infuse / nPlayer 代替 DS Video
Video Station 的播放器功能较弱。
- **技巧**：在 Apple TV / iPad 上购买 **Infuse**。
- **连接**：选择 "WebDAV" 或 "Synology" 协议连接 NAS。Infuse 的海报墙和解码能力秒杀官方 App，且支持杜比视界。

## 7. 开启 DLNA / UPnP
让家里的老旧智能电视也能看片。
- **路径**：安装 **媒体服务器 (Media Server)** 套件。
- **注意**：DLNA 没有海报墙，只有文件夹列表，且不支持外挂字幕。仅作为保底方案。

## 8. 权限管理：家长控制
- **技巧**：创建“儿童”账号。
- **操作**：在 Video Station 设置 > 权限中，只把“动画片”库的权限开放给“儿童”账号。

## 9. 远程播放省流技巧
- **技巧**：在外网播放时，Video Station 支持自动降码率。在 App 播放设置中，开启“根据网络质量自动调整”或手动锁定在 720P/2Mbps，防止跑光手机流量。

## 10. 视频库索引位置
- **技巧**：不仅仅是 `/video` 文件夹。你可以在 Video Station 设置中添加任意共享文件夹作为视频库。例如 `/download/completed`，下载完直接就能看，不用移动文件。
