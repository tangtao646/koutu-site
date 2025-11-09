'use client';

import React from 'react';

interface LoadingSpinnerProps {
    /** 显示在加载图标下方的文字 (例如: "正在初始化应用...") */
    message: string;
}

// 包含自定义 CSS 和 HTML 结构的卫星加载效果组件
export default function MyLoading({ message }: LoadingSpinnerProps) {
    // 自定义加载效果的 CSS 字符串
    const customLoadingStyle = `
        @keyframes satellite {
            from { transform: rotate(0) translateZ(0); }
            to { transform: rotate(360deg) translateZ(0); }
        }
        /* 调整为白色 (#FFF) 以便在深色背景下可见 */
        .loading-effect {
            position: relative;
            width: 48px;
            height: 48px;
            animation: satellite 3s infinite linear;
            border: 1px solid #FFF; 
            border-radius: 100%;
            margin: 0 auto;
        }
        .loading-effect:before, .loading-effect:after {
            position: absolute;
            left: 1px;
            top: 1px;
            width: 12px;
            height: 12px;
            content: "";
            border-radius: 100%;
            background-color: #FFF;
            box-shadow: 0 0 10px #FFF;
        }
        .loading-effect:after {
            right: 0;
            width: 20px;
            height: 20px;
            margin: 13px;
            left: unset;
            top: unset;
        }
    `;

    return (
        // 全屏固定，半透明背景，居中对齐
        <div className="fixed inset-0 flex items-center justify-center bg-gray-300/50 z-50 transition-opacity ">
            <div className="flex flex-col items-center">
                {/* 卫星加载效果 HTML 结构 */}
                <div className="loading-effect"></div>
                {/* 消息文本 */}
                <span className="mt-6 text-white text-base font-medium">{message}</span>
            </div>
            {/* 嵌入自定义 CSS */}
            <style>{customLoadingStyle}</style>
        </div>
    );
}