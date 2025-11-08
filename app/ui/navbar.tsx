'use client';

import Link from 'next/link';
import { Messages } from '@/app/lib/i18n';
// 💥 导入 UserInfo 组件，用于显示已登录用户的信息
import UserInfo from '@/app/ui/user-info';
// 💥 导入 NextAuth Session 类型
import { Session } from 'next-auth';

interface NavbarProps {
  onHomeClick: () => void;
  t: Messages; // 💥 接收翻译字典
  onLoginClick: () => void; // 💥 接收登录回调
  onSignupClick: () => void; // 💥 接收注册回调
  // 💥 NEW: 接收当前 Session 数据
  session: Session | null;
}

export default function Navbar({ onHomeClick, onLoginClick, onSignupClick, t, session }: NavbarProps) {

  const primaryColor = 'text-blue-600';
  const primaryBg = 'bg-blue-600 hover:bg-blue-700';

  // 💥 判断用户是否已登录
  const isLoggedIn = !!session;

  return (
    <nav className="border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Logo 和品牌名 (使用 t) */}
        <div className="flex items-center">
          <Link
            href="/"
            onClick={onHomeClick}
            className="flex-shrink-0"
          >
            <span className={`text-2xl font-bold ${primaryColor}`}>
              {t.Navigation.title}
            </span>
            {/* 假设 t.Navigation.domain 存在 */}
            <span className="text-gray-500 ml-1">{t.Navigation.domain}</span>
          </Link>
        </div>

        {/* 登录/注册按钮 或 用户信息组件 */}
        <div className="flex items-center space-x-2">
          {isLoggedIn ? (
            // 💥 如果已登录，显示用户信息组件
            <UserInfo />
          ) : (
            // 💥 如果未登录，显示登录/注册按钮
            <>
              <button
                onClick={onLoginClick}
                className={`px-4 py-1.5 text-sm font-medium rounded ${primaryColor} border border-blue-600 hover:bg-blue-50 transition-colors`}>
                {t.Welcome.loginButton}
              </button>
              <button
                onClick={onSignupClick}
                className={`px-4 py-1.5 text-sm font-medium rounded text-white ${primaryBg} transition-colors`}>
                {t.Welcome.registerButton}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}