// app/ui/navbar.tsx
import Link from 'next/link';

interface NavbarProps {
    onHomeClick: () => void; // 添加点击 Logo/首页时的回调函数
}

export default function Navbar({ onHomeClick }: NavbarProps) {
  const primaryColor = 'text-blue-600'; // 抠抠图的品牌蓝
  const primaryBg = 'bg-blue-600 hover:bg-blue-700';

  return (
    <nav className="border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Logo 和品牌名 */}
        <div className="flex items-center">
          {/* 使用 Link 组件，但通过 onClick 来拦截并执行重置逻辑 */}
          <Link 
            href="/" 
            onClick={onHomeClick} // 👈 **关键：点击时执行重置逻辑**
            className="flex-shrink-0"
          >
            <span className={`text-2xl font-bold ${primaryColor}`}>
              抠图快手
            </span>
            <span className="text-gray-500 ml-1">koutukuai.com</span>
          </Link>
        </div>

        {/* 导航链接 */}
        {/* <div className="hidden sm:ml-6 sm:flex sm:space-x-8 items-center">
          {[
            { name: '首页', href: '#', isHome: true }, // 首页链接也使用重置逻辑
            { name: '在线批量抠图', href: '#' },
          
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={item.isHome ? onHomeClick : undefined} // 首页链接也执行重置
              className={`text-gray-600 hover:${primaryColor} px-3 py-2 text-sm font-medium transition-colors`}
            >
              {item.name}
            </Link>
          ))}
        </div> */}

        {/* 登录/注册按钮 */}
        <div className="flex items-center space-x-2">
          <button className={`px-4 py-1.5 text-sm font-medium rounded ${primaryColor} border border-blue-600 hover:bg-blue-50 transition-colors`}>
            登录
          </button>
          <button className={`px-4 py-1.5 text-sm font-medium rounded text-white ${primaryBg} transition-colors`}>
            免费注册
          </button>
        </div>
      </div>
    </nav>
  );
}