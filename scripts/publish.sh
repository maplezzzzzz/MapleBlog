#!/bin/bash

# 配置
# 公开仓库的本地路径（相对于当前项目根目录）
PUBLIC_REPO_DIR="deploy"
# 公开仓库的远程 Git 地址（你需要修改这里）
# PUBLIC_GIT_URL="git@github.com:yourusername/MapleBlog-Public.git"

echo "🚀 开始发布流程..."

# 1. 检查并初始化部署目录
if [ ! -d "$PUBLIC_REPO_DIR" ]; then
    echo "📂 创建部署目录..."
    mkdir -p "$PUBLIC_REPO_DIR"
    # 如果有远程地址，这里应该是 git clone
    # git clone "$PUBLIC_GIT_URL" "$PUBLIC_REPO_DIR"
    
    # 模拟初始化（如果你还没填 URL）
    cd "$PUBLIC_REPO_DIR"
    git init
    git checkout -b main
    cd ..
fi

# 2. 同步文件（使用 rsync 确保精确同步，排除敏感文件）
# --delete: 删除目标目录中多余的文件（保持完全一致）
# --exclude: 排除私有后台、API、Python代码、Git目录等

echo "🔄 同步文件..."

rsync -av --delete \
    --exclude '.git' \
    --exclude '.gitignore' \
    --exclude '.env*' \
    --exclude 'node_modules' \
    --exclude 'dist' \
    --exclude 'deploy' \
    --exclude 'scripts' \
    --exclude 'temp_files' \
    --exclude 'python-api' \
    --exclude 'public/admin' \
    --exclude 'src/pages/admin' \
    --exclude 'src/pages/api' \
    --exclude 'src/middleware.ts' \
    --exclude 'enhanced-admin-api-server.cjs' \
    --exclude 'python-integration.cjs' \
    --exclude 'README.md' \
    ./ "$PUBLIC_REPO_DIR/"

# 3. 特殊处理：注入静态构建环境变量
# 我们不再直接修改 astro.config.mjs，而是通过修改 package.json 中的 build 命令
# 来注入 BUILD_MODE=static 环境变量。astro.config.mjs 会读取此变量并自动切换配置。

echo "⚙️ 调整构建命令为静态模式..."

PACKAGE_JSON="$PUBLIC_REPO_DIR/package.json"

# 在 build 命令前添加 BUILD_MODE=static
# 匹配 "build": "NODE_OPTIONS=... astro build" 并插入变量
sed -i '' 's/"build": "/"build": "BUILD_MODE=static /' "$PACKAGE_JSON"

# 4. 提交并推送
echo "⬆️ 提交并推送..."
cd "$PUBLIC_REPO_DIR"

# 配置 Git 用户（如果是 CI 环境）
# git config user.name "Deploy Bot"
# git config user.email "deploy@bot.com"

git add .
git commit -m "Site Update: $(date '+%Y-%m-%d %H:%M:%S')"

# 检查是否有关联远程仓库
if git remote | grep -q 'origin'; then
    git push origin main
    echo "✅ 发布成功！"
else
    echo "⚠️ 警告：部署目录没有关联远程仓库。"
    echo "请进入 $PUBLIC_REPO_DIR 目录并执行: git remote add origin <你的公开仓库URL>"
fi

echo "🎉 完成！"
