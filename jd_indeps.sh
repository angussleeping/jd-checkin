#!/usr/bin/env bash
# 依赖安装脚本（建议每周执行一次，或在拉库/换机后手动执行一次）
# 0 4 * * 1 jd_indeps.sh
# new Env('依赖安装');
# updatedate:20261123

set -euo pipefail

# 动态获取青龙根目录
if [ -d "/ql/data" ]; then
    dir_root="/ql/data"
else
    dir_root="/ql"
fi

dir_repo="$dir_root/repo"
dir_deps="$dir_root/deps"

# 自动配置 sendNotify.js（AUTOCFG=true 时，从本仓库目录复制到 deps）
if [[ "${AUTOCFG:-}" == 'true' ]]; then
    if [[ -f "$dir_repo/$(basename "$(pwd)")/sendNotify.js" ]]; then
        src_notify="$dir_repo/$(basename "$(pwd)")/sendNotify.js"
    else
        src_notify=$(find "$dir_repo" -maxdepth 2 -name sendNotify.js 2>/dev/null | head -n 1)
    fi
    if [[ -n "$src_notify" && -f "$src_notify" ]]; then
        cp "$src_notify" "$dir_deps/"
        echo -e "\n已配置 sendNotify.js 到 deps 目录（来源：$src_notify）\n"
    else
        echo -e "\n错误：未找到 sendNotify.js，请先拉库后再执行本脚本！\n"
        exit 1
    fi
else
    echo -e "\n提示：如需自动配置 sendNotify.js，请设置变量 AUTOCFG='true'\n"
fi

# 检查 pnpm
if ! command -v pnpm >/dev/null 2>&1; then
    echo "未检测到 pnpm，请先在面板中安装 Node.js 环境（青龙自带 pnpm）"
    exit 1
fi

# 检查权限
if [ "$EUID" -ne 0 ]; then
    SUDO="sudo"
else
    SUDO=""
fi

# 配置 pnpm 镜像
pnpm config set registry https://registry.npmmirror.com

# 处理 pnpm v7+ 环境变量
npm_ver=$(pnpm -v | awk -F. '{print $1}')
if [[ $npm_ver -ge 7 ]]; then
    export PNPM_HOME="/root/.local/share/pnpm"
    export PATH="$PNPM_HOME:$PATH"
fi

echo -e "\n开始检查依赖列表并安装依赖...\n"

# 目标依赖列表（got 固定 11.x：12+ 为纯 ESM，脚本里的 require('got') 会直接失败）
declare -A target_deps=(
    ["tough-cookie"]="4.1.4"
    ["ds"]="2.0.2"
    ["png-js"]="1.0.0"
    ["date-fns"]="3.6.0"
    ["axios"]="1.7.4"
    ["crypto-js"]="4.2.0"
    ["request"]="2.88.2"
    ["jsdom"]="24.1.1"
    ["moment"]="2.30.1"
    ["cheerio"]="1.0.0"
    ["tunnel"]="0.0.6"
    ["https-proxy-agent"]="7.0.5"
    ["sharp"]="0.33.5"
    ["qs"]="6.11.0"
    ["big-integer"]="1.6.52"
    ["got"]="11.8.6"
    ["dotenv"]="16.4.5"
)

# 获取已安装的全局依赖（用 JSON 输出解析，避免 --parseable 把路径当包名的旧问题）
installed_deps=$(pnpm list -g --depth=0 --json 2>/dev/null | node -e "
let s = '';
process.stdin.on('data', d => s += d).on('end', () => {
    try {
        const list = JSON.parse(s);
        const rows = Array.isArray(list) ? list : [list];
        for (const item of rows) {
            for (const [name, info] of Object.entries(item.dependencies || {})) {
                console.log(name + ' ' + (info.version || ''));
            }
        }
    } catch (e) {}
});
" || true)

# 先收集需要安装/更新的依赖，再一次性批量安装（比逐个装快得多）
to_install=()
for dep in "${!target_deps[@]}"; do
    target_version="${target_deps[$dep]}"
    installed_version=$(echo "$installed_deps" | awk -v dep="$dep" '$1 == dep {print $2; exit}')

    if [[ -z "$installed_version" ]]; then
        echo "待安装 $dep@$target_version"
        to_install+=("$dep@$target_version")
    elif [[ "$target_version" == "latest" ]]; then
        echo "$dep@$installed_version 已安装，跳过 latest。"
    elif [[ "$installed_version" != "$target_version" ]]; then
        echo "待更新 $dep ($installed_version -> $target_version)"
        to_install+=("$dep@$target_version")
    else
        echo "$dep@$installed_version 已是最新版本，跳过安装。"
    fi
done

if [[ ${#to_install[@]} -gt 0 ]]; then
    echo -e "\n开始批量安装/更新依赖...\n"
    pnpm i -g "${to_install[@]}" || { echo "批量安装失败！"; exit 1; }
else
    echo -e "\n所有依赖均已是最新，无需安装。\n"
fi

# 安装 Python 依赖（失败不影响 Node 任务，不中断脚本）
if command -v pip3 >/dev/null 2>&1; then
    pip3 install -i https://pypi.tuna.tsinghua.edu.cn/simple --upgrade jieba requests \
        || echo "Python 依赖安装失败，已跳过（不影响京东任务）"
else
    echo "未检测到 pip3，跳过 Python 依赖。"
fi

# 清理 canvas 冲突文件（glob 需先展开再逐个判断）
shopt -s nullglob
canvas_paths=(
    /usr/local/pnpm-global/5/node_modules/.pnpm/canvas*
    /root/.local/share/pnpm/global/5/.pnpm/canvas*
)

for path in ${canvas_paths[@]+"${canvas_paths[@]}"}; do
    rm -rf "$path"
done
shopt -u nullglob

echo -e "\n依赖检查与安装完成！请检查是否有报错。\n"
