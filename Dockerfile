# 使用 Node.js 18 作为基础镜像
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件
COPY . .

# 创建 public 目录（如果不存在）
RUN mkdir -p public

# 类型检查
RUN npm run lint

# 构建应用
RUN npm run build

# 生产环境
FROM node:18-alpine AS runner
WORKDIR /app

# 创建 public 目录
RUN mkdir -p public

# 复制构建产物和必要文件
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# 只安装生产依赖
RUN npm install --production

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]