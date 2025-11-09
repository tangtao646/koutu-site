import "./globals.css";
import { AuthProvider } from './context/auth-provider'; // 导入封装的客户端 Provider
// 💥 导入 React 和 Suspense
import React, { Suspense } from 'react';
import  MyLoading  from '@/app/ui/my-loading';

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
            <MyLoading message=""/>
          }>
            {children}
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
