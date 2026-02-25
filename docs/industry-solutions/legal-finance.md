# 律师与财务人员：打造银行级数据保险箱

对于律师、会计师和金融从业者，**数据合规性 (Compliance)**、**安全性 (Security)** 和**审计追踪 (Audit Trail)** 是核心诉求。群晖 NAS 不仅是存储设备，更是符合 SOX、GDPR 等法规要求的企业数据金库。

本指南将深入讲解如何配置 **WORM** 防止文件篡改，如何用 **Paperless-ngx** 实现智能文档管理，以及如何自建 **DocuSeal** 电子签章系统。

## 1. 银行级防篡改：WORM 实战配置

在法律诉讼或财务审计中，电子证据的“真实性”至关重要。WORM (Write Once, Read Many) 技术确保文件一旦写入，在指定保留期内（如 5 年），连管理员（Root）都无法修改或删除。

### 1.1 创建合规文件夹
1.  **前提**：确保存储池支持 Btrfs 文件系统。
2.  **路径**：`控制面板` > `共享文件夹` > `新增`。
3.  **关键步骤**：在创建向导中，勾选 **“保护此共享文件夹免受意外更改 (WriteOnce)”**。
4.  **模式选择**（慎选！）：
    *   **企业模式 (Enterprise Mode)**：管理员可以在必要时删除整个文件夹（但不能修改单个文件）。适合内部归档。
    *   **合规模式 (Compliance Mode)**：**绝对不可删除**。即使用户离职、公司倒闭，只要硬盘还在，保留期内就删不掉。适合法律取证。
5.  **锁定策略**：
    *   **自动锁定**：设置“文件上传后 1 小时自动锁定”。
    *   **保留期限**：例如 3 年（根据税务/法律法规要求）。

### 1.2 验证 WORM 是否生效
上传一个测试文件 `contract_test.pdf`，等待锁定时间后：
*   尝试重命名 -> **失败**。
*   尝试删除 -> **失败**。
*   尝试编辑并保存 -> **失败**。
*   *File Station 状态*：文件图标上会出现一个小锁标志，属性中显示“WORM 锁定至 2029-01-01”。

## 2. 智能文档管理：Paperless-ngx 深度集成

律所和财务室有大量纸质合同、发票。Paperless-ngx 能将它们变成可搜索的数字资产。

### 2.1 Docker Compose 部署 (含 Tika 和 Gotenberg)
我们需要 Tika (强大的文本提取) 和 Gotenberg (PDF 转换) 来增强 OCR 能力。

```yaml
version: "3.4"
services:
  broker:
    image: redis:7
    restart: unless-stopped
    volumes:
      - redisdata:/data

  db:
    image: postgres:15
    restart: unless-stopped
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: paperless
      POSTGRES_USER: paperless
      POSTGRES_PASSWORD: paperless_password

  webserver:
    image: ghcr.io/paperless-ngx/paperless-ngx:latest
    restart: unless-stopped
    depends_on:
      - db
      - broker
      - gotenberg
      - tika
    ports:
      - "8000:8000"
    volumes:
      - /volume1/docker/paperless/data:/usr/src/paperless/data
      - /volume1/docker/paperless/media:/usr/src/paperless/media
      - /volume1/docker/paperless/export:/usr/src/paperless/export
      - /volume1/scan_input:/usr/src/paperless/consume # 扫描仪输入目录
    environment:
      PAPERLESS_REDIS: redis://broker:6379
      PAPERLESS_DBHOST: db
      PAPERLESS_DBPASS: paperless_password
      PAPERLESS_TIKA_ENABLED: 1
      PAPERLESS_TIKA_GOTENBERG_ENDPOINT: http://gotenberg:3000
      PAPERLESS_TIKA_ENDPOINT: http://tika:9998
      PAPERLESS_OCR_LANGUAGE: chi_sim+eng # 支持中英文 OCR
      PAPERLESS_TIME_ZONE: Asia/Shanghai
      USERMAP_UID: 1026
      USERMAP_GID: 100

  gotenberg:
    image: gotenberg/gotenberg:7.8
    restart: unless-stopped

  tika:
    image: apache/tika:latest
    restart: unless-stopped

volumes:
  redisdata:
  pgdata:
```

### 2.2 自动化工作流 (Automation Rules)
Paperless 不仅仅是存储，还能“自动分类”。
1.  进入 `Paperless` > `Workflows`。
2.  **场景 1：自动归档发票**
    *   **触发器**：内容包含 "增值税专用发票" 或 "Invoice"。
    *   **动作**：
        *   自动打标签：`Finance`。
        *   自动分配对应人：`Accountant`。
        *   修改创建日期：从文件内容中提取日期（如 OCR 识别到的开票日期）。
3.  **场景 2：自动重命名**
    *   设置存储路径规则：`{created_year}/{correspondent}/{title}`。
    *   效果：上传 `scan_001.pdf`，自动整理为 `2024/阿里云/1月服务器账单.pdf`。

### 2.3 物理扫描仪对接
*   **Brother/Epson/HP 网络扫描仪**：在扫描仪后台设置 "Scan to FTP/SMB"。
*   **目标路径**：指向 NAS 的 `/volume1/scan_input` 文件夹。
*   **效果**：把纸质合同放入扫描仪，按一下按钮，1 分钟后，Paperless 里就能搜到这份合同的电子版。

## 3. 自建电子签章系统：DocuSeal

DocuSign 太贵且数据在海外？用 DocuSeal 搭建私有的电子签章平台。

### 3.1 部署 DocuSeal
```yaml
version: '3'
services:
  docuseal:
    image: docuseal/docuseal:latest
    container_name: docuseal
    ports:
      - "3000:3000"
    volumes:
      - /volume1/docker/docuseal/data:/data
    environment:
      - DATABASE_URL=sqlite3:/data/docuseal.db # 小团队用 SQLite 足够，大并发可用 Postgres
    restart: unless-stopped
```

### 3.2 使用流程
1.  上传 PDF 合同。
2.  拖拽签名框、日期框、印章位置。
3.  输入客户邮箱，发送签署链接。
4.  客户在手机/电脑上手写签名或上传印章。
5.  签署完成后，系统生成带**数字指纹**的 PDF，双方均可下载存档。

## 4. 审计与合规：Log Center 进阶

仅仅记录日志不够，需要“即时报警”。

### 4.1 关键词报警
1.  打开 **Log Center** > `通知设置` > `关键词通知`。
2.  新增规则：
    *   **关键词**：`Delete` 或 `Permission change`。
    *   **日志来源**：`File Transfer` (SMB/File Station)。
    *   **严重性**：`Error` 或 `Warning`。
3.  **效果**：一旦有员工尝试删除重要合同，您的手机（DS finder）或邮箱会立即收到警报。

### 4.2 定期审计报告
设置任务计划，每月导出 CSV 日志并发送给合规官。
```bash
# 简单的脚本示例：导出上个月的文件删除记录
log_file="/volume1/logs/audit_$(date +%Y%m).csv"
sqlite3 /var/log/synolog/synoconn.db "select * from logs where event like '%Delete%' and time > date('now','start of month','-1 month');" > $log_file
# 可以结合 sendmail 发送邮件
```

## 5. 灾难恢复：Hyper Backup 加密策略

备份盘丢失 = 数据泄露？

1.  **客户端加密**：在 Hyper Backup 创建任务时，**必须**勾选“启用客户端加密”。
2.  **密钥保管**：下载 `.pem` 密钥文件，并将其打印出来放入物理保险箱，或者存放在 1Password/Bitwarden 的安全笔记中。
3.  **异地备份**：建议使用 C2 Storage 或 S3 (Amazon/Aliyun) 作为异地端，这些云服务均支持服务端加密 (SSE)。

---
**总结**：通过 WORM 锁定底层数据，Paperless 自动化处理文档流，DocuSeal 完成法律效力闭环，Log Center 负责全程审计，您构建的不仅仅是 NAS，而是一个符合企业内控标准的**法务金融数据中心**。
