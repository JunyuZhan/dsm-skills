# 企业级身份认证 (Directory Server)

如果你的公司（或家庭实验室）有多台电脑，管理账户是一个噩梦。Synology Directory Server 可以让你的 NAS 变身为主域控制器 (Domain Controller)，实现账户的统一管理。

## 什么是 AD 域 (Active Directory)？

*   **统一账户**：员工用同一个账号密码登录公司任意一台电脑。
*   **统一管理**：管理员可以禁止员工修改桌面壁纸、强制安装软件、禁止使用 USB 接口（通过组策略 GPO）。
*   **漫游配置文件**：员工换一台电脑登录，桌面文件和浏览器收藏夹自动同步过来。

## 1. 安装与配置

**套件**：Synology Directory Server。

### 步骤
1.  **安装**：在套件中心安装。
2.  **设置向导**：
    *   **域名**：输入一个你拥有的域名（如 `corp.yourdomain.com`）。注意：不要使用 `.local`，建议使用真实的子域名。
    *   **密码**：设置域管理员 (Administrator) 的密码。
3.  **DNS 设置**：
    *   AD 域极其依赖 DNS。NAS 会自动安装 DNS Server。
    *   **关键**：局域网内所有电脑的 DNS 服务器地址，**必须**指向 NAS 的 IP。

## 2. 加入域 (Windows 客户端)

1.  **DNS**：确保电脑的 DNS 已指向 NAS IP。
2.  **设置**：右键“此电脑” > 属性 > 高级系统设置 > 计算机名 > 更改。
3.  **隶属于**：选择“域”，输入 `corp.yourdomain.com`。
4.  **验证**：输入域管理员账号密码。
5.  **重启**：重启后，使用 `CORP\username` 登录。

## 3. 组策略管理 (GPO)

群晖没有自带图形化的 GPO 管理工具，需要使用 Windows 的 RSAT 工具。

### 操作方法
1.  找一台已加入域的 Windows 10/11 专业版电脑。
2.  设置 > 应用 > 可选功能 > 添加功能 > 搜索 **RSAT** (远程服务器管理工具)。
3.  安装 **RSAT: Group Policy Management Tools**。
4.  在“Windows 管理工具”中打开 **Group Policy Management**。
5.  现在你可以像管理 Windows Server 一样管理群晖的域策略了！
    *   *案例：创建一个策略，强制所有域用户开启防火墙，或者映射 NAS 的共享文件夹为 Z: 盘。*

## 4. 漫游配置文件 (Roaming Profiles)

让数据跟随账号走。

1.  **NAS 端**：
    *   创建一个共享文件夹 `Profiles`。
    *   权限：Domain Users 组拥有读写权限。
2.  **AD 端 (RSAT)**：
    *   打开 **Active Directory Users and Computers**。
    *   选中用户 > 属性 > 配置文件。
    *   **配置文件路径**：`\\NAS_IP\Profiles\%username%`。
3.  **效果**：用户注销时，桌面文件自动上传到 NAS；在另一台电脑登录时，自动下载。

## 5. Mac 加入域

Mac 也可以加入 Synology 的 AD 域。
1.  系统设置 > 用户与群组 > 登录选项 > 网络账户服务器 > 加入。
2.  输入域名和管理员账号。
3.  **注意**：Mac 对 GPO 的支持非常有限，主要用于统一认证。

## 6. 常见坑点

*   **时间同步**：域控制器和客户端的时间误差不能超过 5 分钟，否则无法登录（Kerberos 协议限制）。**务必配置 NTP 服务器**。
*   **DNS**：再次强调，客户端 DNS 必须指对。如果需要上外网，在 NAS 的 DNS Server 中设置“转发器”指向 `8.8.8.8`。
