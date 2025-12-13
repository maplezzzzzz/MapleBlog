# python-api/start.sh
#!/bin/bash

# 启动Python API服务
echo "正在启动Python API服务..."

# 检查Python是否已安装
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到Python3，请先安装Python3"
    exit 1
fi

# 检查虚拟环境是否存在，如果不存在则创建
if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
echo "安装依赖..."
pip install -r requirements.txt

# 启动API服务
echo "启动Python API服务..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
