// app/ui/navbar.tsx
'use client';

import Link from 'next/link';
// 💥 移除 useRouter 和 useState (由父组件控制语言)
import { Messages } from '@/app/lib/i18n';

interface NavbarProps {
  onHomeClick: () => void;
  t: Messages; // 💥 接收翻译字典
  onLoginClick: () => void; // 💥 接收登录回调
  onSignupClick: () => void; // 💥 接收注册回调
}

export default function Navbar({ onHomeClick, onLoginClick, onSignupClick, t }: NavbarProps) {

  const primaryColor = 'text-blue-600';
  const primaryBg = 'bg-blue-600 hover:bg-blue-700';

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

        {/* 登录/注册按钮 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onLoginClick} // 💥 调用父组件传来的登录回调
            className={`px-4 py-1.5 text-sm font-medium rounded ${primaryColor} border border-blue-600 hover:bg-blue-50 transition-colors`}>
            {t.Welcome.loginButton}
          </button>
          <button
            onClick={onSignupClick} // 💥 调用父组件传来的注册回调
            className={`px-4 py-1.5 text-sm font-medium rounded text-white ${primaryBg} transition-colors`}>
            {t.Welcome.registerButton}
          </button>
        </div>
      </div>
    </nav>
  );
}