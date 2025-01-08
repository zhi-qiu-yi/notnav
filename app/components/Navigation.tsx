'use client';

import React, { useState, useEffect } from 'react';
import { Link } from '@/lib/notion';

interface NavigationProps {
  links: Link[];
  icon?: string;
  cover?: string;
  title: string;
}

// 添加视图类型
type ViewMode = 'grid' | 'compact' | 'list';

export default function Navigation({ links, icon, cover, title }: NavigationProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLanMode, setIsLanMode] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    setIsClient(true);
    const savedMode = localStorage.getItem('isLanMode');
    if (savedMode !== null) {
      setIsLanMode(savedMode === 'true');
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('isLanMode', isLanMode.toString());
    }
  }, [isLanMode, isClient]);

  // 获取实际链接
  const getActualLink = (link: Link) => {
    if (isLanMode && link.lanlink) {
      return link.lanlink;
    }
    return link.link;
  };

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

  // 添加更新处理函数
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/revalidate');
      const data = await res.json();
      if (data.revalidated) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 保存视图模式
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('viewMode', viewMode);
    }
  }, [viewMode, isClient]);

  // 视图切换按钮
  const ViewModeButton = () => (
    <button
      onClick={() => {
        setViewMode(current => {
          switch (current) {
            case 'grid': return 'compact';
            case 'compact': return 'list';
            default: return 'grid';
          }
        });
      }}
      title={`切换到${viewMode === 'grid' ? '紧凑' : viewMode === 'compact' ? '列表' : '网格'}视图`}
      className="flex items-center justify-center w-8 h-8
               rounded-lg
               bg-gray-100 dark:bg-gray-700
               text-gray-600 dark:text-gray-300
               hover:bg-gray-200 dark:hover:bg-gray-600
               transition-colors"
    >
      <svg
        className={`w-4 h-4 ${
          viewMode === 'grid' 
            ? 'text-blue-500' 
            : viewMode === 'compact'
              ? 'text-green-500'
              : 'text-gray-400'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {viewMode === 'grid' ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        ) : viewMode === 'compact' ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 5h16M4 8h16M4 11h16M4 14h16M4 17h16M4 20h16"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        )}
      </svg>
    </button>
  );

  // 链接卡片区域的布局
  const getLayoutClasses = () => {
    if (!isMounted) {
      return 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4';
    }

    const baseClasses = 'transition-[grid-template-columns,gap] duration-300 ease-in-out';
    switch (viewMode) {
      case 'grid':
        return `${baseClasses} grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4`;
      case 'compact':
        return `${baseClasses} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2`;
      case 'list':
        return `${baseClasses} grid grid-cols-2 gap-1`;
    }
  };

  // 链接项的样式
  const getLinkClasses = () => {
    const baseClasses = `
      group transition-all duration-300 ease-in-out
      transform motion-reduce:transition-none
    `;
    switch (viewMode) {
      case 'grid':
        return `${baseClasses} bg-white dark:bg-gray-800 rounded-lg p-3
                border border-gray-200 dark:border-gray-700
                hover:border-blue-500/50 dark:hover:border-blue-500/50
                hover:shadow-lg hover:shadow-blue-500/10
                hover:-translate-y-0.5
                flex flex-col items-center
                scale-100 opacity-100`;
      case 'compact':
        return `${baseClasses} bg-white dark:bg-gray-800 rounded-lg p-3
                border border-gray-200 dark:border-gray-700
                hover:border-blue-500/50 dark:hover:border-blue-500/50
                hover:shadow-md
                flex items-center
                scale-100 opacity-100`;
      case 'list':
        return `${baseClasses} py-2.5 px-2.5 flex items-center rounded-md
                hover:bg-gray-50 dark:hover:bg-gray-800/50
                scale-100 opacity-100`;
    }
  };

  // 添加性能优化
  const MemoizedLink = React.memo(({ link, viewMode, getActualLink }: {
    link: Link;
    viewMode: ViewMode;
    getActualLink: (link: Link) => string;
  }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    if (!isMounted) {
      return null;
    }

    return (
      <a
        key={link.id}
        href={getActualLink(link)}
        target="_blank"
        rel="noopener noreferrer"
        className={getLinkClasses()}
      >
        {viewMode === 'grid' ? (
          <>
            {/* 网格视图的图标 */}
            {link.icon ? (
              <img 
                src={link.icon} 
                alt=""
                className="w-12 h-12 rounded-lg shadow-sm
                         group-hover:shadow group-hover:scale-105
                         transition-all duration-300"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg
                           bg-gradient-to-br from-gray-100 to-gray-50
                           dark:from-gray-700 dark:to-gray-600
                           group-hover:from-blue-50 group-hover:to-blue-100
                           dark:group-hover:from-blue-900/50 dark:group-hover:to-blue-800/50
                           flex items-center justify-center
                           shadow-sm group-hover:shadow group-hover:scale-105
                           transition-all duration-300">
                <span className="text-xl font-bold 
                              text-gray-400 dark:text-gray-500
                              group-hover:text-blue-500 dark:group-hover:text-blue-400">
                  {link.title[0]}
                </span>
              </div>
            )}
            {/* 网格视图的文字 */}
            <div className="mt-3 text-center w-full">
              <h3 className="font-medium text-gray-900 dark:text-white
                           group-hover:text-blue-500 dark:group-hover:text-blue-400
                           text-sm truncate">
                {link.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate
                         group-hover:text-blue-500/70 dark:group-hover:text-blue-400/70">
                {link.description}
              </p>
            </div>
          </>
        ) : viewMode === 'compact' ? (
          <div className="flex items-center w-full">
            {link.icon ? (
              <img 
                src={link.icon} 
                alt=""
                className="w-10 h-10 rounded-lg shrink-0
                         shadow-sm group-hover:shadow group-hover:scale-105
                         transition-all duration-300"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg shrink-0
                           bg-gradient-to-br from-gray-100 to-gray-50
                           dark:from-gray-700 dark:to-gray-600
                           group-hover:from-blue-50 group-hover:to-blue-100
                           dark:group-hover:from-blue-900/50 dark:group-hover:to-blue-800/50
                           flex items-center justify-center
                           shadow-sm group-hover:shadow group-hover:scale-105
                           transition-all duration-300">
                <span className="text-lg font-bold 
                              text-gray-400 dark:text-gray-500
                              group-hover:text-blue-500 dark:group-hover:text-blue-400">
                  {link.title[0]}
                </span>
              </div>
            )}
            <div className="ml-4 min-w-0 flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white truncate
                           group-hover:text-blue-500 dark:group-hover:text-blue-400">
                {link.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate
                         group-hover:text-blue-500/70 dark:group-hover:text-blue-400/70">
                {link.description}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center w-full">
            <div className="flex items-center">
              {/* 图标部分 */}
              {link.icon ? (
                <img 
                  src={link.icon} 
                  alt=""
                  className="w-6 h-6 rounded shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-700
                             flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {link.title[0]}
                  </span>
                </div>
              )}

              {/* 文字部分 */}
              <div className={`
                min-w-0 ml-3 flex-1
              `}>
                <h3 className={`
                  font-medium text-gray-900 dark:text-white
                  group-hover:text-blue-500 dark:group-hover:text-blue-400
                  text-sm truncate`
                }>
                  {link.title}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">
                  {link.description}
                </span>
              </div>
            </div>
          </div>
        )}
      </a>
    );
  });

  // 添加客户端检测
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="flex bg-[#f7f7f7] dark:bg-gray-900 min-h-screen">
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
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-3 hover:opacity-80 transition-all group"
            >
              {icon ? (
                <img 
                  src={icon} 
                  alt="Logo" 
                  className={`w-8 h-8 rounded-lg ${isRefreshing ? 'animate-spin' : ''}`}
                />
              ) : (
                <svg
                  className={`w-8 h-8 text-gray-600 dark:text-gray-300 ${isRefreshing ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
              <h1 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-blue-500">
                {title}
              </h1>
            </button>
          </div>

          {/* 搜索栏 */}
          <div className="px-4 pb-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索导航..."
                className="w-full h-10 pl-10 pr-4 rounded-lg
                         bg-gray-50 dark:bg-gray-700/50
                         border border-gray-200 dark:border-gray-600
                         focus:ring-2 focus:ring-blue-500
                         text-gray-900 dark:text-white
                         placeholder-gray-400 dark:placeholder-gray-500
                         text-sm"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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

          {/* 分类导航 */}
          <nav className="flex-1 overflow-y-auto">
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

          {/* 底部按钮 */}
          {isClient && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-center gap-4">
              {/* 内外网切换按钮 */}
              <button
                onClick={() => setIsLanMode(!isLanMode)}
                title={isLanMode ? '内网模式' : '外网模式'}
                className="flex items-center justify-center w-8 h-8
                         rounded-lg
                         bg-gray-100 dark:bg-gray-700
                         text-gray-600 dark:text-gray-300
                         hover:bg-gray-200 dark:hover:bg-gray-600
                         transition-colors"
              >
                <svg
                  className={`w-4 h-4 ${isLanMode ? 'text-green-500' : 'text-gray-400'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isLanMode 
                      ? "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                      : "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"}
                  />
                </svg>
              </button>

              {/* 视图切换按钮 */}
              <ViewModeButton />
            </div>
          )}
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 min-w-0">
        {/* 移动端分类切换按钮 */}
        <div className="lg:hidden sticky top-0 z-10 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-2">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-2 text-sm font-medium
                       text-gray-600 dark:text-gray-300
                       hover:text-blue-500 dark:hover:text-blue-400"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <span>分类导航</span>
            </button>
            
            {/* 显示当前分类数量 */}
            <span className="text-xs px-2 py-0.5 rounded-full 
                          bg-gray-200 dark:bg-gray-700
                          text-gray-600 dark:text-gray-400">
              {categories.length} 个分类
            </span>
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
              <div className={getLayoutClasses()}>
                {links.map(link => (
                  <MemoizedLink
                    key={link.id}
                    link={link}
                    viewMode={viewMode}
                    getActualLink={getActualLink}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
} 