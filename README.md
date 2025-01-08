# Notion Nav

一个基于 Next.js 和 Notion API 构建的导航网站。

## 功能特性

- 🚀 基于 Next.js 14 构建
- 📱 响应式设计，支持移动端
- 🌓 自动深色模式
- 🔍 实时搜索
- 📂 分类导航
- 🔄 支持内外网链接切换
- 📊 多种视图模式（网格/紧凑/列表）

## 快速开始

### 环境要求

- Node.js >= 18.17.0
- npm >= 9.x
- Docker (可选)

### 本地开发

1. 克隆项目
```bash
git clone https://github.com/yourusername/notion-nav.git
cd notion-nav
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env.local
```
编辑 `.env.local` 文件，填入你的 Notion API 配置。

4. 启动开发服务器
```bash
npm run dev
```

### Docker 部署

#### 使用预构建镜像

1. 创建 `docker-compose.yml`：
```yaml
version: '3.8'

services:
  app:
    image: twoice/notion-nav:latest
    container_name: notion-nav
    restart: always
    environment:
      - NODE_ENV=production
      - NOTION_TOKEN=${NOTION_API_KEY}
      - NOTION_DATABASE_ID=${NOTION_DATABASE_ID}
      - NOTION_CONFIG_DATABASE_ID=${NOTION_CONFIG_DATABASE_ID}
      - REVALIDATE_INTERVAL=3600
    ports:
      - "10212:3000"
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
```

2. 创建环境配置文件：
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置文件，填入你的 Notion API 配置
vim .env
```

3. 启动服务：
```bash
docker-compose up -d
```

服务启动后可以通过 `http://localhost:10212` 访问。

## 环境变量配置

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `NOTION_TOKEN` | Notion API 密钥 | 是 |
| `NOTION_DATABASE_ID` | 导航数据库 ID | 是 |
| `NOTION_CONFIG_DATABASE_ID` | 配置数据库 ID | 是 |
| `NODE_ENV` | 运行环境 | 否 |

## Notion 数据库配置

### 导航数据库
- `title`: 网站标题（文本）
- `description`: 网站描述（富文本）
- `category`: 分类（选择）
- `icon`: 网站图标（文件）
- `link`: 外网链接（URL）
- `lanlink`: 内网链接（URL，可选）

### 配置数据库
- `type`: 配置类型（选择，值为 "order"）
- `title`: 分类名称（文本）
- `value`: 排序值（数字）

## 许可证

MIT

## 相关链接

- [Notion API 文档](https://developers.notion.com/)
- [Next.js 文档](https://nextjs.org/docs)
