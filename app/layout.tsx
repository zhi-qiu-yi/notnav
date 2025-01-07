import './globals.css'
import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import React from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Notion 导航站',
  description: '基于 Notion 数据库的现代化导航网站',
  keywords: 'Notion, 导航, 网址导航, 收藏夹',
  authors: [{ name: 'Your Name' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" className="dark">
      <body className={`${inter.className} dark:bg-gray-900`}>{children}</body>
    </html>
  )
} 