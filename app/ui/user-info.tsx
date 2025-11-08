'use client';

import { useSession, signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export default function UserInfo() {
  // 使用 useSession Hook 读取认证状态和数据
  const { data: session, status } = useSession();

  // 正在加载中
  if (status === 'loading') {
    return <div style={{ height: '50px' }}></div>;
  }

  // 未登录
  if (status === 'unauthenticated') {
    return (
        <span className="text-gray-500 text-sm">
            未登录
        </span>
    );
  }

  // 成功登录
  return (
    <div className="flex items-center space-x-3 bg-white p-2 rounded-full shadow-sm border border-gray-100">
      <img
        src={session?.user?.image || 'https://placehold.co/32x32/7e7e7e/ffffff?text=U'}
        alt="User Avatar"
        className="w-8 h-8 rounded-full"
        referrerPolicy="no-referrer" // 避免头像加载问题
      />
      <div className="text-sm font-medium text-gray-800 hidden sm:block">
        {/* 显示用户名或邮箱 */}
        {session?.user?.name || session?.user?.email}
      </div>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
        title="Sign Out"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
}