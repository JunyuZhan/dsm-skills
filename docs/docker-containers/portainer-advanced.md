# Portainer 深度指南：企业级 Docker 管理

虽然群晖自带了 Container Manager，但 **Portainer** 依然是进阶玩家的必备工具。它提供了更强大的 **Stacks (GitOps)**、**App Templates**、**Edge Agent** 等功能，让你像管理企业集群一样管理 NAS。

## 1. Stacks：GitOps 自动部署

这是 Portainer 最核心的功能。你可以直接把 Docker Compose 文件放在 GitHub/Gitea 仓库里，Portainer 自动拉取并部署。**修改代码 -> 提交 Git -> 容器自动更新**。

### 配置步骤
1.  **准备 Git 仓库**：在 GitHub 上创建一个私有仓库，上传 `docker-compose.yml`。
2.  **Portainer** > **Stacks** > **Add stack**。
3.  **Build method**: 选择 **Repository**。
4.  **Repository URL**: `https://github.com/yourname/nas-docker.git`。
5.  **Repository reference**: `refs/heads/main`。
6.  **Authentication**: 如果是私有仓库，开启并输入 GitHub Token。
7.  **Automatic updates**: 开启。
    *   **Fetch interval**: `5m` (每 5 分钟检查一次)。
    *   **Force redeployment**: 开启（Git 变动时自动重建容器）。
8.  点击 **Deploy the stack**。

从此，你只需要在电脑上修改 Git 仓库里的配置，NAS 上的容器就会自动同步更新。

## 2. App Templates：自建应用商店

Portainer 允许你添加第三方模板源，实现“一键部署”。

1.  **Settings** > **App Templates**。
2.  **URL**: 输入第三方模板地址。
    *   推荐（Lissy93）：`https://raw.githubusercontent.com/Lissy93/portainer-templates/main/templates.json`
    *   推荐（Technorabilia）：`https://raw.githubusercontent.com/technorabilia/portainer-templates/main/lsio/templates.json`
3.  保存。
4.  回到 **App Templates** 页面，你会发现多了几百个应用（如 Plex, Radarr, Home Assistant）。点击即装，无需手写 Compose。

## 3. Environment Variables：环境变量管理

在多个容器中复用同一个密码或 Token？

1.  **Stacks** > 选择一个 Stack。
2.  **Environment variables** 部分。
3.  **Add environment variable**。
    *   Name: `MYSQL_ROOT_PASSWORD`
    *   Value: `mysecret`
4.  在 Compose 文件中引用：
    ```yaml
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
    ```
5.  这样你的 Compose 文件就是干净的，不包含敏感信息，可以放心分享给别人。

## 4. Edge Agent：管理多台设备

如果你有另一台 NAS 或 VPS，可以在 Portainer 中统一管理。

1.  **Environments** > **Add environment**。
2.  选择 **Edge Agent**。
3.  Portainer 会生成一串命令。
4.  在另一台设备（VPS）上执行这串命令（启动一个 Agent 容器）。
5.  回到 Portainer，那台设备就会显示为 `Online`。
6.  你可以在群晖的 Portainer 界面上，直接操作 VPS 上的 Docker 容器，无需 SSH 登录 VPS。

## 5. 常见问题

### Q1: Portainer 忘记密码？
Portainer 为了安全，启动后 5 分钟如果不创建管理员，会自动关闭注册通道。
*   **重置方法**：使用 `portainer/helper-reset-password` 镜像。
    ```bash
    docker stop portainer
    docker run --rm -v /volume1/docker/portainer:/data portainer/helper-reset-password
    docker start portainer
    ```
    查看输出日志获取新密码。

### Q2: 无法连接本地 Docker？
*   确保挂载了 `/var/run/docker.sock`。
*   权限问题：确保 Portainer 容器有权限访问该 Socket（通常无需特殊设置，除非开启了高权限模式）。
