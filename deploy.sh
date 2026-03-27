#!/bin/bash
set -o nounset
set -o errexit
set -o pipefail


# 配置部分
REMOTE_SERVERS=("88")  # 可扩展的服务器列表
BASE_IP="10.0.11"
REMOTE_DIR="/docker-apps/nginxwebui_data/dist"
TEMP_DIR_PREFIX="/tmp/fa_deploy_$$"  # 使用PID保证唯一性
SSH_OPTS="-o ConnectTimeout=10 -o StrictHostKeyChecking=no"

# 蓝绿部署函数
deploy() {
    local server="$1"
    local ip="${BASE_IP}.${server}"
    local temp_dir="${TEMP_DIR_PREFIX}_${server}"

    echo "🚀 开始部署服务器 ${ip}"

    # 1. 创建临时目录
    ssh ${SSH_OPTS} root@${ip} "mkdir -p ${temp_dir}" || {
        echo "❌ 无法在 ${ip} 创建临时目录"
        return 1
    }

    # 2. 安全传输文件
    scp ${SSH_OPTS} -r ./dist/* root@${ip}:${temp_dir}/ || {
        echo "❌ 传输文件到 ${ip} 失败"
        ssh ${SSH_OPTS} root@${ip} "rm -rf ${temp_dir}"
        return 1
    }

    # 3. 原子切换目录
    ssh ${SSH_OPTS} root@${ip} <<-EOF
        # 验证新文件完整性
        if [[ ! -f "${temp_dir}/index.html" ]]; then
            echo "⚠️ 新版本验证失败" >&2
            rm -rf "${temp_dir}"
            exit 1
        fi

        # 切换目录（原子操作）
        rm -rf "${REMOTE_DIR}.old" && \
        if [[ -d "${REMOTE_DIR}" ]]; then
            mv "${REMOTE_DIR}" "${REMOTE_DIR}.old";
        fi && \
        mv "${temp_dir}" "${REMOTE_DIR}" && \
        echo "✅ 切换成功"

        # 清理旧版本（后台执行不影响主流程）
        nohup bash -c 'sleep 300; rm -rf "${REMOTE_DIR}.old"' &>/dev/null &
EOF

    # 4. 重启服务
    # ssh ${SSH_OPTS} root@${ip} "systemctl reload nginx" || {
    #     echo "⚠️ Nginx reload失败，尝试完整重启"
    #     ssh ${SSH_OPTS} root@${ip} "systemctl restart nginx"
    # }
}

# 构建检查
if [[ "$#" == 0 || "$1" != "-k" ]]; then
    echo "🔨 正在构建前端..."
    npm run build || {
        echo "❌ 构建失败"
        exit 1
    }
fi

# 并行部署（使用GNU parallel加速）
export -f deploy
export BASE_IP REMOTE_DIR TEMP_DIR_PREFIX SSH_OPTS

if command -v parallel &>/dev/null; then
    printf "%s\n" "${REMOTE_SERVERS[@]}" | parallel -j 4 deploy {}
else
    # 顺序部署备选方案
    for server in "${REMOTE_SERVERS[@]}"; do
        deploy "${server}"
    done
fi

echo "🎉 所有服务器部署完成"
