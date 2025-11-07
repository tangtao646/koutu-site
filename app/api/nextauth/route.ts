// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';

// 🚨 提醒：您需要从 Google/Facebook 开发者平台获取这些环境变量
// 并将它们添加到您的 .env.local 文件中。
const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID || "",
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
        }),
        // 您也可以在此处添加 Email/Password 认证提供商 (如 CredentialsProvider)
    ],
    // 可选: 配置数据库 (推荐用于生产环境)
    // adapter: PrismaAdapter(prisma), 
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET, // 🚨 必须设置
    pages: {
        // 允许 NextAuth 处理回调，但不会自动跳转到默认登录页
        signIn: '/', 
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };