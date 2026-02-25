# Container Manager 进阶指南：原生 Docker 管理

在 DSM 7.2 中，Docker 套件升级为 **Container Manager**，最大的变化是原生支持了 **Docker Compose (Project)**。这意味着你终于可以摆脱 SSH，直接在图形界面管理复杂的多容器应用了。

## 1. Project (项目)：图形化 Docker Compose

以前部署 Nastools、Jellyfin 这种需要多个容器联动的应用，必须 SSH 敲 `docker-compose up -d`。现在：

1.  打开 **Container Manager** > **项目**。
2.  点击 **新增**。
3.  **项目名称**: `jellyfin-stack`。
4.  **路径**: 选择一个文件夹（如 `/docker/jellyfin`）。系统会自动在这里创建一个 `docker-compose.yml`。
5.  **来源**: 选择“创建 docker-compose.yml”。
6.  **编辑**: 直接把网上的 Compose 代码粘贴进去。
    ```yaml
    version: '3'
    services:
      jellyfin:
        image: jellyfin/jellyfin
        # ...
    ```
7.  **Web Station 门户**: 可选。勾选后，系统会自动在 Web Station 配置反向代理（需安装 Web Station）。
8.  点击 **下一步** > **完成**。
9.  Container Manager 会自动拉取镜像并启动容器。

**优势**：
*   **集中管理**：所有容器作为一个整体（Stack）管理，一键停止/启动/删除。
*   **配置持久化**：`docker-compose.yml` 文件直接保存在 File Station 中，备份方便。

## 2. Web Station 联动：替代反向代理

虽然 DSM 有独立的“反向代理服务器”入口，但 Container Manager 推荐通过 **Web Station** 来管理容器的 Web 入口。

1.  安装 **Web Station** 套件。
2.  在 Container Manager 创建项目时，勾选“通过 Web Station 设置门户”。
3.  或者手动在 **Web Station** > **Web 服务** > **新增** > **容器化脚本语言网站**。
4.  选择你的 Docker 容器。
5.  然后在 **网络门户** 中，给这个服务绑定域名或端口。

这种方式的优势在于可以统一管理 PHP/Node.js/Docker 等各种后端的入口。

## 3. 网络隔离：Internal Network

为了安全，有些数据库容器（如 Redis, MySQL）不需要暴露端口给局域网，只需要给同 Stack 的应用访问。

1.  在 **网络** 标签页。
2.  点击 **新增**。
3.  **驱动程序**: `bridge`。
4.  **名称**: `internal-net`。
5.  **IPv4 子网**: `172.20.0.0/16` (可选)。
6.  在容器配置中，将数据库容器加入这个网络，并且**不映射端口**到宿主机。
7.  应用容器也加入这个网络，通过容器名（如 `db`）直接访问数据库。

## 4. Macvlan 网络：让容器拥有独立 IP

如果你希望 Docker 容器像一台独立主机一样，拥有 192.168.1.x 的 IP，而不是端口映射。

*注意：DSM 界面暂不支持创建 Macvlan 网络，需 SSH 创建，但创建后可在界面管理。*

1.  **SSH 创建 Macvlan**:
    ```bash
    docker network create -d macvlan \
      --subnet=192.168.1.0/24 \
      --gateway=192.168.1.1 \
      -o parent=ovs_eth0 \
      macvlan_net
    ```
    *(注意：`ovs_eth0` 是开启了 VMM 后的网卡名，未开启可能是 `eth0`)*
2.  **Container Manager 使用**:
    *   在创建容器或项目时，网络选择 `macvlan_net`。
    *   容器内设置固定 IP（在 Compose 中）：
        ```yaml
        networks:
          macvlan_net:
            ipv4_address: 192.168.1.50
        ```

## 5. 自动更新 (Watchtower 替代品)

Container Manager 自带了更新检测功能，但不能自动更新。
*   **检测**：在 **注册表** 或 **映像** 页面，如果有新版本，会显示“更新可用”。
*   **手动更新**：点击“更新”，系统会拉取新镜像，并**重建容器**（保留数据）。这是官方最安全的更新方式。
*   如果你想要全自动，还是得用 Watchtower，或者 Portainer 的 Webhook。
