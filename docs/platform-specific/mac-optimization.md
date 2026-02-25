# Mac 极致优化指南

Synology 和 Apple 是天生一对，但默认配置下 Mac 可能会遇到卡顿或断连。这里是优化秘籍。

## 1. Time Machine 提速与排错

**痛点**：Time Machine 备份显示“正在准备备份...”长达几小时，或者速度极慢。

### 优化技巧
1.  **禁用 SMB 签名** (仅限内网安全环境)：
    *   Mac 终端：`sudo vfs_objects_no_signing=yes` (部分系统有效)。
    *   更推荐在 NAS 端：**SMB 设置** > **高级** > **传输加密模式** > **禁用**。加密会消耗 CPU，内网备份没必要开。
2.  **配额限制**：务必为 Time Machine 共享文件夹设置**配额**（如 2TB）。否则它会吃光你所有硬盘空间，导致 NAS 满盘报警。
3.  **SMB 协议**：确保最小 SMB 协议为 SMB2，并启用 **Bonjour Time Machine 广播**。

## 2. Spotlight 搜索优化 (Universal Search)

**痛点**：在 Mac Finder 中搜索 NAS 文件极慢，甚至搜不到。

### 解决方案
Synology 支持将服务器索引通过 SMB 传递给 Mac Spotlight。
1.  **NAS 端**：控制面板 > Universal Search > 首选项 > 文件索引 > 索引文件夹列表。确保你的共享文件夹已在列表中。
2.  **Mac 端**：在 Finder 连接 NAS 后，输入关键词搜索。
3.  **关键**：点击搜索框下方的 **"共享的" (Shared)**，而不是 "这台 Mac"。此时搜索请求会由 NAS 的 CPU 处理，秒出结果。

## 3. 解决 .DS_Store 污染

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

## 4. 解决文件名乱码 (NFC vs NFD)

Mac 使用 NFD (分解形式) 编码文件名，而 Windows/Linux 使用 NFC (组合形式)。这导致带重音符号的文件名（如 `café`）在跨平台互传时可能乱码。

*   **NAS 设置**：控制面板 > 文件服务 > SMB > 高级 > **VFS 模块**。
*   **启用**：`catia` 模块（如果有）或确保“转换为 Windows 兼容名称”已勾选。
*   **最佳实践**：尽量避免在文件名中使用特殊字符和 Emoji。

## 5. 提升 Finder 浏览速度

打开包含数千张照片的文件夹时，Finder 会卡死，因为它在尝试生成预览图。

*   **技巧**：
    1.  Finder > 查看 > 查看显示选项 (`Cmd + J`)。
    2.  **取消勾选** “显示图标预览” (Show icon preview)。
    3.  点击“用作默认”。
*   这样 Finder 只读取文件名，速度瞬间起飞。

## 6. 挂载优化 (Automount)

每次重启 Mac 都要手动连 NAS？

*   **方法**：系统设置 > 用户与群组 > 登录项。
*   **操作**：将挂载好的 NAS 磁盘拖入“登录时打开”列表。
*   **进阶**：使用 **AutoMounter** (App Store 软件)，它能在你回到家连上 Wi-Fi 时自动挂载，出门断网时自动卸载，防止 Finder 转彩虹圈卡死。
