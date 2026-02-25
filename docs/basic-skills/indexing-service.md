# 索引服务 (Indexing Service) 深度解析：性能与体验的平衡

群晖最让新手困惑的问题之一：“我明明把电影拷进去了，为什么 Video Station/电视上看不到？”或者“为什么 CPU 占用一直是 99%？”这背后的元凶（或者功臣）就是 **索引服务**。

## 1. 索引的“双轨制”

群晖的索引分为两套独立的系统，互不干涉：

### A. 媒体索引 (Media Indexing)
*   **负责对象**：图片、音乐、视频。
*   **服务组件**：`synoindex` / `synomediaparserd`。
*   **受众**：Video Station, Audio Station, Synology Photos, DLNA/UPnP 设备 (电视/音箱)。
*   **作用**：提取元数据（封面、歌手、拍摄时间），生成缩略图。

### B. 文件索引 (File Indexing)
*   **负责对象**：文档、代码、文件名。
*   **服务组件**：Universal Search (`synoelastic` / `fileindexd`)。
*   **受众**：File Station 搜索框, Synology Drive, Mac Finder (Spotlight), Windows 资源管理器。
*   **作用**：让你能搜到文件，甚至搜到文档里的内容。

## 2. 媒体索引常见问题与修复

### A. 拷入文件后看不到？
如果你通过 SMB/File Station 拷入文件，系统会自动触发索引。但如果你是通过 **SSH、Docker (如 qBittorrent/Transmission)、WebDAV** 写入文件，系统可能**检测不到变化**。

**解决方案**：
1.  **手动重建**：控制面板 > 索引服务 > 媒体索引 > 重建索引。（耗时极长，不推荐）
2.  **命令行触发 (推荐)**：
    通过 SSH 登录，运行命令更新指定文件夹：
    ```bash
    synoindex -R /volume1/video/movie
    ```
    *   **注意**：DSM 7.x 中 `synoindex` 命令有时不灵，推荐使用 `synofoto-bin-index-tool` (针对 Photos) 或重启 Video Station 套件。
3.  **自动化脚本**：
    如果你用 Docker 下载，可以在下载完成脚本中加入 `curl` 命令调用群晖 API，或者简单的 `touch` 一下父文件夹，有时能触发监控。
4.  **inotify 限制**：Linux 内核默认的 `inotify` 监控数量有限（通常 8192）。如果你的文件夹层级太深或文件太多，系统监控不过来。
    *   **解决**：SSH 修改 `/etc/sysctl.conf`，增加 `fs.inotify.max_user_watches` 的值。
    ```bash
    echo "fs.inotify.max_user_watches = 1048576" >> /etc/sysctl.conf
    sysctl -p
    ```

### B. 生成缩略图慢/CPU 高？
上传几千张照片后，CPU 飙升，这是在生成缩略图。
*   **DSM 7.x 优化**：现在 Photos 移动端 App 会利用手机算力生成缩略图再上传，大大减轻 NAS 负担。**强烈建议通过 Photos App 上传备份**。
*   **暂停转换**：点击任务栏右上角的“转换中”图标 > 延迟/暂停。

## 3. 文件索引深度技巧

### A. 搜索文档内容 (全文检索)
想搜“合同”两个字，找出所有包含该词的 Word/PDF？
1.  打开 **Universal Search** 套件。
2.  **偏好设置** > **文件索引** > **索引文件夹列表**。
3.  选中你的文档文件夹 > **编辑**。
4.  勾选 **索引文件内容**。
5.  **注意**：这非常消耗 CPU 和 空间，只对关键文档库开启，不要对整个硬盘开启。

### B. Mac Spotlight 整合
想在 Mac 的右上角聚焦搜索里直接搜 NAS 里的文件？
1.  **控制面板** > **文件服务** > **SMB** > **高级设置** > **macOS**。
2.  勾选 **启用 VFS 模块以增强 Mac 兼容性**。
3.  在 Universal Search 中确保该文件夹已被索引。
4.  在 Mac 上挂载 NAS 文件夹，稍微等待索引同步。
    *   **技巧**：如果搜索不到，尝试在 Mac 终端运行 `mdutil -i on /Volumes/YourNasShare` 强制开启索引。

### C. 排除干扰项 (Exclude List)
`node_modules`、`.git`、`@eaDir` 这些文件夹里有成千上万个小文件，如果被索引，Universal Search 数据库会爆炸，搜索也会变慢。
*   **操作**：Universal Search > 偏好设置 > 文件索引 > 索引文件夹列表 > 编辑 > **排除的列表**。
*   **添加**：`node_modules`, `.git`, `target`, `build`, `.svn` 等。

## 4. 隐藏功能：计算器与单位换算

Universal Search 的搜索框不仅能搜文件，还是个计算器。
*   输入 `100 * 5`，回车直接显示 `500`。
*   输入 `100 USD to CNY`，直接显示汇率换算结果（需联网）。

## 5. 性能优化总结

1.  **不要全盘索引**：只索引你需要频繁搜索的文件夹。
2.  **善用排除**：排除代码库、备份库、日志库。
3.  **媒体库分离**：如果你的电影库有 100TB，建议不要全部纳入 Video Station 索引，用 Kodi/Infuse 挂载 SMB 直接看可能更流畅，让 NAS 专注于存储。
