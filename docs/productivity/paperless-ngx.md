# Paperless-ngx：终极无纸化办公系统

家里是不是堆满了水电煤账单、保险单、说明书、发票？想找的时候永远找不到？**Paperless-ngx** 就是你的救星。它是一个开源的文档管理系统，能自动对扫描件进行 OCR（文字识别）、分类、打标签，让你在 NAS 上拥有一个可全文搜索的私人档案库。

## 为什么选择 Paperless-ngx？

*   **OCR 强力支持**：基于 Tesseract，支持中文、英文等多种语言识别。上传图片或 PDF，内容里的字都能被搜到。
*   **自动整理**：通过匹配规则（例如：如果文档包含“中国电信”，自动标记为“账单”并归档到“2024”文件夹）。
*   **消费记录**：不仅是文档，还能自动提取发票金额，生成年度消费报表。
*   **多端适配**：有优秀的 Web 界面，也有第三方手机 App（如 Paperless Mobile）。

## 1. 部署 Paperless-ngx (Docker Compose)

Paperless-ngx 依赖 Redis 和 PostgreSQL，同时需要 Tika（用于解析文档）和 Gotenberg（用于转换 PDF）。这是一个比较复杂的堆栈。

### 准备工作
1.  在 `/volume1/docker/` 下创建 `paperless` 目录。
2.  创建 `docker-compose.yml` 和 `.env` 文件。

### docker-compose.yml
```yaml
services:
  broker:
    image: docker.io/library/redis:7
    restart: unless-stopped
    volumes:
      - redisdata:/data

  db:
    image: docker.io/library/postgres:15
    restart: unless-stopped
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: paperless
      POSTGRES_USER: paperless
      POSTGRES_PASSWORD: paperless_password # 请修改

  webserver:
    image: ghcr.io/paperless-ngx/paperless-ngx:latest
    restart: unless-stopped
    depends_on:
      - db
      - broker
    ports:
      - 8000:8000
    volumes:
      - /volume1/docker/paperless/data:/usr/src/paperless/data
      - /volume1/docker/paperless/media:/usr/src/paperless/media
      - /volume1/docker/paperless/export:/usr/src/paperless/export
      - /volume1/docker/paperless/consume:/usr/src/paperless/consume
    environment:
      PAPERLESS_REDIS: redis://broker:6379
      PAPERLESS_DBHOST: db
      PAPERLESS_DBPASS: paperless_password # 请修改
      PAPERLESS_OCR_LANGUAGE: chi_sim+eng # 开启中文简体和英文 OCR
      PAPERLESS_TIME_ZONE: Asia/Shanghai
      PAPERLESS_URL: https://paperless.yourdomain.com # 你的域名
      USERMAP_UID: 1026
      USERMAP_GID: 100

volumes:
  redisdata:
  pgdata:
```

### 关键点解析
*   **PAPERLESS_OCR_LANGUAGE**: 必须设置为 `chi_sim+eng`，否则中文无法识别。Paperless 镜像默认已包含中文语言包（如果使用的是精简版镜像可能需要手动挂载 `tessdata`）。
*   **consume 目录**: 这是“吞噬”目录。你可以把扫描仪或手机扫描 App 的保存路径指向这里，Paperless 监测到新文件会自动导入并删除源文件。

## 2. 初始化与配置

容器启动后，**必须先创建超级管理员**才能登录。

### 创建管理员
1.  SSH 进入 NAS。
2.  执行命令：
    ```bash
    docker exec -it paperless-webserver manage.py createsuperuser
    ```
3.  按提示输入用户名、邮箱、密码。

### 登录
访问 `http://nas-ip:8000`，使用刚才创建的账号登录。

## 3. 核心功能实战

### 3.1 消费目录 (Consume Folder)
这是最自动化的入口。
1.  在 NAS 上把 `/volume1/docker/paperless/consume` 共享出来（通过 SMB）。
2.  配置你的扫描仪（如爱普生、兄弟）直接扫描 PDF 到这个 SMB 目录。
3.  或者在手机上用 **Scanner Pro** / **Adobe Scan** 扫描后，分享到这个 SMB 目录。
4.  几秒钟后，Paperless 后台就会出现该文档，且已完成 OCR。

### 3.2 匹配算法 (Matching Algorithms)
Paperless 的灵魂在于“训练”。
1.  上传一张“中国电信话费账单”。
2.  手动给它打标签：`Bills` (账单), `Telecom` (电信)。对应人：`Me`。
3.  **自动学习**：Paperless 提供了神经网络匹配器。当你手动处理了几张类似的账单后，它会学会“长这样的文档就是电信账单”，下次自动打标签。
4.  **正则匹配**：你也可以硬编码规则。例如：内容包含 `发票` 且包含 `京东` -> 标签 `Shopping`。

### 3.3 全文搜索
在搜索框输入“冰箱”，它能搜到你 3 年前买冰箱时的发票和说明书，直接高亮显示关键词位置。

## 4. 手机端 App

推荐使用 **Paperless Mobile** (Android) 或 **Swift Paperless** (iOS)。
*   配置 URL: `http://nas-ip:8000`
*   功能：可以直接调用手机摄像头扫描，上传到 Paperless，随时随地查阅文档。

## 5. 常见问题

### Q1: 中文 OCR 乱码或不准确？
*   确保 `PAPERLESS_OCR_LANGUAGE` 包含了 `chi_sim`。
*   检查 PDF 是否是纯图片。如果是已经有文字层的 PDF，Paperless 默认会跳过 OCR。可以在设置中强制开启 OCR。

### Q2: 备份策略？
*   Paperless 的核心数据在 `media` (原文件) 和 `data` (数据库/索引) 目录。
*   **定期导出**：Paperless 提供了一个导出命令 `document_exporter`，可以把所有文件和元数据导出为标准格式，防止被锁死在系统里。
    ```bash
    # 每天凌晨 3 点自动导出备份
    0 3 * * * docker exec paperless-webserver manage.py document_exporter /usr/src/paperless/export
    ```
