# 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 设置构建时环境变量
ARG NOTION_TOKEN
ARG NOTION_DATABASE_ID
ARG NOTION_CONFIG_DATABASE_ID

# 构建应用
RUN --mount=type=secret,id=notion_token \
    --mount=type=secret,id=notion_database_id \
    --mount=type=secret,id=notion_config_database_id \
    NOTION_TOKEN=$(cat /run/secrets/notion_token) \
    NOTION_DATABASE_ID=$(cat /run/secrets/notion_database_id) \
    NOTION_CONFIG_DATABASE_ID=$(cat /run/secrets/notion_config_database_id) \
    npm run build

# 生产阶段
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制构建产物和必要文件
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# 设置运行时环境变量
ENV NODE_ENV=production
ENV NODE_NO_WARNINGS=1

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]