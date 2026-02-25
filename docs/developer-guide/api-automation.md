# DSM 自动化开发指南 (Python/API)

对于开发者来说，DSM 不仅仅是一个 GUI 系统，它是一个拥有丰富 API 的 Linux 服务器。

## 1. 开启 SSH 与环境准备

1.  **Python 环境**：虽然 DSM 自带 Python，但建议安装社群版的 **Python 3.11**，并安装 `pip`。
    ```bash
    # 安装 pip (如果社群版未带)
    python3 -m ensurepip
    ```
2.  **虚拟环境**：
    ```bash
    python3 -m venv /volume1/scripts/venv
    source /volume1/scripts/venv/bin/activate
    ```

## 2. Synology Web API 基础

DSM 的所有网页操作都是通过 Web API 进行的。我们可以模拟这些请求。

*   **文档**：官方有 [Synology Web API Guide](https://global.download.synology.com/download/Document/Software/DeveloperGuide/Package/FileStation/All/enu/Synology_File_Station_API_Guide.pdf)，但比较旧。
*   **第三方库**：推荐使用 `synology-api` (Python)。
    ```bash
    pip install synology-api
    ```

### 示例代码：获取系统信息与温度

```python
from synology_api import core_sys_info

# 登录
fl = core_sys_info.SysInfo('NAS_IP', '8080', 'username', 'password', secure=True, cert_verify=False)

# 获取信息
info = fl.get_system_info()
temp = info['data']['temperature']
print(f"当前 CPU 温度: {temp} °C")
```

## 3. 自动化场景案例

### 案例 A：下载完成自动整理 (File Station API)
配合 Download Station 或 qBittorrent 的“下载完成后运行脚本”。
1.  脚本调用 File Station API。
2.  判断文件名特征。
3.  调用 `rename` 或 `move` 接口，将文件移动到对应目录。

### 案例 B：监控特定 Docker 容器并自动重启
虽然 Docker 有 restart policy，但有时我们需要更复杂的逻辑（比如连续报错 5 次再重启）。
1.  使用 `docker` Python 库连接本地 Docker Socket。
2.  读取 logs。
3.  触发重启。

### 案例 C：自定义 Webhook 通知
DSM 的通知中心支持 Webhook，但如果你想发送复杂的卡片消息（如飞书/钉钉的富文本卡片）。
1.  编写 Python 脚本，接收原始数据。
2.  格式化为 Markdown。
3.  发送到飞书 API。

## 4. 使用 Task Scheduler 运行 Python

在任务计划中运行 Python 脚本时，务必使用**虚拟环境的解释器路径**。

*   **脚本内容**：
    ```bash
    cd /volume1/scripts
    /volume1/scripts/venv/bin/python3 my_script.py
    ```

## 5. 逆向工程 (抓包)

官方文档不全怎么办？**F12 大法**。
1.  打开浏览器开发者工具 > Network。
2.  在 DSM 网页上执行你想要的操作（比如“清空回收站”）。
3.  查看 Network 中的请求。通常是 `entry.cgi`。
4.  分析参数 `api`, `method`, `version`。
5.  在 Python 中模拟这个请求。

## 6. 安全建议

*   **不要硬编码密码**：使用环境变量或配置文件，并设置文件权限为 `600`。
*   **创建一个专用账号**：不要用 admin 账号跑脚本。创建一个 `bot` 账号，只赋予必要的权限（如 File Station 读写，禁止访问桌面）。
