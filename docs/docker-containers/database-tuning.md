# 数据库容器深度调优 (PostgreSQL / MariaDB)

很多 Docker 应用（如 Immich, Nextcloud, Gitea）都依赖数据库。默认的数据库配置通常是为“兼容性”设计的，而不是“性能”。在 NAS 这种资源受限的环境下，适当的调优能让应用响应速度提升 50% 以上。

## 1. PostgreSQL 调优 (针对 Immich/Nextcloud)

PostgreSQL 是目前最强大的开源数据库，但默认配置非常保守（假设你只有 128MB 内存）。

### A. 核心参数 (postgresql.conf)
你不需要去修改配置文件，直接在 `docker-compose.yml` 的 `command` 中覆盖参数即可。

*   **shared_buffers**: 内存缓冲区。
    *   **默认**: 128MB (太小了！)
    *   **建议**: 物理内存的 25% (例如 4GB 内存设为 `1GB`)。
*   **work_mem**: 排序/哈希操作内存。
    *   **默认**: 4MB
    *   **建议**: `16MB` - `32MB` (如果并发不高)。
*   **max_connections**: 最大连接数。
    *   **默认**: 100
    *   **建议**: 对于家用 NAS，`50` - `100` 足够了。过大会浪费内存。
*   **maintenance_work_mem**: 维护任务内存 (如创建索引)。
    *   **建议**: `256MB`。

**Docker Compose 示例**：
```yaml
services:
  database:
    image: postgres:15-alpine
    command: >
      postgres 
      -c shared_buffers=1GB 
      -c work_mem=16MB 
      -c maintenance_work_mem=256MB 
      -c effective_cache_size=3GB
    environment:
      POSTGRES_USER: immich
      POSTGRES_PASSWORD: password
      POSTGRES_DB: immich
    volumes:
      - /volume1/docker/immich/pgdata:/var/lib/postgresql/data
```

### B. 自动维护 (Vacuum)
PostgreSQL 需要定期清理“死元组” (Dead Tuples)。
*   **检查**: 确保 `autovacuum` 是开启的 (默认开启)。
*   **优化**: 如果你的 Immich 经常大量导入照片，可以激进一点：
    *   `autovacuum_vacuum_scale_factor = 0.1` (默认 0.2，改为 0.1 表示表数据变动 10% 就触发清理)。

## 2. MariaDB / MySQL 调优 (针对 WordPress/Gitea)

### A. InnoDB 缓冲池 (innodb_buffer_pool_size)
这是 MySQL 最重要的参数，直接决定性能。
*   **默认**: 128MB
*   **建议**: 物理内存的 50% - 70% (如果这台机器只跑数据库)。对于 NAS，建议给 `512MB` - `1GB`。

### B. 配置文件映射
MySQL 的参数太多，建议挂载配置文件。
1.  创建 `my.cnf` 文件：
    ```ini
    [mysqld]
    innodb_buffer_pool_size = 1G
    max_connections = 100
    slow_query_log = 1
    long_query_time = 2
    ```
2.  **Docker Compose 挂载**：
    ```yaml
    volumes:
      - ./my.cnf:/etc/mysql/conf.d/my.cnf:ro
    ```

## 3. 数据库备份策略 (Backup Strategy)

### A. 不要直接备份数据目录！
千万不要直接用 Hyper Backup 备份 `/var/lib/postgresql/data` 或 `/var/lib/mysql` 目录。
*   **原因**: 数据库运行时文件是锁定的，直接复制会导致数据损坏 (Data Corruption)。
*   **后果**: 恢复后数据库无法启动。

### B. 正确做法：Dump 导出
使用 `pg_dump` 或 `mysqldump` 导出 SQL 文件，然后备份这个 SQL 文件。

**自动化脚本 (PostgreSQL)**:
```bash
#!/bin/bash
# 每天凌晨 3 点运行
docker exec -t immich_postgres pg_dump -U immich immich > /volume1/backup/immich_$(date +%F).sql
# 保留最近 7 天的备份
find /volume1/backup -name "immich_*.sql" -mtime +7 -delete
```

## 4. 存储介质 (Storage)

*   **SSD 必选**: 数据库对 IOPS (随机读写) 要求极高。
    *   **现象**: 如果放在机械硬盘上，打开 Nextcloud 相册需要 10 秒。放在 SSD 上只需要 1 秒。
    *   **操作**: 将数据库的 `volumes` 映射到 NVMe 存储空间。
*   **NoCOW (Btrfs)**:
    *   如果你使用 Btrfs 文件系统，**务必对数据库文件夹禁用“数据校验和” (Data Checksum)**。
    *   **原因**: Copy-on-Write (CoW) 机制会导致数据库文件产生大量碎片，性能下降严重。
    *   **操作**:
        1.  新建一个共享文件夹 (如 `docker-db`)。
        2.  **取消勾选**“启用数据校验和”。
        3.  将所有数据库容器的数据目录都放在这里。
