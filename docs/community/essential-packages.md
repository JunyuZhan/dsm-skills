# 常用社群套件推荐 (SPK)

在添加了矿神或 SynoCommunity 源后，你会发现套件中心多了几百个应用。哪些是真正好用、值得安装的？这里是精选推荐。

## 1. qBittorrent (下载神器)

虽然 Download Station 也能用，但 qBittorrent 才是 PT/BT 玩家的首选。
*   **优势**：
    *   **连接性强**：拥有更激进的 DHT 网络，冷门资源也能跑满宽带。
    *   **WebUI**：拥有完整的 Web 界面，支持 RSS 订阅、自动分类、做种规则。
    *   **VueTorrent 主题**：矿神版集成了 VueTorrent 主题，手机端体验极佳。
*   **推荐源**：我不是矿神 (imnks)。

## 2. Transmission (保种神器)

如果你是各大 PT 站的忠实用户，Transmission 是最稳的保种工具。
*   **优势**：
    *   **极简**：资源占用极低，哪怕挂几千个种子，也能稳定运行。
    *   **兼容性**：几乎所有 PT 站都首推 Transmission。
    *   **WebUI**：社群版通常集成了 Transmission-Web-Control，比原版界面好用太多。
*   **推荐源**：SynoCommunity 或 我不是矿神。

## 3. Jellyfin / Emby / Plex (媒体中心)

虽然 Docker 版也能装，但社群版（SPK）在**硬件解码**方面有天然优势。
*   **优势**：
    *   **驱动调用**：SPK 版直接运行在宿主机，无需像 Docker 那样通过 `--device /dev/dri` 映射，直接调用核显。
    *   **性能**：针对 Synology 的特定 CPU 架构（如 J4125, N5105）进行了编译优化。
    *   **权限**：无需复杂的权限配置，安装即用。
*   **推荐源**：我不是矿神 (针对国内网络优化刮削)。

## 4. Nastools (自动化追剧)

虽然原作者已停止维护，但矿神源保留了最后一个稳定版（2.9.1）。
*   **优势**：
    *   **一站式**：集成了索引器（Prowlarr）、下载器（qBit/TR）、媒体库（Emby/Jellyfin）、消息推送（微信/Telegram）。
    *   **中文优化**：专为国人习惯打造，支持豆瓣同步、字幕下载、PT 站签到。
    *   **配置简单**：相比 Docker 版，SPK 版配置向导更友好。
*   **推荐源**：我不是矿神。

## 5. AliyunDriveWebDAV (网盘挂载)

将阿里云盘挂载为本地 WebDAV 服务。
*   **优势**：
    *   **不限速**：配合 Emby/Infuse，可以直接播放网盘里的 4K 原盘，不占用 NAS 存储空间。
    *   **本地化**：看起来就像本地文件夹一样。
*   **推荐源**：我不是矿神。

## 6. ZeroTier / Tailscale (内网穿透)

虽然 Docker 版也能用，但 SPK 版更稳定。
*   **优势**：
    *   **开机自启**：随系统启动，比 Docker 更早加载，防止 Docker 服务挂了连不上 NAS。
    *   **Tun 模式**：自动配置 `/dev/net/tun` 设备，无需手动加载内核模块。
*   **推荐源**：官方套件中心 (Tailscale) 或 我不是矿神 (ZeroTier)。

## 7. SynoCli (命令行工具)

如果你会用 SSH，这几个包必装。
*   **SynoCli File Tools**：`mc`, `nano`, `vim`, `screen`
*   **SynoCli Network Tools**：`nmap`, `iperf3`, `rsync`
*   **推荐源**：SynoCommunity。
