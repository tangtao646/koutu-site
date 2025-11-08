import "./globals.css";
import { AuthProvider } from './context/auth-provider'; // 导入封装的客户端 Provider
import { getServerSession } from 'next-auth'; // 导入服务器端获取 Session 的函数
import  {authOptions} from '@/app/lib/auth-options';


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 在服务器端获取 session
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body>
        <AuthProvider session={session}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
