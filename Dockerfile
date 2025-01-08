# 依赖阶段
FROM node:18-alpine AS deps
WORKDIR /app

# 只复制依赖相关文件
COPY package.json package-lock.json ./

# 安装所有依赖（包括 devDependencies）
RUN npm ci

# 构建阶段
FROM node:18-alpine AS builder
WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建应用
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_SHARP_PATH=/app/node_modules/sharp

RUN npm run build

# 生产阶段 - 使用更小的基础镜像
FROM node:18-alpine AS runner
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 复制必要文件
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 设置正确的权限
RUN chown -R nextjs:nodejs /app

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "server.js"]