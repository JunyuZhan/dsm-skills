# Docker Compose 最佳实践与调优指南

很多用户复制粘贴网上的 `docker-compose.yml` 就能跑，但往往忽略了长期运行的稳定性、安全性和可维护性。本指南总结了 NAS 环境下的 Compose 最佳实践。

## 1. 限制日志大小 (Log Rotation)

**痛点**：Docker 默认会无限记录容器的标准输出日志 (stdout)。某些容器跑几个月后，日志文件能长到 100GB，直接把系统盘塞满，导致 DSM 无法登录。

**最佳实践**：在每个 `docker-compose.yml` 中添加日志限制配置。

```yaml
services:
  myapp:
    image: myapp:latest
    logging:
      driver: "json-file"
      options:
        max-size: "10m"   # 单个日志文件最大 10MB
        max-file: "3"     # 最多保留 3 个日志文件
```
*   **全局设置 (推荐)**：你也可以修改 `/etc/docker/daemon.json` 进行全局配置，一劳永逸。

## 2. 更加智能的重启策略 (Restart Policy)

*   `restart: always`: 无论因为什么原因停止（包括你手动 `docker stop`），Docker 守护进程重启后都会自动拉起它。
*   `restart: unless-stopped` (**推荐**): 只有在非手动停止的情况下才自动重启。如果你手动停止了容器（比如为了维护），重启 NAS 后它**不会**自动启动。这避免了维护期间的意外干扰。

## 3. 健康检查 (Healthcheck)

有些容器进程还在跑，但内部服务已经死锁了（Web 页面打不开）。Docker 默认认为它还是“活着”的。

**最佳实践**：添加健康检查，让 Docker 自动重启假死的容器。

```yaml
services:
  myapp:
    image: myapp:latest
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080"]
      interval: 1m      # 每 1 分钟检查一次
      timeout: 10s      # 超时 10 秒算失败
      retries: 3        # 连续失败 3 次才重启
      start_period: 30s # 启动后 30 秒内不检查 (给它点启动时间)
```

## 4. 网络模式选择 (Network Modes)

*   **Bridge (默认)**:
    *   **优点**: 端口隔离，安全性高。
    *   **缺点**: 性能有轻微损耗 (NAT)。
    *   **适用**: 绝大多数应用 (Web 服务, 数据库)。
*   **Host**:
    *   **优点**: 性能最好 (原生网络)，无需端口映射。
    *   **缺点**: 端口冲突风险高，无法隔离。
    *   **适用**: **Home Assistant** (需要组播发现设备), **AdGuard Home** (需要接管 DHCP), **Plex** (DLNA 需要)。
*   **Macvlan**:
    *   **优点**: 容器拥有独立的局域网 IP (如 `192.168.1.20`)。
    *   **缺点**: 配置复杂，宿主机无法直接访问容器 (需配置桥接)。
    *   **适用**: **OpenWrt 旁路由**, 需要独立 IP 的特殊应用。

## 5. 权限管理 (PUID / PGID)

LinuxServer.io 系列镜像的标配环境变量。
*   **原理**: 容器内的进程默认是 `root`，写入的文件在宿主机上也是 `root` 权限，导致你在 SMB 里删不掉、改不了。
*   **解决**: 指定容器以普通用户身份运行。
    *   **获取 ID**: SSH 登录 NAS，运行 `id user` (如 `id admin`)，查看 `uid` 和 `gid`。
    *   **配置**:
        ```yaml
        environment:
          - PUID=1026
          - PGID=100
        ```

## 6. 善用 .env 文件管理敏感信息

不要把密码直接写在 `docker-compose.yml` 里，特别是当你打算分享配置给朋友时。

1.  创建一个 `.env` 文件 (与 yaml 同级):
    ```ini
    DB_PASSWORD=secret_password_123
    API_KEY=abcdefg
    ```
2.  在 `docker-compose.yml` 中引用:
    ```yaml
    environment:
      - MYSQL_ROOT_PASSWORD=${DB_PASSWORD}
      - APP_KEY=${API_KEY}
    ```

## 7. 资源限制 (Resource Limits)

防止某个容器内存泄漏把整个 NAS 拖垮。

```yaml
services:
  myapp:
    deploy:
      resources:
        limits:
          cpus: '0.50'    # 最多使用 50% CPU
          memory: 512M    # 最多使用 512MB 内存
```
*   **注意**: `deploy` 键在 Docker Compose V2 中已支持，但在旧版本 DSM (Docker V1) 中可能被忽略。DSM 7.2+ 的 Container Manager 完美支持。
