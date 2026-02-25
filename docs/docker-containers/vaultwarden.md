# 自建密码库 Vaultwarden 指南

Bitwarden 是目前最优秀的开源密码管理器，而 Vaultwarden 是其轻量级 Rust 实现（原名 bitwarden_rs），非常适合在群晖 Docker 上运行。

## 为什么自建密码库？

*   **数据主权**：密码库文件就在你的 NAS 硬盘里，不经过任何第三方云端。
*   **免费高级功能**：Vaultwarden 解锁了官方付费版才有的 TOTP（两步验证码生成）、附件上传、组织共享等功能。
*   **全平台同步**：支持 iOS, Android, Windows, Mac, Linux, Chrome, Edge, Firefox 等所有主流平台。

## 1. 部署 Vaultwarden (Docker Compose)

这是最简单的部署方式，且数据持久化。

```yaml
version: '3'
services:
  vaultwarden:
    image: vaultwarden/server:latest
    container_name: vaultwarden
    restart: always
    environment:
      - WEBSOCKET_ENABLED=true  # 开启 WebSocket，支持实时同步
      - SIGNUPS_ALLOWED=true    # 首次注册开启，注册完记得改成 false
      - INVITATIONS_ALLOWED=false
      - ADMIN_TOKEN=some_random_token_as_admin_password # 管理后台密码
    volumes:
      - /volume1/docker/vaultwarden/data:/data
    ports:
      - 8080:80 # 网页端口
      - 3012:3012 # WebSocket 端口
```

## 2. 必须配置 HTTPS

**重要**：Bitwarden 客户端强制要求 HTTPS 连接，否则无法登录。
*   请参考 [反向代理与 HTTPS 配置指南](../network/reverse-proxy.md)。
*   将 `https://pass.yourdomain.com` 反向代理到 NAS 的 `8080` 端口。
*   **WebSocket**：别忘了在反向代理中添加 WebSocket 头（指向 `3012` 端口或直接复用 `80` 端口的 `/notifications/hub` 路径，Vaultwarden 较新版本已合并端口，通常代理 80 即可）。

## 3. 关闭新用户注册

部署并注册完自己的账号后，务必关闭注册功能，防止陌生人利用你的服务器存密码。
1.  修改环境变量 `SIGNUPS_ALLOWED=false`。
2.  重启容器。
3.  此时已有账号可正常登录，但新用户无法注册。

## 4. 启用管理后台 (Admin Page)

Vaultwarden 自带一个管理页面，用于查看注册用户、删除账号、强制同步等。
*   地址：`https://pass.yourdomain.com/admin`
*   密码：即环境变量 `ADMIN_TOKEN` 中设置的字符串。
*   **建议**：该密码必须足够复杂，或者在反向代理中限制 `/admin` 路径仅内网访问。

## 5. 配置 SMTP 邮件服务

为了在忘记主密码时能收到提示（虽然不能找回密码，但能找回密码提示），或者邀请家人使用。
*   在管理后台 > **SMTP Email Settings** 中配置。
*   建议使用 Gmail 或 QQ 邮箱的 SMTP 服务。

## 6. 数据备份策略 (3-2-1)

密码库是核心资产，必须备份！
*   **数据位置**：`/volume1/docker/vaultwarden/data`。
*   **核心文件**：
    *   `db.sqlite3`：数据库文件。
    *   `rsa_key*`：加密私钥。
    *   `attachments`：附件文件夹。
*   **方法**：使用 Hyper Backup 每天备份该文件夹到 USB 硬盘或云端。

## 7. 浏览器插件集成

*   在 Chrome/Edge 商店下载 **Bitwarden** 插件。
*   点击设置（左上角齿轮）。
*   **自托管环境**：在“服务器 URL”中输入你的域名 `https://pass.yourdomain.com`。
*   登录即可。

## 8. 移动端自动填充

*   iOS：设置 > 密码 > 密码选项 > 允许“Bitwarden”自动填充。
*   Android：设置 > 系统 > 语言和输入法 > 自动填充服务 > 选择 Bitwarden。
*   从此告别手动输入密码，支持 FaceID/指纹解锁。

## 9. 紧急访问权限 (Emergency Access)

**场景**：万一你发生意外，家人如何获取你的银行密码？
*   在网页版保险库中，设置“紧急访问”。
*   指定家人的账号（也需要在你的服务器上注册）。
*   设置等待时间（如 3 天）。
*   如果家人发起请求，你 3 天内没拒绝，他们将获得你密码库的只读权限。

## 10. 安全报告

*   登录网页版保险库 > **报告**。
*   **暴露的密码**：检查你的密码是否在已知的数据泄露库中。
*   **重复使用的密码**：找出哪些网站用了相同的密码，建议修改。
*   **弱密码**：找出太简单的密码。
