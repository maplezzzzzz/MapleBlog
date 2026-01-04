#!/bin/bash
# 自动提交脚本

# 检查是否有修改的文件
if [[ -n $(git status --porcelain) ]]; then
    echo "检测到文件更改，正在自动提交..."

    # 添加所有更改的文件
    git add -A

    # 创建提交消息，包含当前时间和修改的文件列表
    COMMIT_MSG="Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"
    
    # 获取修改的文件列表并添加到提交消息中
    CHANGED_FILES=$(git status --porcelain | awk '{print $2}' | tr '\n' ' ')
    if [[ -n "$CHANGED_FILES" ]]; then
        COMMIT_MSG="$COMMIT_MSG - Modified files: $CHANGED_FILES"
    fi

    # 执行提交
    git commit -m "$COMMIT_MSG"

    echo "提交完成: $COMMIT_MSG"
else
    echo "没有检测到文件更改，无需提交。"
fi