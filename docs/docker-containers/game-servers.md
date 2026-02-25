# 游戏服务器搭建指南 (Palworld/Minecraft)

NAS 24 小时开机，是托管游戏服务器的绝佳平台。和小伙伴们在自己的世界里畅玩，无需购买昂贵的云服务器。

## 1. 幻兽帕鲁 (Palworld)

### 硬件要求
*   **内存**：极高！至少 16GB RAM（官方推荐 32GB）。如果只有 8GB，很容易爆内存崩服。
*   **CPU**：J4125 勉强能带 2-4 人，推荐 N5105 或 Ryzen 机型。

### Docker Compose 部署
使用社区优化版镜像 `thijsvanloef/palworld-server-docker`。

```yaml
services:
  palworld:
    image: thijsvanloef/palworld-server-docker:latest
    container_name: palworld
    restart: unless-stopped
    ports:
      - 8211:8211/udp # 游戏端口
      - 27015:27015/udp # 查询端口
    environment:
      - PUID=1026
      - PGID=100
      - PORT=8211
      - PLAYERS=16
      - MULTITHREADING=true
      - COMMUNITY=false # 是否显示在社区列表
      - PUBLIC_IP= # 你的公网IP (可选)
      - PUBLIC_PORT=8211
      - SERVER_NAME=MyNasPalworld
      - SERVER_DESCRIPTION=Hosted on Synology
      - ADMIN_PASSWORD=admin123
      - SERVER_PASSWORD=game123
    volumes:
      - /volume1/docker/palworld:/palworld/
```

### 内存优化技巧
*   **定时重启**：帕鲁服务端有内存泄漏 bug。建议设置每日凌晨 4 点自动重启容器。
*   **ZRAM**：如果物理内存不足，可以尝试开启 ZRAM 压缩内存（需 SSH 脚本），但这会增加 CPU 负担。

## 2. Minecraft (Java/Bedrock)

### 镜像选择
推荐使用 `itzg/minecraft-server`，它是最强大的 MC 镜像，支持 Java 版和基岩版。

### Java 版部署 (PC)
```yaml
services:
  mc:
    image: itzg/minecraft-server
    container_name: mc-java
    ports:
      - 25565:25565
    environment:
      - EULA=TRUE
      - VERSION=LATEST # 或指定版本如 1.20.4
      - TYPE=PAPER # 推荐 Paper 服，性能比官方原版好太多
      - MEMORY=4G # 分配内存
    volumes:
      - /volume1/docker/minecraft/java:/data
```

### Bedrock 版部署 (手机/主机)
```yaml
services:
  mc-bedrock:
    image: itzg/minecraft-bedrock-server
    container_name: mc-bedrock
    ports:
      - 19132:19132/udp
    environment:
      - EULA=TRUE
      - GAMEMODE=survival
      - DIFFICULTY=normal
    volumes:
      - /volume1/docker/minecraft/bedrock:/data
```

## 3. 异地联机

*   **公网 IP**：在路由器做端口转发 (TCP 25565 或 UDP 8211)。
*   **无公网 IP**：
    *   **Tailscale**：小伙伴也装 Tailscale，通过内网 IP 联机（最稳）。
    *   **Playit.gg**：一个专门为游戏设计的内网穿透工具，Docker 部署 `playit/playit`，免费且无需配置路由器。

## 4. 存档备份

*   **Hyper Backup**：务必将游戏数据目录 (`/volume1/docker/palworld` 等) 加入 Hyper Backup 任务。
*   **快照**：开启 Btrfs 快照，每小时一次。被熊孩子炸图了？一键回滚。
