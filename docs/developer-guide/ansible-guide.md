# 自动化运维 (Ansible) 入门

当你拥有 3 台以上的设备（NAS、软路由、VPS、树莓派）时，手动 SSH 进去敲命令就是浪费生命。**Ansible** 让你能在一台机器上控制所有设备。

## 1. 什么是 Ansible？

*   **无 Agent**：不需要在被控端安装任何软件，只要有 SSH 就行。
*   **幂等性**：同一个剧本执行 1 次和执行 100 次，结果是一样的（不会因为重复执行而报错）。

## 2. 安装 Ansible (控制端)

在 NAS 上使用 Docker 安装 Ansible。

```bash
docker run -itd --name ansible \
  -v /volume1/docker/ansible:/ansible \
  willhallonline/ansible:latest
```

或者直接在你的 Mac/Linux 电脑上安装：`brew install ansible`。

## 3. 配置清单 (Inventory)

创建一个 `hosts.ini` 文件，列出你所有的设备：

```ini
[nas]
192.168.1.10 ansible_user=admin ansible_ssh_pass=secret

[router]
192.168.1.1 ansible_user=root ansible_ssh_pass=password

[vps]
47.x.x.x ansible_user=root ansible_ssh_private_key_file=~/.ssh/id_rsa
```

## 4. 编写剧本 (Playbook)

创建一个 `update.yml`，一键更新所有设备的软件包。

```yaml
---
- name: Update all servers
  hosts: all
  tasks:
    - name: Update apt cache (Ubuntu/Debian)
      apt:
        update_cache: yes
        upgrade: dist
      when: ansible_os_family == "Debian"

    - name: Update opkg (OpenWrt)
      command: opkg update && opkg upgrade
      when: ansible_os_family == "OpenWrt"
```

## 5. 执行剧本

```bash
ansible-playbook -i hosts.ini update.yml
```

## 6. 实战案例：批量部署 Docker 容器

想在所有节点上部署 Node Exporter？

```yaml
- name: Deploy Node Exporter
  hosts: all
  tasks:
    - name: Run Node Exporter container
      docker_container:
        name: node-exporter
        image: prom/node-exporter:latest
        state: started
        restart_policy: unless-stopped
        ports:
          - "9100:9100"
```

## 7. 备份配置

使用 Ansible 自动把路由器的配置文件、NAS 的 Docker Compose 文件拉取到本地备份。

```yaml
- name: Backup configs
  hosts: nas
  tasks:
    - name: Fetch docker-compose.yml
      fetch:
        src: /volume1/docker/homepage/docker-compose.yml
        dest: ./backups/{{ inventory_hostname }}/
        flat: yes
```
