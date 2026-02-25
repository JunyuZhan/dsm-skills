# Vaultwarden 安全加固与备份指南

自建密码库最大的风险不是“被黑客端走数据库”（因为数据库是加密的），而是“被撞库”或“数据丢失”。本指南将教你如何构建一个铜墙铁壁的 Vaultwarden。

## 1. 防止暴力破解 (Fail2Ban)

Vaultwarden 默认没有账户锁定机制。如果攻击者知道你的邮箱，可以无限次尝试密码。**Fail2Ban** 是必装的防御工具。

### A. 原理
Fail2Ban 监控 Vaultwarden 的日志，一旦发现某个 IP 连续登录失败（比如 5 次），自动修改防火墙规则（iptables）封禁该 IP。

### B. 部署步骤
由于群晖 DSM 的 `iptables` 比较特殊，建议直接使用 Docker 方式部署 Fail2Ban，或者更简单的方案：**使用 Nginx Proxy Manager (NPM) 的访问限制**。

#### 方案一：NPM 简单防御 (推荐)
如果你使用 NPM 做反向代理：
1.  **Access Lists**: 在 NPM 中创建一个 Access List。
2.  **Authorization**: 设置一个只有你知道的用户名密码（Basic Auth）。
3.  **应用**: 将此 Access List 应用到 Vaultwarden 的 `/admin` 路径。
    *   **注意**: 不要对主路径 `/` 开启 Basic Auth，否则手机 App 无法登录。
    *   **限制**: 这只能保护管理后台，不能保护客户端登录接口。

#### 方案二：Fail2Ban (进阶)
需要在宿主机或特权容器中运行。
1.  **挂载日志**: 确保 Vaultwarden 的日志映射到了宿主机（如 `/volume1/docker/vaultwarden/data/vaultwarden.log`）。
    *   需设置环境变量 `LOG_FILE=/data/vaultwarden.log`。
2.  **配置 jail.local**:
    ```ini
    [vaultwarden]
    enabled = true
    port = 80,443,8080
    filter = vaultwarden
    logpath = /vaultwarden/vaultwarden.log
    maxretry = 3
    bantime = 14400 ; 4小时
    findtime = 14400 ; 4小时
    ```
3.  **配置 filter.d/vaultwarden.conf**:
    ```ini
    [Definition]
    failregex = ^.*Invalid credentials\.$
                ^.*Error: Incorrect password\.$
    ```

## 2. 必须开启的两步验证 (2FA)

即使密码泄露，黑客没有你的手机也登不进去。

### A. TOTP (Authenticator App)
*   **操作**: 登录网页版 > **设置** > **两步登录** > **管理验证器应用程序**。
*   **工具**: 使用 Microsoft Authenticator, Google Authenticator 或 Authy 扫描二维码。
*   **强制**: 建议给所有家庭成员账号都强制开启。

### B. YubiKey / WebAuthn (硬件密钥)
*   如果你有 YubiKey，可以在设置中开启 **WebAuthn**。
*   **优势**: 防钓鱼。即使你在钓鱼网站输入了密码，因为域名不对，YubiKey 不会响应。
*   **支持**: 手机端 (NFC) 和电脑端 (USB) 都完美支持。

### C. Duo (企业级推送)
*   Vaultwarden 支持 Duo Security。
*   **体验**: 登录时手机弹窗“批准/拒绝”，比输入 6 位数字验证码更方便。Duo 对个人用户免费（10 个账号以内）。

## 3. 禁用注册与邀请

部署完成后，第一件事就是**关门**。

*   **环境变量**:
    ```yaml
    environment:
      - SIGNUPS_ALLOWED=false
      - INVITATIONS_ALLOWED=false
    ```
*   **效果**: 只有管理员（你）可以在后台手动邀请/创建用户，陌生人无法自行注册。

## 4. 数据库自动备份 (Auto Backup)

SQLite 数据库文件 (`db.sqlite3`) 是单个文件，但直接复制可能导致损坏（如果正好有写入）。

### A. 使用 sqlite3 命令热备份
创建一个简单的 Shell 脚本，放在任务计划中每天运行。

```bash
#!/bin/bash
# 变量设置
DATA_DIR="/volume1/docker/vaultwarden/data"
BACKUP_DIR="/volume1/backup/vaultwarden"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 1. 备份数据库 (使用 sqlite3 .backup 命令，保证原子性)
# 需确保宿主机或容器内有 sqlite3 工具。如果没有，可用 docker exec 调用容器内的。
docker exec vaultwarden sqlite3 /data/db.sqlite3 ".backup '/data/db_backup.sqlite3'"

# 2. 移动备份文件到安全目录
mv $DATA_DIR/db_backup.sqlite3 $BACKUP_DIR/db_$TIMESTAMP.sqlite3

# 3. 备份附件和密钥 (直接压缩)
tar -czf $BACKUP_DIR/attachments_$TIMESTAMP.tar.gz -C $DATA_DIR attachments rsa_key.pem rsa_key.pub.pem config.json

# 4. 删除 30 天前的旧备份
find $BACKUP_DIR -name "*.sqlite3" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

# 5. (可选) 同步到云端 (如 OneDrive)
# rclone copy $BACKUP_DIR remote:backup/vaultwarden
```

### B. 恢复流程
1.  停止容器: `docker stop vaultwarden`
2.  覆盖文件: 将备份的 `.sqlite3` 和附件解压回数据目录。
3.  启动容器: `docker start vaultwarden`

## 5. 管理后台安全 (Admin Token)

管理后台 (`/admin`) 拥有最高权限，可以删除任何用户。

*   **Argon2 算法**: 默认的 Admin Token 是明文存储在环境变量里的。建议使用 `argon2` 哈希加密。
    1.  在本地运行 `argon2` 命令生成哈希（或使用在线工具，注意安全）。
    2.  将哈希值填入 `ADMIN_TOKEN`。
*   **禁止外网访问**: 在反向代理 (Nginx/NPM) 中，屏蔽 `/admin` 路径的公网访问，只允许内网 IP 访问。
    ```nginx
    location /admin {
        allow 192.168.1.0/24;
        deny all;
        proxy_pass http://vaultwarden:80;
    }
    ```

## 6. 紧急访问 (Emergency Access)

这不属于技术加固，但属于“人生安全加固”。
*   **设置**: 在网页版 > **设置** > **紧急访问**。
*   **指定**: 指定你的配偶或信赖的亲属。
*   **机制**: 他们发起请求后，如果你 N 天（如 7 天）未拒绝，他们将自动获得访问权限。防止你发生意外后，家人无法获取银行密码。
