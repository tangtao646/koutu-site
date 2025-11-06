// app/page.tsx
'use client'; // 👈 **注意：为了管理客户端状态和重置，page.tsx 必须改为客户端组件**

import { useState, useCallback } from 'react';
import Navbar from './ui/navbar'; 
import KoutuPortal from './ui/koutu-portal'; 

export default function HomePage() {
  const primaryColor = 'text-blue-600';
  // 使用 key 来强制重置 KoutuPortal 组件及其内部所有状态 (包括 localStorage 读取)
  const [portalKey, setPortalKey] = useState(0); 

  const handleHomeReset = useCallback(() => {
    // 1. 清除 localStorage 缓存
    localStorage.removeItem('koutu_images');
    
    // 2. 增加 key 的值，Next.js/React 会销毁旧的 KoutuPortal 实例，并创建一个新的，从而重置其所有内部状态。
    setPortalKey(prevKey => prevKey + 1);
    
    // 3. 确保导航到根路径 (如果当前不在根路径)
    if (window.location.pathname !== '/') {
        window.location.href = '/';
    }

  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onHomeClick={handleHomeReset} /> {/* 传递重置函数 */}
      
      <main className="max-w-5xl mx-auto px-4 py-12 text-center">
        
        {/* 顶部信息区域 */}
        <div className="space-y-4 mb-10">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
            抠图模型 v3.6
          </span>
          <p className="text-sm text-gray-500">
            更新时间：2025年10月27日 12:00，提升抠图效果。
            <a href="#" className={`underline ${primaryColor} ml-1`}>欢迎加入产品反馈意见</a>
          </p>
        </div>

        {/* 核心功能门户，使用 key 属性进行重置 */}
        <KoutuPortal key={portalKey} />
        
      </main>

      <footer className="text-center text-gray-400 text-sm mt-12 pb-4">
          © 2025 您的公司名称. 保留所有权利.
      </footer>
    </div>
  );
}