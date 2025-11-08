// app/context/auth-provider.tsx
'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';

interface SessionProviderProps {
    children: React.ReactNode;
    session: Session | null;
}

export function AuthProvider({ children, session }: SessionProviderProps) {
    // 这是一个客户端组件，用于在应用中启用 session Hooks
    return (
        <NextAuthSessionProvider session={session}>
            {children}
        </NextAuthSessionProvider>
    );
}