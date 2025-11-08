import "./globals.css";
import { AuthProvider } from './context/auth-provider'; // 导入封装的客户端 Provider
// 💥 导入 React 和 Suspense
import React, { Suspense } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 在服务器端获取 session
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {/* 💥 关键修复：使用 Suspense 包裹 children */}
          <Suspense fallback={
            // 这是一个在 useSearchParams() 正在解析时显示的简单加载指示器
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <span className="text-lg font-medium text-gray-700">正在初始化应用...</span>
            </div>
          }>
            {children}
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
