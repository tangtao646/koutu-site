'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
// 💥 导入 useSession 来获取登录状态
import { signIn, useSession } from 'next-auth/react';
import Navbar from './ui/navbar';
import KoutuPortal from './ui/koutu-portal';
import AuthModal from './ui/auth-modal';
import { getDictionary, dictionaries, getInitialLocale, Messages } from './lib/i18n';

// 确保与 AuthModal 中的类型一致
type AuthTab = 'login' | 'signup';

export default function HomePage() {
  const primaryColor = 'text-blue-600';
  const router = useRouter();
  const searchParams = useSearchParams();

  // 💥 NEW: 获取 Session 数据
  const { data: session, status } = useSession();

 
  const [locale, setLocale] = useState<keyof typeof dictionaries>(getInitialLocale());
  // 使用 useMemo 优化 t 的获取，确保在 locale 变化时更新
  const t: Messages = useMemo(() => getDictionary(locale), [locale]);

  const authParam = searchParams.get('auth');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // NEW: 监听 URL 参数变化，控制模态框显示/隐藏
  useEffect(() => {
    // 💥 只有在用户未登录时才显示 Auth Modal
    if (!session && (authParam === 'login' || authParam === 'signup')) {
      setShowAuthModal(true);
    } else {
      setShowAuthModal(false);
      // 如果用户在模态框弹出时登录了，也清除 URL 参数
      if (session && authParam) {
          router.replace(window.location.pathname);
      }
    }
  }, [authParam, session, router]); // 依赖 session

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
    // 关闭模态框后，清除 URL 中的参数，防止刷新后再次弹出
    router.replace(window.location.pathname);
  };


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
    // 如果已登录，不执行操作
    if (session) return;
    router.push(window.location.pathname + '?auth=login');
  }, [router, session]);

  const handleSignupClick = useCallback(() => {
    // 如果已登录，不执行操作
    if (session) return;
    router.push(window.location.pathname + '?auth=signup');
  }, [router, session]);


  // 构造传递给 Navbar 的 Props
  const navbarProps = {
    onHomeClick: handleHomeReset,
    locale,
    t,
    onLoginClick: handleLoginClick,
    onSignupClick: handleSignupClick,
    // 💥 NEW: 传递 session 数据
    session: session,
  };

  // 💥 可选：如果 Session 正在加载，可以显示一个简单的加载状态
  if (status === 'loading') {
    console.log('Session loading...');
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <span className="text-lg font-medium text-gray-400">Loading application...</span>
          </div>
      );
  }

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