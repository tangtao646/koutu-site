'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
// 💥 移除 Session 类型导入，因为它不再作为 prop 接收
// import { Session } from 'next-auth'; 

// 💥 简化 Props，只接收 children
interface SessionProviderProps {
    children: React.ReactNode;
    // 💥 移除 session: Session | null;
}

export function AuthProvider({ children }: SessionProviderProps) {
    // 💥 停止将 session prop 传递给 NextAuthSessionProvider
    // 这将强制 NextAuth 在客户端进行 API 调用，从而触发 'loading' 状态
    return (
        <NextAuthSessionProvider>
            {children}
        </NextAuthSessionProvider>
    );
}