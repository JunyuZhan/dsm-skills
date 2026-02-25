# SynoCommunity 进阶指南：解锁 CLI 与 ffmpeg

SynoCommunity 是群晖官方认可的最大社群源，它不仅有 Jellyfin 这种大应用，更重要的是它提供了大量**系统级 CLI 工具**。如果你喜欢在 SSH 下操作 NAS，SynoCommunity 是你的宝库。

## 1. ffmpeg (多媒体解码核心)

群晖自带的 ffmpeg 版本非常老旧，且为了避开授权费用，阉割了大量音频编码（如 DTS, EAC3, TrueHD）。

**SynoCommunity 版 ffmpeg** 的优势：
*   **版本新**：紧跟 ffmpeg 官方 release，支持最新编码。
*   **解码全**：包含几乎所有常见的音视频解码器。
*   **Video Station 救星**：配合第三方脚本（如 `VideoStation-FFMPEG-Patcher`），可以让 Video Station 直接调用这个 ffmpeg，从而支持 DTS 音轨和 EAC3 音轨，彻底解决“不支持的音频格式”问题。

**安装后配置**：
安装后，新版 ffmpeg 位于 `/usr/local/ffmpeg/bin/ffmpeg`。你可以通过软链接替换系统默认 ffmpeg（需谨慎），或者在脚本中指定路径调用。

## 2. SynoCli File Tools (文件管理)

这是 SSH 党的必备工具包。安装后，你在终端里就有了类似 Linux 发行版的体验。

包含的工具：
*   **mc (Midnight Commander)**：一个基于文本界面的双栏文件管理器（类似 Total Commander）。在 SSH 里输入 `mc`，你可以用键盘快速复制、移动、编辑文件，不用再敲复杂的 `cp` / `mv` 命令。
*   **nano**：比 vi/vim 更容易上手的文本编辑器。Ctrl+O 保存，Ctrl+X 退出，底部有快捷键提示，适合新手修改配置文件。
*   **vim**：完整版 Vim，支持语法高亮、插件、鼠标操作。比系统自带的简版 vi 强太多。
*   **screen / tmux**：终端复用工具。你在 SSH 里跑一个耗时任务（如 rsync 备份），如果断开连接，任务会中断。用 screen/tmux，你可以随时断开连接，任务在后台继续跑，下次连上还能恢复现场。
*   **less**：比 `more` 更强大的文件查看器，支持前后翻页、搜索。

## 3. SynoCli Network Tools (网络调试)

当 NAS 网络出现问题，或者你想测试局域网速度时，这个包是神器。

包含的工具：
*   **nmap**：端口扫描神器。想知道局域网里有哪些设备？哪些设备开了 80 端口？`nmap -sP 192.168.1.0/24` 一键扫描。
*   **iperf3**：局域网测速标准工具。在 NAS 上运行 `iperf3 -s` 开启服务端，电脑上运行 `iperf3 -c nas-ip`，精准测试内网带宽是千兆还是万兆。
*   **rsync**：增量同步工具。虽然 DSM 自带，但社群版版本更新，支持更多参数。
*   **htop**：比 `top` 更直观的进程管理器。支持鼠标点击、颜色显示、树状视图，一眼看出哪个进程在吃 CPU。

## 4. Git (版本控制)

如果你是开发者，或者经常从 GitHub 拉取项目（如 Docker Compose 模板），系统自带的 git 可能太老。
*   **Gitea / GitLab**：如果你在 Docker 里部署了 Gitea，社群版 Git 可以作为宿主机的 git 客户端，方便进行 hooks 操作。

## 5. Python 3.10 / 3.11

很多社群套件（如 SickChill, Medusa）依赖 Python 环境。
*   **独立环境**：社群版 Python 安装在 `/usr/local/python3`，不会通过覆盖系统自带的 Python（DSM 依赖 Python 运行），保证系统稳定性。
*   **pip**：自带 `pip`，你可以安装任何 Python 库（如 `requests`, `numpy`），用来跑自己的脚本。
