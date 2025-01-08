import './globals.css'
import { Metadata } from 'next'
import React from 'react'
import { getDatabaseInfo } from '@/lib/notion'

// 生成动态元数据
export async function generateMetadata(): Promise<Metadata> {
  const dbInfo = await getDatabaseInfo();
  
  return {
    title: dbInfo.title,
    description: `基于 Notion 数据库的现代化导航网站 - ${dbInfo.title}`,
    keywords: 'Notion, 导航, 网址导航, 收藏夹',
    authors: [{ name: 'Your Name' }],
    robots: 'index, follow',
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.json',
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" className="dark">
      <body className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-gray-900 font-sans">
        {children}
      </body>
    </html>
  )
} 