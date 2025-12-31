# Node.js Admin Panel Dockerfile
FROM node:18-alpine

WORKDIR /app

# 安装构建依赖 (为了能够编译某些 npm 包)
RUN apk add --no-cache python3 make g++

# 复制依赖文件
COPY package.json package-lock.json ./

# 安装依赖
RUN npm install

# 复制其余源代码
COPY . .

# 暴露端口
EXPOSE 8080

# 启动命令
CMD ["npm", "run", "admin"]