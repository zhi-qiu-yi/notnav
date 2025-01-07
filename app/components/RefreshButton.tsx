'use client';

import { useState } from 'react';

export default function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  return (
    <button
      onClick={handleRefresh}
      className="fixed bottom-4 left-4 p-2 rounded-lg 
                 bg-white/90 hover:bg-white
                 dark:bg-blue-500/90 dark:hover:bg-blue-500 
                 text-gray-600 dark:text-white
                 backdrop-blur-sm shadow-sm hover:shadow
                 transition-all transform hover:scale-105 z-50"
      title="刷新内容"
      disabled={isRefreshing}
    >
      <svg
        className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
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
    </button>
  );
} 