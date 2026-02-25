# Ansible NAS 自动化运维实战

随着你折腾的深入，你可能拥有了不止一台设备：群晖 NAS、软路由 (OpenWrt)、云服务器 (VPS)、树莓派。手动 SSH 登录每台设备去执行命令（如更新 Docker、备份配置、检查磁盘）非常低效且容易出错。

**Ansible** 是最适合个人用户的自动化运维工具：**无 Agent**（无需在被控端安装软件）、**配置简单**（YAML 格式）、**幂等性**（重复执行不会报错）。

## 1. 架构设计

*   **控制节点 (Control Node)**：你的群晖 NAS（通过 Docker 运行 Ansible）或你的 Mac/Linux 电脑。
*   **受控节点 (Managed Nodes)**：NAS 本身、路由器、VPS 等。

## 2. 环境搭建

### 控制节点 (Docker)
在 NAS 上部署 Ansible 容器，作为一个永久在线的控制台。

```yaml
services:
  ansible:
    image: willhallonline/ansible:latest
    container_name: ansible
    volumes:
      - /volume1/docker/ansible/playbooks:/ansible/playbooks
      - /volume1/docker/ansible/inventory:/ansible/inventory
      - /volume1/docker/ansible/config:/root/.ssh # 存放 SSH 私钥
    tty: true
    restart: always
```

### SSH 免密登录 (关键)
Ansible 依赖 SSH。你需要生成一对密钥，并将公钥分发给所有受控设备。

1.  **生成密钥**：
    ```bash
    ssh-keygen -t ed25519 -C "ansible"
    ```
2.  **分发公钥**：
    ```bash
    ssh-copy-id -i ~/.ssh/id_ed25519.pub admin@192.168.1.100 (NAS)
    ssh-copy-id -i ~/.ssh/id_ed25519.pub root@192.168.1.1 (Router)
    ```

### 配置清单 (Inventory)
创建 `/ansible/inventory/hosts.ini`：

```ini
[nas]
synology ansible_host=192.168.1.100 ansible_user=admin ansible_port=22

[router]
openwrt ansible_host=192.168.1.1 ansible_user=root

[vps]
aliyun ansible_host=47.x.x.x ansible_user=root

[all:vars]
ansible_ssh_private_key_file=/root/.ssh/id_ed25519
```

## 3. 实战剧本 (Playbooks)

### 场景一：批量更新 Docker 容器
虽然有 Watchtower，但 Ansible 更加可控。我们可以使用 `community.docker` 模块。

`update_docker.yml`:
```yaml
---
- name: Update Docker Containers
  hosts: nas
  become: yes #以此用户 sudo 权限执行
  tasks:
    - name: Pull latest image for Portainer
      docker_image:
        name: portainer/portainer-ce
        tag: latest
        source: pull

    - name: Recreate Portainer container
      docker_container:
        name: portainer
        image: portainer/portainer-ce:latest
        state: started
        restart: yes
        recreate: yes
        volumes:
          - /var/run/docker.sock:/var/run/docker.sock
          - /volume1/docker/portainer:/data
        ports:
          - "9000:9000"
```

### 场景二：分发 SSL 证书
你用 acme.sh 申请了证书，想自动分发给家里的软路由 Web 后台？

`deploy_cert.yml`:
```yaml
---
- name: Deploy SSL Certs
  hosts: router
  tasks:
    - name: Copy Cert
      copy:
        src: /volume1/docker/acme.sh/example.com/fullchain.cer
        dest: /etc/uhttpd.crt
        mode: '0644'
    
    - name: Copy Key
      copy:
        src: /volume1/docker/acme.sh/example.com/example.com.key
        dest: /etc/uhttpd.key
        mode: '0600'

    - name: Restart uhttpd
      command: /etc/init.d/uhttpd restart
```

### 场景三：磁盘空间检查与报警
每天检查 VPS 和 NAS 的磁盘空间，如果超过 90% 发送通知。

`check_disk.yml`:
```yaml
---
- name: Check Disk Space
  hosts: all
  tasks:
    - name: Get disk usage
      shell: df -h / | tail -1 | awk '{print $5}' | sed 's/%//'
      register: disk_usage

    - name: Alert if usage > 90%
      debug:
        msg: "Warning: Disk usage is high ({{ disk_usage.stdout }}%) on {{ inventory_hostname }}"
      when: disk_usage.stdout | int > 90
      # 进阶：这里可以调用 Slack/Telegram API 发送真实通知
```

## 4. 定时任务 (Crontab)

编写好剧本后，可以在 NAS 的任务计划中设置定时运行。

```bash
# 每天凌晨 4 点分发证书
0 4 * * * docker exec ansible ansible-playbook -i inventory/hosts.ini playbooks/deploy_cert.yml
```

## 5. 最佳实践

1.  **Dry Run (预运行)**：在执行破坏性操作前，使用 `--check` 参数进行模拟运行。
    `ansible-playbook setup.yml --check`
2.  **Git 管理**：将你的 playbooks 放入 Git 仓库管理，实现 Infrastructure as Code (IaC)。
3.  **Roles**：当剧本变复杂时，使用 Roles 将任务拆分为模块（如 `common`, `docker`, `security`）。
