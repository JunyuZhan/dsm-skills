# Kubernetes (K3s) 轻量级集群部署

Docker Compose 虽好，但如果是多台 NAS 组集群，或者追求企业级的高可用，Kubernetes (K8s) 是终极选择。**K3s** 是 Rancher 推出的轻量级 K8s 发行版，非常适合在 NAS 这种边缘设备上运行。

## 1. 为什么选 K3s？

*   **轻量**：去除了 K8s 中大量不常用的云服务驱动，二进制文件不到 100MB。
*   **低资源**：512MB 内存即可运行（虽然建议 4GB+）。
*   **兼容**：完全兼容 K8s API，所有 Helm Chart 都能用。

## 2. 环境准备

*   **SSH**：开启 root 权限 SSH。
*   **swap**：建议关闭 swap（虽然 K3s 可以带 swap 跑，但性能有影响）。
*   **cgroup**：DSM 默认内核可能缺少部分 cgroup 支持，建议使用 **RR 引导** 或 **ARC 引导** 并开启 cgroup 补丁。

## 3. 安装 K3s (Master 节点)

在你的主 NAS 上执行：

```bash
# 国内环境建议使用镜像源
curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh | \
  INSTALL_K3S_MIRROR=cn \
  sh -s - server \
  --disable traefik \
  --disable servicelb \
  --write-kubeconfig-mode 644
```

*   `--disable traefik`: 禁用自带的 Traefik v1，我们后面自己装 v2/v3。
*   `--disable servicelb`: 禁用自带的 LoadBalancer，后面可以用 MetalLB。

## 4. 添加 Worker 节点 (可选)

如果你有第二台 NAS（比如闲置的小主机）。

1.  在 Master 节点获取 Token：
    ```bash
    cat /var/lib/rancher/k3s/server/node-token
    ```
2.  在 Worker 节点执行：
    ```bash
    curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh | \
      INSTALL_K3S_MIRROR=cn \
      K3S_URL=https://MASTER_IP:6443 \
      K3S_TOKEN=你的TOKEN \
      sh -
    ```

## 5. 安装 Rancher (可视化管理)

命令行太痛苦？装个 Rancher 面板。

### Helm 安装
首先在本地电脑安装 `helm` 和 `kubectl`，配置好 `~/.kube/config` (从 NAS `/etc/rancher/k3s/k3s.yaml` 复制出来，修改 IP 为 NAS IP)。

```bash
# 添加仓库
helm repo add rancher-stable https://releases.rancher.com/server-charts/stable
helm repo update

# 创建命名空间
kubectl create namespace cattle-system

# 安装 Cert-Manager (Rancher 依赖)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.11.0/cert-manager.yaml

# 安装 Rancher
helm install rancher rancher-stable/rancher \
  --namespace cattle-system \
  --set hostname=rancher.yourdomain.com \
  --set bootstrapPassword=admin
```

## 6. 存储类 (StorageClass)

K8s 需要持久化存储。我们可以利用 NAS 的 NFS。

1.  在 NAS 控制面板启用 NFS 服务。
2.  安装 **NFS Subdir External Provisioner**。
    ```bash
    helm repo add nfs-subdir-external-provisioner https://kubernetes-sigs.github.io/nfs-subdir-external-provisioner/
    helm install nfs-client nfs-subdir-external-provisioner/nfs-subdir-external-provisioner \
      --set nfs.server=192.168.1.x \
      --set nfs.path=/volume1/k3s-data
    ```
3.  现在，你在 K8s 里创建一个 PVC，NAS 上就会自动创建一个对应的文件夹。

## 7. 进阶：GitOps (ArgoCD)

*   **理念**：不在面板上点点点，而是把所有 YAML 文件存在 Git 仓库里。
*   **ArgoCD**：自动监听 Git 仓库，一旦有 commit，自动同步到 K8s 集群。
*   **效果**：你的 NAS 集群变成了“不可变基础设施”，重装系统只需一键同步。
