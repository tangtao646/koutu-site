import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { FirestoreAdapter } from '@next-auth/firebase-adapter'; // ⚠️ 您需要安装并配置一个兼容的 Firestore 适配器
import { adminDb } from './firebase-server';
import { Adapter } from 'next-auth/adapters';

// 确保在 .env.local 文件中设置了以下环境变量
// GOOGLE_CLIENT_ID
// GOOGLE_CLIENT_SECRET

export const authOptions: AuthOptions = {
    // 1. 适配器配置 (存储用户和会话数据到 Firestore)
    // 如果您使用的是 @next-auth/firebase-adapter，它需要一个 Firebase App 和 Firestore 实例。
    adapter: FirestoreAdapter(adminDb) as Adapter,

    // 2. 认证提供程序
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        // 可以添加其他提供程序，例如 FacebookProvider
    ],

    // 3. 回调函数 (Callbacks)
    // 当用户第一次登录时，adapter 会自动创建用户和会话文档。
    // 您可以在这里自定义 Session 和 JWT 的内容。
    callbacks: {
        async session({ session, user }) {
            // 确保 session 中包含用户的唯一ID，以便在 Firestore 中查询用户数据
            if (user && session.user) {
                session.user.id = user.id;
            }
            return session;
        },
    },

    // 4. Session 策略
    session: {
        // 使用数据库存储 (NextAuth 将使用 adapter 存储 Session)
        strategy: 'database',
    },

    // 5. 密钥
    // 建议在 .env.local 中设置 NEXTAUTH_SECRET，用于加密 Session Token
    secret: process.env.NEXTAUTH_SECRET,
};