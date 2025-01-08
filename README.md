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
编辑 `.env.local` 文件，填入你的 Notion API 密钥和数据库 ID。

4. 启动开发服务器
```bash
npm run dev
```

### Docker 部署

1. 构建镜像
```bash
docker build -t notion-nav .
```

2. 运行容器
```bash
docker run -d -p 3000:3000 \
  --env-file .env \
  --name notion-nav \
  notion-nav
```

## 环境变量

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `NOTION_TOKEN` | Notion API 密钥 | 是 |
| `NOTION_DATABASE_ID` | Notion 数据库 ID | 是 |
| `REVALIDATE_TOKEN` | 重新验证令牌 | 否 |

## 许可证

MIT
