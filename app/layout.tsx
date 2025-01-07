import './globals.css'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Notion 导航站',
  description: '基于 Notion 数据库的现代化导航网站',
  keywords: 'Notion, 导航, 网址导航, 收藏夹',
  authors: [{ name: 'Your Name' }],
  robots: 'index, follow',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
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
      <body className="dark:bg-gray-900 font-sans">
        {children}
      </body>
    </html>
  )
} 