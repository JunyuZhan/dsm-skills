# 任务计划与脚本管理进阶

DSM 的图形界面虽然好用，但真正的自动化离不开 Task Scheduler（任务计划）。这里教你如何安全、高效地运行脚本。

## 1. 任务类型详解

**控制面板** > **任务计划** > **新增**。

*   **计划的任务 (Scheduled Task)**：
    *   **用户定义的脚本**：最常用。运行 Shell 脚本。
    *   **回收站清理**：自动清空 `#recycle` 目录。
    *   **哔声控制**：比如设置每晚 22:00 停止哔声（防扰民），早上 8:00 恢复。
    *   **服务**：定时启动/停止某些套件（比如白天开 Docker，晚上关了省电）。
*   **触发的任务 (Triggered Task)**：
    *   **开机/关机**：在系统启动或关闭时执行。常用于挂载设备、修补环境。

## 2. 脚本编写安全规范

### A. 使用绝对路径
DSM 的环境变量 `$PATH` 可能与你 SSH 登录时不同。
*   ❌ 错误：`python3 script.py`
*   ✅ 正确：`/usr/local/bin/python3 /volume1/scripts/script.py`

### B. 用户权限
*   **root**：拥有最高权限。大部分维护脚本需要 root。
*   **admin/user**：如果只是备份个人文件，建议用普通用户运行，防止误删系统文件。

### C. 输出日志
默认情况下，脚本在后台静默运行，报错了你也不知道。
*   **技巧**：在“任务设置”选项卡中，勾选“通过电子邮件发送运行详细信息”。
*   **或者**：重定向输出到文件。
    ```bash
    /path/to/script.sh >> /volume1/logs/script.log 2>&1
    ```

## 3. 实用脚本案例

### 案例 A：自动清理旧文件
定期删除 `Downloads` 文件夹中超过 30 天的文件。
```bash
# 查找 /volume1/downloads 下修改时间超过 30 天的文件并删除
find /volume1/downloads -type f -mtime +30 -delete
# 删除空文件夹
find /volume1/downloads -type d -empty -delete
```

### 案例 B：Docker 容器定时重启
有些容器（如爬虫）运行久了内存泄漏，需要每天重启。
```bash
docker restart my-container-name
```

### 案例 C：监测公网 IP 变动并推送到 Server酱
虽然有 DDNS，但有时我们需要直接知道 IP。
```bash
#!/bin/bash
CURRENT_IP=$(curl -s ifconfig.me)
# 你的 Server酱 Key
SCKEY="xxxxxx"
curl -s "https://sc.ftqq.com/$SCKEY.send?text=NAS_IP_Changed&desp=$CURRENT_IP"
```

## 4. 环境变量问题

在任务计划中运行脚本，经常遇到“命令找不到”的错误。因为非交互式 shell 不会加载 `.bashrc` 或 `.profile`。

**解决方案**：在脚本开头手动定义 PATH。
```bash
#!/bin/bash
export PATH=/sbin:/bin:/usr/sbin:/usr/bin:/usr/local/sbin:/usr/local/bin
# 你的命令...
```

## 5. 任务计划的备份

任务计划的配置**不包含**在 Hyper Backup 的常规备份中（只在系统配置备份里）。
*   **建议**：把你编写的所有 `.sh` 脚本文件集中存放在一个共享文件夹（如 `/volume1/scripts`），并对该文件夹进行 Hyper Backup 备份。
*   **恢复**：重装系统后，只需重新创建任务计划指向这些脚本即可。
