// app/ui/auth-modal.tsx
'use client';

import { useState, useEffect } from 'react'; // 💥 引入 useEffect
import { X } from 'lucide-react';
import { SiFacebook, SiGoogle } from 'react-icons/si';
import { Messages } from '@/app/lib/i18n';
import Link from 'next/link';


// 假设我们支持的 Tab
type AuthTab = 'login' | 'signup';

interface AuthModalProps {
    onClose: () => void;
    initialTab?: AuthTab | null;
    t: Messages; // 💥 接收翻译字典
    onSocialLogin: (provider: 'facebook' | 'google') => void; // 👈 接收函数
}

export default function AuthModal({ onClose, initialTab, t, onSocialLogin }: AuthModalProps) {
    // 💥 使用 initialTab 设置初始状态，如果没有则默认为 'login'
    const [activeTab, setActiveTab] = useState<AuthTab>(initialTab || 'login');

    // 💥 NEW: 确保 URL 参数在模态框弹出后仍然可以设置 Tab
    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    // 表单状态 (为简洁，此处仅演示结构，未实现完整表单逻辑)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);

    const handleTabChange = (tab: AuthTab) => {
        setActiveTab(tab);

        // 💥 关键修正：清空所有输入字段
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        //console.log(`${activeTab} 提交:`, { email, password });
        // 在这里实现实际的登录或注册 API 调用
    };

    // 根据当前 Tab 渲染表单内容
    const renderFormContent = () => {
        // 💥 定义一个基础输入框样式，包含更深的 placeholder 颜色
        const inputClasses = "w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-gray-800 caret-blue-600";
        if (activeTab === 'login') {
            return (
                <div className="space-y-4">
                    {/* 登录只需要 Email 和 Password */}
                    <input
                        type="email"
                        placeholder="Email"
                        className={inputClasses}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className={inputClasses}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {/* 登录特有链接 */}
                    <div className="text-right pt-1">
                        <Link href="#" className="text-sm text-blue-600 hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                </div>
            );
        }

        // 注册 (Sign Up) 表单
        return (
            <div className="space-y-4">
                <input
                    type="email"
                    placeholder="Email"
                    className={inputClasses}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password (8 characters minimum)"
                    className={inputClasses}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password confirmation"
                    className={inputClasses}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {/* 服务条款和营销复选框 */}
                <div className="space-y-3 pt-2">
                    <label className="flex items-start text-xs text-gray-600 cursor-pointer">
                        <input
                            type="checkbox"
                            className="w-4 h-4 mt-0.5 text-blue-600 border-gray-300 rounded"
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                        />
                        <span className="ml-2">
                            I agree to the <Link href="#" className="text-blue-600 hover:underline">Terms of Service</Link>,
                            <Link href="#" className="text-blue-600 hover:underline"> General Terms and Conditions</Link>
                            and <Link href="#" className="text-blue-600 hover:underline">Privacy Policy</Link>.
                        </span>
                    </label>
                    <label className="flex items-start text-xs text-gray-600 cursor-pointer">
                        <input
                            type="checkbox"
                            className="w-4 h-4 mt-0.5 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="ml-2">
                            Send me updates about remove.bg products and services. You can unsubscribe at any time.
                        </span>
                    </label>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 backdrop-blur-sm transition-opacity duration-300">

            {/* 模态框内容区 */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 relative">

                {/* 关闭按钮 (在参考图上没有，但模态框需要) */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
                    <X className="w-6 h-6" />
                </button>

                {/* Tab 切换区域 */}
                <div className="flex border-b border-gray-200">
                    <button
                        className={`flex-1 py-4 text-center text-sm font-semibold transition-colors ${activeTab === 'login' ? 'text-gray-900 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => handleTabChange('login')}
                    >
                        Log in
                    </button>
                    <button
                        className={`flex-1 py-4 text-center text-sm font-semibold transition-colors ${activeTab === 'signup' ? 'text-gray-900 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => handleTabChange('signup')}
                    >
                        Sign up
                    </button>
                </div>

                {/* 主要内容和表单 */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* 注册/登录权益描述 (仅在 Sign up Tab 下显示，根据参考图) */}
                    {activeTab === 'signup' && (
                        <div className="flex justify-around text-center text-xs text-gray-600 mb-4">
                            <div>
                                <img src="/path/to/icon1.svg" alt="Free Image" className="w-8 h-8 mx-auto mb-1" />
                                1 Free Image <br /> up to 50 megapixels
                            </div>
                            <div>
                                <img src="/path/to/icon2.svg" alt="API Previews" className="w-8 h-8 mx-auto mb-1" />
                                50 Free API previews <br /> per month
                            </div>
                        </div>
                    )}

                    {/* 社交登录按钮 */}
                    <div className="space-y-3">
                        <button type='button' className="w-full flex items-center justify-center p-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            onClick={() => onSocialLogin('facebook')} >
                            <SiFacebook className="w-5 h-5 mr-2 text-blue-600" />
                            Continue with Facebook
                        </button>
                        <button type='button' className="w-full flex items-center justify-center p-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            onClick={() => onSocialLogin('google')} >
                            <SiGoogle className="w-5 h-5 mr-2 text-red-500" />
                            Continue with Google
                        </button>
                    </div>

                    {/* 分隔线 */}
                    <div className="relative flex items-center">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="flex-shrink mx-4 text-gray-500 text-sm">or</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    {/* 邮箱和密码表单 */}
                    {renderFormContent()}

                    {/* 提交按钮 */}
                    <button
                        type="submit"
                        disabled={activeTab === 'signup' && !agreeTerms}
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 mt-4"
                    >
                        {activeTab === 'login' ? 'Log in' : 'Sign up'}
                    </button>
                </form>
            </div>
        </div>
    );
}

