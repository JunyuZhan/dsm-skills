# 生产力工具技巧

NAS 不只是存储，更是你的私有云办公中心。

## 1. Synology Drive 版本回溯
救命功能，防止误删或文件损坏。
- **路径**：Synology Drive Admin Console > 团队文件夹 > 版本控制。
- **技巧**：
    - 启用版本控制，建议保留 8-32 个版本。
    - **Intelliversioning**：勾选它，系统会智能保留重要的历史版本（而不是简单的最近 32 次修改）。

## 2. 忽略文件列表
防止 `node_modules` 或 `.DS_Store` 这种垃圾文件被同步。
- **路径**：Drive 客户端 > 同步任务 > 全局设置 > 文件过滤器。
- **技巧**：添加 `*.tmp`, `~*`, `desktop.ini`, `.DS_Store` 等规则。对于开发者，务必排除 `node_modules` 和 `.git` 目录，否则几十万个小文件会把同步卡死。

## 3. 团队文件夹权限继承
解决“我看不到你传的文件”的问题。
- **技巧**：在 File Station 中右键文件夹 > 属性 > 权限。
- **操作**：确保勾选“应用到此文件夹、子文件夹及文件”。Drive 中的权限是基于 DSM 文件夹权限的，如果权限混乱，建议在根目录重置并强制继承。

## 4. Synology Office 多人协作
- **功能**：类似 Google Docs 的在线文档/表格/幻灯片。
- **技巧**：
    - 支持多人实时编辑。
    - 历史版本可以精确到每一个字符的修改。
    - 支持导入/导出 Excel (.xlsx) 和 Word (.docx) 格式。

## 5. Note Station 网页剪藏
印象笔记的免费替代品。
- **工具**：安装 Chrome/Edge 浏览器扩展 **Synology Web Clipper**。
- **技巧**：浏览网页时，一键保存正文到 Note Station，自动去除广告，永久保存。即使原网页挂了，你的笔记还在。

## 6. Calendar 与手机日历同步
- **协议**：CalDAV。
- **技巧**：
    - iOS：设置 > 邮件 > 账户 > 添加账户 > 其他 > 添加 CalDAV 账户。输入 NAS IP 和账号。
    - Android：需要安装 DAVx5 等第三方 App 来同步。
    - 效果：在手机日历上添加日程，电脑网页端 Calendar 立刻同步，反之亦然。

## 7. Contacts 通讯录同步
- **协议**：CardDAV。
- **技巧**：同样通过 iOS 或 DAVx5 挂载。你可以把所有联系人备份在自己的 NAS 上，不再依赖 iCloud 或 Google，隐私更安全。

## 8. MailPlus 域名邮箱
拥有 `admin@yourname.com` 的专属邮箱。
- **要求**：
    - 公网 IP（最好是固定 IP，动态 IP 容易被反垃圾邮件组织拉黑）。
    - 域名。
    - 能够设置 MX 记录和 SPF/DKIM/DMARC 记录。
- **技巧**：如果家庭宽带做 Mail Server 很困难（端口 25 通常被封），可以只用 MailPlus Client 收取 Gmail/Outlook 的邮件，作为一个统一的邮件归档中心。

## 9. Chat 私有聊天服务
- **场景**：公司内部沟通，或者家庭群组。
- **技巧**：
    - 支持加密频道。
    - 支持 Webhook 机器人（可以用来接收 NAS 报警或脚本通知）。
    - 手机 App 推送速度极快。

## 10. Universal Search 全局搜索
- **快捷键**：DSM 桌面按 `Ctrl + F` (Windows) / `Cmd + F` (Mac)。
- **技巧**：
    - 不仅仅搜文件名，还能搜文件内容（需要开启索引）。
    - 还能搜 Note Station 的笔记内容。
    - 还能搜 Office 文档的内容。
    - 甚至能搜图片的 OCR 文字（如果开启了相关功能）。
