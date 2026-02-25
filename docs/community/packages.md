# 社群第三方套件推荐

Synology 官方套件中心虽然稳定，但数量有限。通过添加 **SynoCommunity** 社群源，你可以解锁数百个由社区维护的免费套件，极大地扩展 NAS 的功能。

## 如何添加社群源

1.  打开 **套件中心**。
2.  点击右上角的 **设置**。
3.  在 **常规** 选项卡中，将信任级别设置为 **“Synology Inc. 和信任的发行者”**。
4.  切换到 **套件来源** 选项卡。
5.  点击 **新增**：
    *   **名称**：SynoCommunity
    *   **位置**：`https://packages.synocommunity.com/`
6.  点击 **确定** 保存。
7.  回到套件中心，左侧会出现 **社群** 标签页，刷新即可看到新套件。

---

## 必装社群套件推荐 (Top 10)

虽然现在 Docker 很流行，但原生套件在系统集成度、资源占用和使用便捷性上仍有优势，特别是对于 CLI 工具。

### 1. SynoCli File Tools

**CLI 用户的瑞士军刀。**
包含了一系列强大的命令行文件管理工具，无需 Docker，直接在 SSH 中使用。
*   包含工具：`mc` (Midnight Commander, 类似 DOS 下的 Norton Commander), `nano` (比 vi 更好用的编辑器), `vim`, `less`, `screen` 等。

### 2. SynoCli Network Tools

**网络诊断必备。**
包含了专业的网络调试工具。
*   包含工具：`nmap` (端口扫描), `iperf3` (局域网测速神器), `rsync`, `screen`, `tmux` 等。

### 3. Git

**版本控制。**
虽然 DSM 自带 git，但版本通常较旧。社群版 Git 保持更新，适合开发者使用。

### 4. Zsh / Fish Shell

**告别简陋的 Ash/Bash。**
提供了更强大的 Shell 环境，支持自动补全、主题配置（如 Oh My Zsh）。安装后需在 SSH 中配置默认 Shell。

### 5. ffmpeg

**视频解码核心。**
很多多媒体应用（如 Video Station, Plex, Jellyfin）都需要它。社群版 ffmpeg 包含更全的解码器，能解决很多视频无法播放或 DTS 音频不支持的问题。

### 6. Python 3.10 / 3.11

**运行 Python 脚本。**
DSM 自带的 Python 版本可能较旧或缺少库。社群版提供了更新的 Python 环境，方便运行各种自动化脚本。

### 7. Jellyfin (原生版)

**免费的媒体中心。**
如果你不想折腾 Docker 的硬件直通，原生版 Jellyfin 是个好选择。它能直接调用 NAS 的核显进行转码，安装配置比 Docker 简单。

### 8. Transmission / qBittorrent

**PT 下载神器。**
虽然 Download Station 基于 Transmission，但功能阉割严重。社群版 Transmission 和 qBittorrent 提供了完整的 WebUI，支持更多高级设置（如 RSS 订阅、连接数优化）。

### 9. Home Assistant Core

**智能家居中枢。**
提供原生安装包，适合不想用 Docker 的用户。不过注意，原生版在通过 USB 连接 Zigbee/Z-Wave 棒时可能遇到驱动问题，此时 Docker 版可能更灵活。

### 10. Vim

**编辑器之神。**
如果你是 Vim 党，系统自带的 vi 功能太简陋。社群版 Vim 是完整版，支持语法高亮和插件。

---

## 注意事项

1.  **更新频率**：社群套件由志愿者维护，更新速度可能不如 Docker 镜像快。
2.  **兼容性**：升级 DSM 大版本（如 7.1 -> 7.2）前，留意社群套件是否已支持新系统。
3.  **Docker vs 原生**：
    *   **首选 Docker**：对于应用类（如 Jellyfin, Home Assistant, qBittorrent），Docker 隔离性好，更新快，迁移方便。
    *   **首选原生**：对于底层工具类（如 CLI 工具, ffmpeg, 驱动），原生套件更方便。
