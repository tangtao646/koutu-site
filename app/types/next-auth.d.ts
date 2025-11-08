import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

// 扩展 NextAuth 的内置 User 类型，使其包含 id 字段
declare module 'next-auth' {
  /**
   * 扩展用户对象 (来自 Adapter/Database)
   */
  interface User extends DefaultUser {
    id: string; // 💥 添加 id 字段
  }
  

  /**
   * 扩展 Session 对象，确保 session.user 中包含 id
   */
  interface Session extends DefaultSession {
    user?: {
      id: string; // 💥 添加 id 字段
    } & DefaultSession['user'];
  }
}

// 如果使用 JWT 策略 (但我们使用的是 database 策略，此段可选)
declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: string;
  }
}