# Mac 极致优化指南

Synology 和 Apple 是天生一对，但默认配置下 Mac 可能会遇到卡顿或断连。这里是优化秘籍。

## 1. SMB 多通道 (Multichannel) —— 速度翻倍黑科技

如果你有双网口 NAS 和双网口 Mac (或 Wi-Fi 6 + 有线)，开启 SMB 多通道可以让速度叠加！
*   **原理**：同时使用多条网线传输数据。
*   **NAS 端**：控制面板 > 文件服务 > SMB > 高级设置 > 其他 > **启用 SMB 多通道**。
*   **Mac 端**：无需设置，自动生效。
*   **效果**：双千兆网口 = 200MB/s 读写速度。

## 2. Time Machine 提速与排错


**痛点**：Time Machine 备份显示“正在准备备份...”长达几小时，或者速度极慢。

### 优化技巧
1.  **禁用 SMB 签名** (仅限内网安全环境)：
    *   Mac 终端：`sudo vfs_objects_no_signing=yes` (部分系统有效)。
    *   更推荐在 NAS 端：**SMB 设置** > **高级** > **传输加密模式** > **禁用**。加密会消耗 CPU，内网备份没必要开。
2.  **配额限制**：务必为 Time Machine 共享文件夹设置**配额**（如 2TB）。否则它会吃光你所有硬盘空间，导致 NAS 满盘报警。
3.  **SMB 协议**：确保最小 SMB 协议为 SMB2，并启用 **Bonjour Time Machine 广播**。

## 3. Spotlight 搜索优化 (Universal Search)

**痛点**：在 Mac Finder 中搜索 NAS 文件极慢，甚至搜不到。

### 解决方案
Synology 支持将服务器索引通过 SMB 传递给 Mac Spotlight。
1.  **NAS 端**：控制面板 > Universal Search > 首选项 > 文件索引 > 索引文件夹列表。确保你的共享文件夹已在列表中。
2.  **Mac 端**：在 Finder 连接 NAS 后，输入关键词搜索。
3.  **关键**：点击搜索框下方的 **"共享的" (Shared)**，而不是 "这台 Mac"。此时搜索请求会由 NAS 的 CPU 处理，秒出结果。

## 4. 解决 .DS_Store 污染

Mac 会在每个访问过的文件夹生成 `.DS_Store` 隐藏文件（存储图标位置等信息）。这会让 Windows 用户看着很烦，也会干扰版本控制。

### 技巧
1.  **禁止生成**：在 Mac 终端执行：
    ```bash
    defaults write com.apple.desktopservices DSDontWriteNetworkStores true
    ```
    重启 Finder。这会禁止在网络共享盘上生成 .DS_Store。
2.  **定期清理**：在 NAS 的任务计划中添加脚本：
    ```bash
    find /volume1 -name ".DS_Store" -delete
    ```

## 5. 解决文件名乱码 (NFC vs NFD)

**痛点**：Mac 上复制到 NAS 的文件，在 Windows 上看中文文件名乱码（或变成 `o ̈` 这种分离的字符）。
*   **原因**：Mac 使用 NFD 编码，Windows/Linux 使用 NFC 编码。
*   **解决**：
    *   DSM 7.x 的 SMB 服务默认会自动处理 NFD -> NFC 转换 (vfs_fruit 模块)。
    *   **检查设置**：控制面板 > 文件服务 > SMB > 高级设置 > Mac > 启用 **VFS 模块转换 Mac 特殊字符**。

## 6. 提升 Finder 浏览速度

**痛点**：打开包含数千张照片的文件夹，Finder 菊花转半天。
*   **原因**：Finder 试图读取每个文件的图标预览。
*   **解决**：
    1.  Finder > 菜单栏 > 显示 > 查看显示选项 (Cmd+J)。
    2.  取消勾选 **“显示图标预览”**。
    3.  点击 **“用作默认”**。
    *   *副作用*：看不到缩略图，但列表加载速度秒开。
