#!/bin/bash

# 定义日志文件
PY_LOG="python_api.log"
ADMIN_LOG="admin_api.log"

# 清理函数
cleanup() {
    kill $PYTHON_PID 2>/dev/null
    kill $ADMIN_PID 2>/dev/null
    exit
}
trap cleanup SIGINT SIGTERM

# 1. 静默启动 Python API
cd python-api
if [ ! -d "venv" ]; then python3 -m venv venv > /dev/null 2>&1; fi
source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
python main.py > ../$PY_LOG 2>&1 &
PYTHON_PID=$!
cd ..

# 2. 静默启动 Admin API
node enhanced-admin-api-server.cjs > $ADMIN_LOG 2>&1 &
ADMIN_PID=$!

# 等待一秒确保端口开始监听
sleep 1

# 3. 输出访问地址信息
echo "----------------------------------------------------"
echo "✅ 服务已启动"
echo "----------------------------------------------------"
echo "🏠 前端首页:   http://localhost:4321"
echo "⚙️  后台管理:   http://localhost:4321/admin"
echo "🧠 Python API: http://localhost:8000"
echo "📁 资源服务:   http://localhost:8080"
echo "----------------------------------------------------"
echo "⚠️  (按 Ctrl+C 退出所有服务)"
echo "----------------------------------------------------"

# 4. 启动 Astro (保留标准输出以便查看编译错误)
npm run dev