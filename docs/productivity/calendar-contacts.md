# Synology Calendar & Contacts：彻底告别 Google/iCloud

在隐私泄露日益严重的今天，将你的日程（Calendar）和通讯录（Contacts）私有化是保护个人数据的关键一步。群晖提供了完整的 CardDAV 和 CalDAV 服务，让你在享受云同步便利的同时，数据完全掌握在自己手中。

## 1. 为什么选择自建？

*   **隐私**：你的会议安排、客户电话不再上传给 Google 或 Apple 分析。
*   **跨平台**：完美打通 iOS, Android, Windows, macOS, Linux。
*   **数据主权**：误删联系人？群晖有 Hyper Backup 每天备份，随时回滚。

## 2. 部署服务端

### Synology Calendar
1.  在套件中心安装 **Synology Calendar**。
2.  打开 Calendar，点击右侧 **CalDAV 账户**。
3.  勾选 "启用 CalDAV"。
4.  记录下 **macOS / iOS 地址** 和 **Thunderbird 地址**。

### Synology Contacts
1.  在套件中心安装 **Synology Contacts**。
2.  打开 Contacts，点击右上角头像 > **CardDAV**。
3.  记录下 CardDAV 服务器地址。通常是 `https://your-nas-ip:5001/carddav/user`。

## 3. 客户端配置指南

### A. iOS (iPhone/iPad)

iOS 原生支持 CalDAV/CardDAV，体验最完美。

1.  **设置** > **邮件** (或日历/通讯录) > **账户** > **添加账户**。
2.  选择 **其他** (Other)。
3.  **添加 CalDAV 账户** (日历)：
    *   **服务器**：输入 NAS 的域名（如 `cal.yourdomain.com`）。
    *   **用户名/密码**：NAS 账号。
    *   **描述**：My NAS Calendar。
    *   点击下一步，验证通过后，打开“日历”和“提醒事项”开关。
4.  **添加 CardDAV 账户** (通讯录)：
    *   步骤同上，选择 **添加 CardDAV 账户**。
    *   验证通过后，打开“通讯录”开关。

### B. macOS

1.  **系统设置** > **互联网账户** > **添加账户** > **其他**。
2.  选择 **CalDAV** 或 **CardDAV**。
3.  账户类型选择 **手动**。
4.  输入用户名、密码、服务器地址。
5.  现在，Mac 自带的“日历”和“通讯录”应用就会自动同步 NAS 上的数据了。

### C. Android

Android 原生**不支持** CalDAV/CardDAV，必须安装第三方 App。推荐 **DAVx5** (开源、免费、功能强大)。

1.  在 F-Droid 或 Google Play 下载 **DAVx5**。
2.  点击右下角 **+** 号。
3.  选择 **使用 URL 和用户名登录**。
4.  **Base URL**: 输入 NAS 的 CalDAV/CardDAV 地址。
    *   *技巧：如果你配置了反向代理（如 `https://dav.yourdomain.com`），DAVx5 通常能自动发现日历和通讯录，无需分别添加。*
5.  输入账号密码，点击登录。
6.  创建账户后，勾选你想要同步的日历和通讯录。
7.  点击右上角同步按钮。
8.  现在，打开手机自带的日历和通讯录 App，你就能看到 NAS 上的数据了。

### D. Windows (Outlook / Thunderbird)

*   **Outlook**: 原生不支持 CalDAV。需要安装插件 **CalDav Synchronizer**。
    *   安装后在 Outlook 顶部会出现 "CalDav Synchronizer" 选项卡。
    *   点击 "Synchronization Profiles" > Add > Generic CalDAV/CardDAV。
    *   填入 NAS 地址。
*   **Thunderbird**: 原生支持。
    *   日历页面 > 新建日历 > 网络上的日历 > 输入 NAS 地址。

## 4. 进阶技巧

### A. 全家共享日历
*   **场景**：创建一个“家庭日历”，用于记录家人生日、聚餐、缴费提醒。
*   **操作**：
    1.  在 Synology Calendar 网页版，创建一个新日历 "Family"。
    2.  点击日历右侧下拉菜单 > **共享**。
    3.  添加家人的 DSM 账号，权限设为“可编辑”。
    4.  家人在自己的手机上也能看到并编辑这个日历。

### B. 结合 MailPlus
如果你同时使用了 MailPlus Server，Contacts 里的联系人会自动出现在网页版 MailPlus 的写信自动补全中。

### C. 备份与还原
*   **Hyper Backup**：在备份任务中，勾选 "Calendar" 和 "Contacts" 应用。
*   **手动导出**：
    *   Calendar: 导出为 `.ics` 文件。
    *   Contacts: 导出为 `.vcf` 文件。
    *   这也是从 Google/iCloud 迁移数据到 NAS 的标准格式。
