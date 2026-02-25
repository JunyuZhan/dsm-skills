# 医生与医疗诊所：PACS 影像归档与患者数据保护

对于个体诊所、牙科、医美机构以及需要整理科研数据的医生，**医学影像存储 (PACS)**、**患者隐私保护 (HIPAA/GDPR)** 和**数据长期归档**是核心需求。群晖 NAS 可作为高性价比的私有医疗数据中心。

## 核心痛点与解决方案

| 痛点 | 解决方案 | 核心技术 |
| :--- | :--- | :--- |
| **DICOM 影像查看** | 网页版 PACS 浏览器 | **Orthanc** (Docker) |
| **患者隐私保护** | 硬盘加密与访问审计 | **Encrypted Folder** / **Log Center** |
| **病例数据备份** | 3-2-1 自动备份 | **Active Backup for Business** |
| **远程会诊** | 安全共享影像链接 | **File Station** (带密码/有效期) |
| **科研文献管理** | Zotero 文献库同步 | **WebDAV** |

## 1. 搭建私有 PACS 系统：Orthanc

Orthanc 是一个轻量级、开源的 DICOM 服务器，非常适合小型诊所和科研使用。

### 1.1 Docker Compose 部署
```yaml
version: '3.8'
services:
  orthanc:
    image: osimis/orthanc
    container_name: orthanc
    ports:
      - "8042:8042" # HTTP 界面
      - "4242:4242" # DICOM 协议端口
    environment:
      - ORTHANC_NAME=MyClinicPACS
      - WADO_ENABLED=true
    volumes:
      - /volume1/docker/orthanc/storage:/var/lib/orthanc/db
    restart: always
```

### 1.2 使用场景
1.  **影像接收**：将 CT/MRI 设备（或工作站）的 DICOM 节点指向 NAS IP:4242。
2.  **网页查看**：访问 `http://nas-ip:8042`，直接在浏览器中查看患者的 X 光片、CT 切片。
3.  **科研整理**：将大量 DICOM 文件拖入 Orthanc 界面，自动按患者 ID、检查日期归档。

## 2. 患者数据隐私与合规

医疗数据极其敏感，必须符合当地法律法规（如 HIPAA）。

### 2.1 物理层加密
*   **加密共享文件夹**：所有存放病历、影像的文件夹**必须**开启加密。
*   **密钥管理**：不要勾选“开机自动挂载”。将密钥保存在 U 盘中，只有上班时插入 U 盘解锁，下班拔走 U 盘，NAS 即被锁定。

### 2.2 严格的访问控制
*   **账户隔离**：
    *   `Dr_Wang` (读写)：主治医生，可上传诊断报告。
    *   `Nurse_Li` (只读)：护士，仅可查看排班和基础信息。
    *   `Guest_Consult` (受限)：远程会诊专家，仅能访问特定文件夹。
*   **禁止外网直接访问**：
    *   关闭 NAS 的 5000/5001 端口映射。
    *   必须通过 VPN (VPN Server / Tailscale) 才能从诊所外部访问数据。

## 3. 诊所数据备份策略

诊所数据丢失可能导致医疗纠纷。

### 3.1 工作站整机备份
诊所的前台电脑、医生工作站通常安装了昂贵的 HIS 软件或牙科成像软件，重装极其麻烦。
*   **Active Backup for Business (ABB)**：
    *   每天凌晨 2 点自动备份所有 Windows 电脑的 C 盘和 D 盘。
    *   如果电脑中毒或硬盘损坏，插上 USB 恢复盘，30 分钟内还原整个系统，无需重新安装软件。

### 3.2 异地灾备
*   **Hyper Backup**：将每日新增的 DICOM 影像加密打包，上传到云端（如 Amazon S3 或 百度网盘加密空间），防止火灾或盗窃导致数据全毁。

## 4. 科研与论文写作

对于在职博士或需要发 SCI 的医生。

### 4.1 Zotero 文献库
*   参考 [学生与科研人员指南](student-researcher.md)，利用 NAS 的 WebDAV 服务同步 Zotero 附件。
*   在医院、家、实验室三地无缝切换阅读文献。

### 4.2 实验数据归档
*   使用 **File Station** 的“请求文件”功能。
*   生成一个链接发给研究生，学生只能上传实验数据，无法看到文件夹内的其他内容，保护未发表数据。

## 5. 远程会诊与分享

需要把患者影像发给上级医院专家会诊？
*   不要用微信发几百 MB 的压缩包！
*   **File Station 分享**：
    *   右键 DICOM 文件夹 > 分享。
    *   设置 **有效期** (如 24 小时)。
    *   设置 **访问密码** (通过短信发给专家)。
    *   专家收到链接后，直接下载或在线预览（如果是 PDF 报告）。
