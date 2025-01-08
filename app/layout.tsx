import './globals.css'
import { Metadata } from 'next'
import React from 'react'
import { getDatabaseInfo } from '@/src/lib/notion'

// 生成动态元数据
export async function generateMetadata(): Promise<Metadata> {
  const dbInfo = await getDatabaseInfo();
  
  return {
    title: dbInfo.title,
    description: 'A navigation website built with Next.js and Notion API',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
} 