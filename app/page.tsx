// app/page.tsx
'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // 💥 确保导入路径正确
import Navbar from './ui/navbar';
import KoutuPortal from './ui/koutu-portal';
import AuthModal from './ui/auth-modal';
import { signIn } from 'next-auth/react'; // 💥 引入 NextAuth 客户端函数
// 💥 导入 I18N 工具和类型
import { getDictionary, dictionaries, getInitialLocale, Messages } from './lib/i18n';

// 确保与 AuthModal 中的类型一致
type AuthTab = 'login' | 'signup';

export default function HomePage() {
  const primaryColor = 'text-blue-600';
  const router = useRouter(); // 💥 初始化 useRouter
  const searchParams = useSearchParams();

  // ==========================================================
  // 1. I18N 状态管理 (组件首次挂载时动态获取语言)
  // ==========================================================
  const [locale, setLocale] = useState<keyof typeof dictionaries>(getInitialLocale());
  // 使用 useMemo 优化 t 的获取，确保在 locale 变化时更新
  const t: Messages = useMemo(() => getDictionary(locale), [locale]);

  // ==========================================================
  // 2. Auth Modal 状态管理 (由 URL 参数驱动)
  // ==========================================================
  const authParam = searchParams.get('auth');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // NEW: 监听 URL 参数变化，控制模态框显示/隐藏
  useEffect(() => {
    if (authParam === 'login' || authParam === 'signup') {
      setShowAuthModal(true);
    } else {
      setShowAuthModal(false);
    }
  }, [authParam]);

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
    // 关闭模态框后，清除 URL 中的参数，防止刷新后再次弹出
    router.replace(window.location.pathname);
  };

  // ==========================================================
  // 3. Portal 重置和导航逻辑
  // ==========================================================
  const [portalKey, setPortalKey] = useState(0);

  // 重置功能：用于点击 Logo/Home 时的逻辑
  const handleHomeReset = useCallback(() => {
    // 1. 清除 localStorage 缓存
    localStorage.removeItem('koutu_images');

    // 2. 增加 key 的值，重置 KoutuPortal 状态
    setPortalKey(prevKey => prevKey + 1);

    // 3. 清除 URL 参数，并导航到根路径
    router.replace('/');
  }, [router]);

  // 💥 社交登录处理函数
  const handleSocialLogin = useCallback((provider: 'facebook' | 'google') => {
    // 关闭模态框 (可选，因为 signIn 会自动重定向)
    handleCloseAuthModal();

    // 💥 使用 NextAuth 的 signIn 函数：安全且简洁
    signIn(provider, {
      callbackUrl: '/', // 认证成功后返回的 URL (返回根路径)
    });

  }, [handleCloseAuthModal]);

  // 登录/注册点击处理：只负责添加 URL 参数
  const handleLoginClick = useCallback(() => {
    router.push(window.location.pathname + '?auth=login');
  }, [router]);

  const handleSignupClick = useCallback(() => {
    router.push(window.location.pathname + '?auth=signup');
  }, [router]);


  // 构造传递给 Navbar 的 Props
  const navbarProps = {
    onHomeClick: handleHomeReset,
    locale,
    t,
    onLoginClick: handleLoginClick,
    onSignupClick: handleSignupClick,
  };


  return (
    <div className="min-h-screen bg-gray-50">

      {/* 1. Navbar (导航栏) */}
      <Navbar {...navbarProps} />

      <main className="max-w-5xl mx-auto px-4 py-12 text-center">

        {/* 顶部信息区域 (假设 I18N 键已定义) */}
        <div className="space-y-4 mb-10">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
            {'模型 v3.6'}
          </span>
          <p className="text-sm text-gray-500">
            {'更新信息 placeholder'}
            <a href="#" className={`underline ${primaryColor} ml-1`}>
              {'反馈意见'}
            </a>
          </p>
        </div>

        {/* 2. KoutuPortal (核心功能区) */}
        <KoutuPortal
          key={portalKey}
          t={t}
        />

      </main>

      {/* Footer (假设 I18N 键已定义) */}
      <footer className="text-center text-gray-400 text-sm mt-12 pb-4">
        © 2025 {'公司名称'}. {'保留所有权利.'}
      </footer>

      {/* 3. Auth Modal (认证模态框) */}
      {showAuthModal && (
        <AuthModal
          onClose={handleCloseAuthModal}
          initialTab={authParam as AuthTab | null}
          t={t} // 传递翻译函数
          onSocialLogin={handleSocialLogin} // 👈 传递函数
        />
      )}
    </div>
  );
}