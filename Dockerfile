# 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 首先只复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制其他文件
COPY . .

# 构建应用
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 生产阶段
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY --from=builder /app/package*.json ./

# 仅安装生产依赖
RUN npm ci --only=production

# 复制构建产物
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]