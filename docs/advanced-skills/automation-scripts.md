# 自动化运维脚本合集

NAS 既然是服务器，就应该让它自动维护自己。这里收集了一系列实用的 Shell 脚本，配合 **任务计划 (Task Scheduler)** 使用，让你的 NAS 真正实现“无人值守”。

## 1. 磁盘空间监控与清理

当磁盘空间不足时发送通知，并自动清理回收站。

```bash
#!/bin/bash
# 设定阈值 (90%)
THRESHOLD=90
# Webhook URL (参考 Chat 集成指南)
WEBHOOK_URL="https://your-chat-webhook-url"

# 获取 /volume1 的使用率
USAGE=$(df /volume1 | grep /volume1 | awk '{ print $5 }' | sed 's/%//g')

if [ "$USAGE" -gt "$THRESHOLD" ]; then
    MESSAGE="⚠️ 警告：存储空间已使用 ${USAGE}%！正在执行自动清理..."
    
    # 发送通知
    curl -X POST --data-urlencode "payload={\"text\": \"$MESSAGE\"}" "$WEBHOOK_URL"
    
    # 1. 清空所有回收站
    /usr/syno/bin/syno_recycle_bin --empty-all
    
    # 2. 清理 Docker 无用镜像
    docker image prune -a -f
    
    # 3. 删除 30 天前的临时下载文件
    find /volume1/downloads/temp -type f -mtime +30 -delete
    
    # 再次检查并通知
    NEW_USAGE=$(df /volume1 | grep /volume1 | awk '{ print $5 }' | sed 's/%//g')
    curl -X POST --data-urlencode "payload={\"text\": \"✅ 清理完成。当前使用率：${NEW_USAGE}%\"}" "$WEBHOOK_URL"
fi
```

## 2. Docker 容器自动更新 (Watchtower 单次运行版)

虽然 Watchtower 可以常驻后台自动更新，但有时我们希望**可控更新**（例如每周日凌晨 3 点更新，并在更新后通知我）。

```bash
#!/bin/bash

# 拉取最新的 Watchtower 并运行一次
# --run-once: 运行一次后自动退出
# --cleanup: 更新后自动删除旧镜像
# --include-stopped: 连停止的容器也一起更新
# --notification-url: 更新结果推送到 Chat (Watchtower 原生支持 Slack/Discord/Gotify，Chat 需通过 shoutrrr 转换或自定义)

echo "开始检查 Docker 更新..."

docker run --rm \
    -v /var/run/docker.sock:/var/run/docker.sock \
    containrrr/watchtower \
    --run-once \
    --cleanup \
    --include-stopped

echo "Docker 更新检查完成。"
```

## 3. 数据库自动备份 (PostgreSQL)

如果你用 Docker 部署了 Bitwarden, Jellyfin, Gitea 等应用，数据库备份至关重要。

```bash
#!/bin/bash
# 备份目录
BACKUP_DIR="/volume1/backup/postgres"
# 容器名称
CONTAINER="postgres-db"
# 数据库用户
DB_USER="user"
# 日期标签
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 执行备份 (pg_dumpall 导出所有数据库)
docker exec -t $CONTAINER pg_dumpall -c -U $DB_USER > $BACKUP_DIR/pg_backup_$DATE.sql

# 压缩
gzip $BACKUP_DIR/pg_backup_$DATE.sql

# 删除 7 天前的备份
find $BACKUP_DIR -name "pg_backup_*.sql.gz" -mtime +7 -delete

echo "数据库备份完成：$BACKUP_DIR/pg_backup_$DATE.sql.gz"
```

## 4. 自动签发 SSL 证书 (acme.sh 守护)

虽然 acme.sh 容器有自己的计划任务，但有时可能会因为网络原因失败。我们可以写一个脚本强制检测，并自动部署到 DSM。

```bash
#!/bin/bash
# 每天运行一次

# 1. 强制更新证书 (acme.sh 容器)
docker exec acme.sh --cron

# 2. 将证书复制到 DSM 证书目录 (需要 root 权限)
# 注意：DSM 7.x 的证书路径比较复杂，建议使用 deploy 钩子
# 这里演示的是通过 deploy hook 部署到 DSM 的命令 (需要在 acme.sh 内部配置)
# docker exec acme.sh --deploy -d yourdomain.com --deploy-hook synology_dsm

# 3. 重启 Web 服务器 (如果证书更新了)
# /usr/syno/sbin/synoservicectl --reload nginx
```

## 5. 硬盘健康周报 (SMART Report)

DSM 自带的通知很零散。这个脚本每周汇总所有硬盘的 SMART 信息发给你。

```bash
#!/bin/bash
DRIVES=$(ls /dev/sata*) # 获取所有 SATA 硬盘
REPORT="硬盘健康周报 \n"

for drive in $DRIVES; do
    MODEL=$(smartctl -i $drive | grep "Device Model" | awk -F: '{print $2}')
    TEMP=$(smartctl -A $drive | grep "Temperature_Celsius" | awk '{print $10}')
    HOURS=$(smartctl -A $drive | grep "Power_On_Hours" | awk '{print $10}')
    REALLOC=$(smartctl -A $drive | grep "Reallocated_Sector_Ct" | awk '{print $10}')
    
    REPORT+="$drive ($MODEL): 温度 ${TEMP}C, 通电 ${HOURS}小时, 坏道 ${REALLOC} \n"
done

# 发送邮件 (需配置 sendmail 或使用 webhook)
echo -e "$REPORT" | /usr/bin/ssmtp your@email.com
```

## 6. 自动修正权限 (Permissions Fixer)

Docker 下载的文件有时会出现权限锁死（root 拥有），导致 SMB 无法删除。

```bash
#!/bin/bash
# 目标目录
TARGET_DIR="/volume1/downloads"

# 将所有文件所有者改为 admin (UID 1024), 组 users (GID 100)
# 根据你的实际用户 ID 修改
chown -R 1024:100 "$TARGET_DIR"

# 赋予读写权限 (777 虽然不安全，但对家庭下载目录最省心)
chmod -R 777 "$TARGET_DIR"

echo "权限修正完成。"
```
docker exec acme.sh acme.sh --cron --home /acme.sh

# 检查证书是否更新
# 如果更新了，重启 Web 服务 (例如 Nginx Proxy Manager)
# 这里假设证书文件路径
if find /volume1/docker/npm/certs -name "fullchain.pem" -mtime -1 | grep -q .; then
    echo "证书已更新，重启 Nginx..."
    docker restart npm
fi
```

## 5. 公网 IP 变动通知 (DDNS 辅助)

虽然 DSM 自带 DDNS，但有时我们需要第一时间知道 IP 变了（比如为了更新防火墙白名单）。

```bash
#!/bin/bash
IP_FILE="/tmp/current_ip"
WEBHOOK_URL="https://your-chat-webhook-url"

# 获取当前公网 IP
CURRENT_IP=$(curl -s ifconfig.me)

# 读取旧 IP
if [ -f "$IP_FILE" ]; then
    OLD_IP=$(cat "$IP_FILE")
else
    OLD_IP=""
fi

# 对比
if [ "$CURRENT_IP" != "$OLD_IP" ]; then
    echo "IP Changed: $OLD_IP -> $CURRENT_IP"
    echo "$CURRENT_IP" > "$IP_FILE"
    
    # 发送通知
    curl -X POST --data-urlencode "payload={\"text\": \"🌐 公网 IP 已变更：$CURRENT_IP\"}" "$WEBHOOK_URL"
    
    # 可以在这里触发其他操作，如调用 Cloudflare API 更新 DNS
fi
```
