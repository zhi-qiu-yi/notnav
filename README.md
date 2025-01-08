# Notion Nav

基于 Notion 数据库的现代化导航网站，使用 Next.js 14 + Tailwind CSS 构建。轻松管理和分享你的网站收藏。

## ✨ 特性

- 📝 使用 Notion 数据库管理网站链接
- 🔍 实时搜索功能
- 🌐 内外网链接智能切换
- 🎯 自定义分类排序
- 📱 响应式设计，支持移动端
- 🌓 自适应深色/浅色模式
- 🎨 支持 Notion 数据库封面和图标
- ⚡️ 基于 Next.js 14 App Router
- 🔄 自动同步 Notion 数据更新

## 🛠️ 技术栈

- **框架**: [Next.js 14](https://nextjs.org/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **API**: [Notion API](https://developers.notion.com/)
- **部署**: [Docker](https://www.docker.com/) + [Nginx](https://nginx.org/)
- **缓存**: Next.js Cache + [unstable_cache](https://nextjs.org/docs/app/api-reference/functions/unstable_cache)

## 📦 项目结构

```
.
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── components/        # React 组件
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页面
├── lib/                   # 工具函数
│   └── notion.ts          # Notion API 封装
├── public/               # 静态资源
├── Dockerfile            # Docker 构建文件
├── nginx.conf           # Nginx 配置
└── package.json         # 项目依赖
```

## 🚀 部署方式

### Docker 部署

```bash
# 构建镜像
docker build -t notion-nav .

# 运行容器
docker run -d \
  -p 3000:3000 \
  -e NOTION_API_KEY=your_api_key \
  -e NOTION_DATABASE_ID=your_database_id \
  -e NOTION_CONFIG_DATABASE_ID=your_config_database_id \
  notion-nav
```

### Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## ⚙️ 环境变量

### 必需配置
- `NOTION_API_KEY`: Notion API 密钥
- `NOTION_DATABASE_ID`: 导航数据库 ID
- `NOTION_CONFIG_DATABASE_ID`: 配置数据库 ID

### 可选配置
- `REVALIDATE_INTERVAL`: 缓存刷新间隔（秒），默认 3600
- `NODE_ENV`: 运行环境，生产环境设置为 'production'

## 🔧 开发指南

```bash
# 安装依赖
npm install

# 开发环境运行
npm run dev

# 构建生产版本
npm run build

# 生产环境运行
npm start
```

## 📝 Notion 数据库结构

### 导航数据库
- `title`: 网站标题
- `description`: 网站描述
- `category`: 分类
- `icon`: 网站图标
- `link`: 外网链接
- `lanlink`: 内网链接（可选）

### 配置数据库
- `type`: 配置类型 (order/url_order)
- `title`: 配置标题
- `value`: 配置值

## 🤝 贡献指南

1. Fork 本仓库
2. 创建新分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证

MIT License © 2024

## 🙏 致谢

- [Notion API](https://developers.notion.com/)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel](https://vercel.com)

---

如果这个项目对你有帮助，欢迎 Star ⭐️

## 环境变量配置

### 必需配置
- `NOTION_API_KEY`: Notion API 密钥
- `NOTION_DATABASE_ID`: 导航数据库 ID
- `NOTION_CONFIG_DATABASE_ID`: 配置数据库 ID

### 可选配置
- `REVALIDATE_INTERVAL`: 缓存刷新间隔（秒），默认 3600

## 常见问题

### API 请求超时
如果遇到 Notion API 请求超时问题：
1. 确保网络连接稳定
2. 检查 Notion API 服务状态
3. 适当增加 `REVALIDATE_INTERVAL` 值减少请求频率
4. 应用会自动重试失败的请求
