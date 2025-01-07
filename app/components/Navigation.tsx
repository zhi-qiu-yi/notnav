'use client';

import React, { useState } from 'react';
import { Link } from '@/lib/notion';
import RefreshButton from './RefreshButton';

interface NavigationProps {
  links: Link[];
  icon?: string;
  cover?: string;
}

export default function Navigation({ links, icon, cover }: NavigationProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const categories = Array.from(new Set(links.map(link => link.category)));
  
  // 搜索逻辑
  const filteredLinks = links.filter(link => {
    const searchContent = `${link.title} ${link.description} ${link.category}`.toLowerCase();
    const searchTerms = searchTerm.toLowerCase().split(' ').filter(term => term);
    
    return searchTerms.length === 0 || 
      searchTerms.every(term => searchContent.includes(term));
  });

  const groupedLinks = filteredLinks.reduce((groups, link) => {
    if (!groups[link.category]) {
      groups[link.category] = [];
    }
    groups[link.category].push(link);
    return groups;
  }, {} as Record<string, Link[]>);

  // 添加平滑滚动处理函数
  const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, category: string) => {
    e.preventDefault();
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    
    const element = document.getElementById(category);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="flex bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* 侧边栏背景遮罩 */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 lg:hidden z-30 backdrop-blur-sm" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* 侧边栏 */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-40 h-screen
        transition-transform duration-300 ease-in-out
        w-64 lg:translate-x-0 bg-white dark:bg-gray-800
        shadow-lg
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo区域 */}
          <div className="h-16 flex items-center px-6">
            <a 
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              {icon && (
                <img 
                  src={icon} 
                  alt="Logo" 
                  className="w-8 h-8 rounded-lg"
                />
              )}
              <h1 className="text-lg font-bold text-gray-800 dark:text-white">
                导航站
              </h1>
            </a>
          </div>

          {/* 分类导航 */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-0.5">
              {categories.map(category => (
                <li key={category}>
                  <a
                    href={`#${category}`}
                    onClick={(e) => handleCategoryClick(e, category)}
                    className="flex items-center px-6 py-3
                             text-gray-600 dark:text-gray-300 
                             hover:bg-gray-100 dark:hover:bg-gray-700
                             group transition-colors"
                  >
                    <span className="flex-1 text-sm font-medium">{category}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full 
                                   bg-gray-100 dark:bg-gray-700
                                   text-gray-600 dark:text-gray-400">
                      {links.filter(link => link.category === category).length}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 min-w-0">
        {/* 搜索栏 */}
        <div className="sticky top-0 z-10 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-md py-4">
          <div className="max-w-5xl mx-auto px-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索导航..."
                className="w-full h-12 pl-12 pr-4 rounded-lg
                         bg-white dark:bg-gray-800
                         border border-gray-200 dark:border-gray-700
                         focus:ring-2 focus:ring-blue-500
                         text-gray-900 dark:text-white
                         placeholder-gray-400 dark:placeholder-gray-500"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* 链接卡片区域 */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {Object.entries(groupedLinks).map(([category, links]) => (
            <section 
              key={category} 
              id={category} 
              className="mb-12 scroll-mt-24"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <span className="w-1 h-6 bg-blue-500 rounded-full mr-3"></span>
                {category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {links.map(link => (
                  <a
                    key={link.id}
                    href={link.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white dark:bg-gray-800 rounded-lg p-4
                             border border-gray-200 dark:border-gray-700
                             hover:shadow-lg hover:-translate-y-0.5
                             transition-all duration-300"
                  >
                    <div className="flex items-center">
                      {link.icon ? (
                        <img 
                          src={link.icon} 
                          alt=""
                          className="w-10 h-10 rounded-lg" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700
                                      flex items-center justify-center">
                          <span className="text-xl font-bold text-gray-400 dark:text-gray-500">
                            {link.title[0]}
                          </span>
                        </div>
                      )}
                      <div className="ml-3 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {link.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                          {link.description}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* 刷新按钮 */}
      <RefreshButton />
    </div>
  );
} 