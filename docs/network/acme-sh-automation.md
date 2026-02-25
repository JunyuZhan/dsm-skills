# acme.sh：泛域名 SSL 证书自动化 (Deployment Hook)

群晖 DSM 自带的 Let's Encrypt 证书申请功能有两个痛点：
1.  不支持 DNS 验证（除非用 Synology DDNS），无法申请泛域名证书 (`*.yourdomain.com`)。
2.  必须开放 80 端口进行 HTTP 验证，对没有公网 IP 的内网用户不友好。

**acme.sh** 是一个纯 Shell 脚本实现的 ACME 客户端，轻量、强大。配合 **synology-deploy** 钩子，可以实现：**自动申请泛域名证书 -> 自动部署到 DSM -> 自动重启 Web 服务**，全程无需人工干预。

## 1. 方案选择：Docker vs 原生

虽然 acme.sh 可以直接跑在 SSH 里，但为了环境隔离和升级方便，**强烈推荐使用 Docker**。

## 2. 部署 acme.sh (Docker)

### 准备工作
1.  **域名 API Token**：
    *   **阿里云**：AccessKey ID 和 Secret。
    *   **腾讯云**：SecretId 和 SecretKey。
    *   **Cloudflare**：API Token (Zone:DNS:Edit)。
2.  **群晖管理员账号**：创建一个专门用于部署证书的账号（如 `cert-deploy`），赋予管理员权限（为了安全，建议开启 2FA，但在脚本中使用需要特殊处理，这里建议仅限内网访问）。或者直接用 admin（风险自负）。

### docker-compose.yml
```yaml
services:
  acme:
    image: neilpang/acme.sh:latest
    container_name: acme.sh
    command: daemon
    volumes:
      - /volume1/docker/acme.sh:/acme.sh
    environment:
      - DEPLOY_DOCKER_CONTAINER_LABEL=sh.acme.autoload.domain=example.com
      # 阿里云 DNS 示例
      - Ali_Key=你的AccessKey
      - Ali_Secret=你的Secret
      # 腾讯云 DNS 示例
      # - DP_Id=你的SecretId
      # - DP_Key=你的SecretKey
      # Cloudflare DNS 示例
      # - CF_Token=你的Token
      # - CF_Account_ID=你的AccountID
      # 群晖部署配置
      - SYNO_Username=admin
      - SYNO_Password=password
      - SYNO_Certificate=cert_name # 在 DSM 证书列表中显示的描述名
      - SYNO_Create=1 # 如果证书不存在，自动创建
      - SYNO_Port=5000
    restart: always
```

## 3. 申请证书 (Issue Certificate)

容器启动后，我们需要进入容器执行申请命令。

1.  **进入容器**：
    ```bash
    docker exec -it acme.sh sh
    ```
2.  **注册账号** (仅第一次)：
    ```bash
    acme.sh --register-account -m your@email.com
    ```
3.  **申请证书**：
    *   以阿里云 (`dns_ali`) 为例，申请 `*.yourdomain.com` 和 `yourdomain.com`。
    ```bash
    acme.sh --issue --dns dns_ali \
      -d yourdomain.com -d *.yourdomain.com
    ```
    *   如果成功，你会看到 `Cert success`。证书文件保存在 `/acme.sh/yourdomain.com/` 下。

## 4. 自动部署到 DSM (Deploy Hook)

申请到证书只是第一步，关键是要把它安装到群晖系统里。acme.sh 内置了 `synology_dsm` 部署钩子。

1.  **执行部署**：
    ```bash
    acme.sh --deploy -d yourdomain.com \
      --deploy-hook synology_dsm
    ```
    *   脚本会自动登录 DSM，上传证书，替换默认证书，并重启 Nginx 服务。
    *   *注意：如果报错 `2FA is enabled`，请在脚本中配置 `SYNO_DID`（设备 ID），或者暂时关闭 2FA。*

2.  **验证**：
    登录 DSM **控制面板** > **安全性** > **证书**。你应该能看到一个新的证书，描述为你设置的 `SYNO_Certificate`。

## 5. 自动化续期 (Crontab)

acme.sh 容器启动时以 `daemon` 模式运行，它内部自带了一个 crontab 任务，**每天凌晨自动检查证书有效期**。
*   Let's Encrypt 证书有效期 90 天。
*   acme.sh 会在第 60 天自动续期。
*   续期成功后，会自动触发 `--deploy-hook synology_dsm`，将新证书部署到 DSM。

**你完全不需要管它了。**

## 6. 进阶：部署到 Docker 容器

除了部署到 DSM 系统，你可能还想把证书给 Nginx、Traefik 等容器使用。

### 方式 A：挂载目录
直接把 `/volume1/docker/acme.sh/yourdomain.com` 目录挂载给 Nginx 容器。
```yaml
volumes:
  - /volume1/docker/acme.sh/yourdomain.com/fullchain.cer:/etc/nginx/ssl/server.crt
  - /volume1/docker/acme.sh/yourdomain.com/yourdomain.com.key:/etc/nginx/ssl/server.key
```

### 方式 B：复制安装
使用 `install-cert` 命令把证书复制到指定目录（推荐，权限更可控）。
```bash
acme.sh --install-cert -d yourdomain.com \
  --key-file       /path/to/nginx/ssl/key.pem  \
  --fullchain-file /path/to/nginx/ssl/cert.pem \
  --reloadcmd     "docker restart nginx"
```

## 7. 常见问题

### Q1: 部署失败，提示 "Login failed"？
*   检查 `SYNO_Username` 和 `SYNO_Password` 是否正确。
*   如果开启了 2FA，需要获取 `DID` (Device ID)。
    *   在浏览器登录 DSM，按 F12 打开开发者工具。
    *   找到 Cookies 中的 `did` 字段。
    *   在环境变量中添加 `SYNO_DID=xxxxxx`。

### Q2: 泛域名解析失败？
*   确保你的域名 DNS 服务商支持 API 操作。
*   等待 DNS 传播（通常 1-2 分钟，acme.sh 会自动重试）。
