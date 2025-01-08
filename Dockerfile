# 使用 Node.js 官方轻量级镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制所有源代码和配置文件
COPY . .

# 确保环境变量在构建时可用
ARG NOTION_TOKEN
ARG NOTION_DATABASE_ID
ARG NOTION_CONFIG_DATABASE_ID
ENV NOTION_TOKEN=${NOTION_TOKEN}
ENV NOTION_DATABASE_ID=${NOTION_DATABASE_ID}
ENV NOTION_CONFIG_DATABASE_ID=${NOTION_CONFIG_DATABASE_ID}
ENV NODE_NO_WARNINGS=1

# 构建应用
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]