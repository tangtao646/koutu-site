// app/ui/image-editor-modal.tsx
'use client';

import { ImageItem } from '@/app/lib/types';
import { useState, useRef, useEffect, useCallback, MouseEvent } from 'react';
import { Save, X, Crop as CropIcon } from 'lucide-react';
// 💥 引入本地国际化工具
import { getInitialLocale, getDictionary, dictionaries } from '@/app/lib/i18n';

interface Crop {
    x: number; // 裁剪框左上角相对于图片左上角的像素坐标 (原始像素)
    y: number; // 裁剪框左上角相对于图片左上角的像素坐标 (原始像素)
    width: number; // 裁剪框宽度 (原始像素)
    height: number; // 裁剪框高度 (原始像素)
}

interface ImageEditorModalProps {
    item: ImageItem;
    onSave: (id: string, newBlob: Blob, newWidth: number, newHeight: number) => void;
    onClose: () => void;
}

const MIN_CROP_SIZE_PX = 50; // 裁剪框最小尺寸 (像素)
const INITIAL_MARGIN_PX = 30; // 初始裁剪框内边距 (像素)

export default function ImageEditorModal({ item, onSave, onClose }: ImageEditorModalProps) {
    const [crop, setCrop] = useState<Crop>({ x: 0, y: 0, width: 0, height: 0 }); // 裁剪框的像素值
    const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
    // 💥 NEW: 管理语言状态
    const [locale, setLocale] = useState<keyof typeof dictionaries>(getInitialLocale()); // 初始设置为中文
    const t = getDictionary(locale); // 获取翻译函数

    // 💥 NEW: 布局稳定状态，只有为 true 时才渲染裁剪框和遮罩
    const [layoutStabilized, setLayoutStabilized] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const previewWrapperRef = useRef<HTMLDivElement>(null);

    const [isSaving, setIsSaving] = useState(false);

    // 拖拽和调整大小状态
    const [isResizing, setIsResizing] = useState<string | null>(null);
    const [isDraggingCrop, setIsDraggingCrop] = useState(false);
    const startMouseX = useRef(0);
    const startMouseY = useRef(0);
    const startCrop = useRef<Crop>({ x: 0, y: 0, width: 0, height: 0 });

    /**
     * 根据当前图片尺寸计算并返回初始裁剪区域 (包含 30px 边距)
     */
    const getInitialCrop = useCallback((originalW: number, originalH: number): Crop => {
        const margin = INITIAL_MARGIN_PX;

        let x = margin;
        let y = margin;
        let width = originalW - 2 * margin;
        let height = originalH - 2 * margin;

        if (width <= 0 || height <= 0) {
            x = 0;
            y = 0;
            width = originalW;
            height = originalH;
        }

        return { x, y, width, height };
    }, []);


    // 1. 加载原始图片
    useEffect(() => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
            setOriginalImage(img);

            const initialCrop = getInitialCrop(img.naturalWidth, img.naturalHeight);
            setCrop(initialCrop);

            // 首次设置裁剪区域后，进入布局稳定检测
            setLayoutStabilized(false);
        };

        const originalUrl = URL.createObjectURL(item.fileObject);
        img.src = originalUrl;

        return () => {
            URL.revokeObjectURL(originalUrl);
        };
    }, [item.fileObject, getInitialCrop]);


    // 💥 NEW: 布局稳定检测
    useEffect(() => {
        if (!originalImage) return;

        let frameId: number;

        const checkLayoutStability = () => {
            const wrapper = previewWrapperRef.current;
            // 检查容器是否已被浏览器正确布局（即 clientWidth/clientHeight > 0）
            if (wrapper && wrapper.clientWidth > 0 && wrapper.clientHeight > 0) {
                // 布局稳定，强制进行一次最终渲染计算
                setLayoutStabilized(true);
            } else {
                // 布局未稳定，继续等待下一帧
                frameId = requestAnimationFrame(checkLayoutStability);
            }
        };

        // 在图片和组件挂载后，立即开始检查布局稳定性
        checkLayoutStability();

        return () => {
            if (frameId) {
                cancelAnimationFrame(frameId);
            }
        };
    }, [originalImage]); // 依赖 originalImage，确保图片加载完成才开始检查


    // 💥 NEW: 窗口 resize 监听器 (强制重新检查布局)
    useEffect(() => {
        const handleWindowResize = () => {
            // 窗口大小改变时，重置稳定状态，强制重新计算
            setLayoutStabilized(false);

            let frameId: number;
            const checkResizeStability = () => {
                const wrapper = previewWrapperRef.current;
                if (wrapper && wrapper.clientWidth > 0 && wrapper.clientHeight > 0) {
                    setLayoutStabilized(true);
                } else {
                    frameId = requestAnimationFrame(checkResizeStability);
                }
            };
            requestAnimationFrame(checkResizeStability);

            return () => {
                if (frameId) cancelAnimationFrame(frameId);
            };
        };

        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);


    // 2. 核心绘制函数
    const drawCanvas = useCallback((img: HTMLImageElement) => {
        const canvas = canvasRef.current;
        const wrapper = previewWrapperRef.current;
        if (!canvas || !wrapper) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { naturalWidth: originalW, naturalHeight: originalH } = img;

        const canvasW = originalW;
        const canvasH = originalH;

        canvas.width = canvasW;
        canvas.height = canvasH;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        ctx.translate(canvas.width / 2, canvas.height / 2);

        ctx.drawImage(
            img,
            -originalW / 2,
            -originalH / 2,
            originalW,
            originalH
        );
        ctx.restore();
    }, []);

    useEffect(() => {
        if (originalImage) {
            drawCanvas(originalImage);
        }
    }, [originalImage, drawCanvas]);


    // 3. 拖拽和调整大小的 mouse down (保持不变)
    const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
        if (!layoutStabilized) return; // 只有在布局稳定后才能开始拖拽

        e.preventDefault();
        e.stopPropagation();

        const target = e.target as HTMLElement;
        const wrapper = previewWrapperRef.current;
        if (!wrapper || !originalImage) return;

        const wrapperRect = wrapper.getBoundingClientRect();

        const mouseXInWrapper = e.clientX - wrapperRect.left;
        const mouseYInWrapper = e.clientY - wrapperRect.top;

        startMouseX.current = mouseXInWrapper;
        startMouseY.current = mouseYInWrapper;
        startCrop.current = { ...crop };

        if (target.dataset.handler) {
            setIsResizing(target.dataset.handler);
        } else if (target.classList.contains('crop-box')) {
            setIsDraggingCrop(true);
        }
    }, [crop, originalImage, layoutStabilized]);


    // 4. 裁剪框拖拽和调整大小逻辑 (保持不变，依赖实时计算，确保调整大小功能稳定)
    const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
        if (!isResizing && !isDraggingCrop) return;

        e.preventDefault();
        e.stopPropagation();

        const wrapper = previewWrapperRef.current;
        if (!wrapper || !originalImage) return;

        // 实时计算图像渲染尺寸 (这是关键)
        const wrapperRect = wrapper.getBoundingClientRect();
        const { naturalWidth: originalW, naturalHeight: originalH } = originalImage;

        const imgCanvasWidth = originalW;
        const imgCanvasHeight = originalH;
        const canvasAspectRatio = imgCanvasWidth / imgCanvasHeight;

        let imgRenderWidth = wrapperRect.width;
        let imgRenderHeight = wrapperRect.height;
        let imgRenderOffsetX = 0;
        let imgRenderOffsetY = 0;

        const wrapperAspectRatio = wrapperRect.width / wrapperRect.height;

        if (canvasAspectRatio > wrapperAspectRatio) {
            imgRenderHeight = wrapperRect.width / canvasAspectRatio;
            imgRenderOffsetY = (wrapperRect.height - imgRenderHeight) / 2;
        } else {
            imgRenderWidth = wrapperRect.height * canvasAspectRatio;
            imgRenderOffsetX = (wrapperRect.width - imgRenderWidth) / 2;
        }

        let totalVisualScale = 1;
        if (originalW > 0) {
            totalVisualScale = imgRenderWidth / originalW;
        }

        const mouseCurrentXInWrapper = e.clientX - wrapperRect.left;
        const mouseCurrentYInWrapper = e.clientY - wrapperRect.top;

        const dx_display = (mouseCurrentXInWrapper - imgRenderOffsetX) - (startMouseX.current - imgRenderOffsetX);
        const dy_display = (mouseCurrentYInWrapper - imgRenderOffsetY) - (startMouseY.current - imgRenderOffsetY);

        const dx_original = dx_display / totalVisualScale;
        const dy_original = dy_display / totalVisualScale;

        let newCrop = { ...startCrop.current };
        const minSize = MIN_CROP_SIZE_PX / totalVisualScale;

        if (isDraggingCrop) {
            // ... (拖拽逻辑保持不变)
            newCrop.x = startCrop.current.x + dx_original;
            newCrop.y = startCrop.current.y + dy_original;

            const maxRight = originalW - newCrop.width;
            const maxBottom = originalH - newCrop.height;

            newCrop.x = Math.max(0, Math.min(newCrop.x, maxRight));
            newCrop.y = Math.max(0, Math.min(newCrop.y, maxBottom));

        } else if (isResizing) {
            // ... (调整大小逻辑保持不变)
            let { x, y, width, height } = startCrop.current;

            switch (isResizing) {
                case 'nw':
                    const minX_nw = startCrop.current.x + width - minSize;
                    const minY_nw = startCrop.current.y + height - minSize;

                    x = Math.max(0, Math.min(minX_nw, startCrop.current.x + dx_original));
                    y = Math.max(0, Math.min(minY_nw, startCrop.current.y + dy_original));

                    width = startCrop.current.width - (x - startCrop.current.x);
                    height = startCrop.current.height - (y - startCrop.current.y);
                    break;
                case 'ne':
                    const maxW_ne = originalW - x;
                    const minY_ne = startCrop.current.y + height - minSize;

                    y = Math.max(0, Math.min(minY_ne, startCrop.current.y + dy_original));
                    width = Math.min(maxW_ne, Math.max(minSize, startCrop.current.width + dx_original));
                    height = startCrop.current.height - (y - startCrop.current.y);
                    break;
                case 'sw':
                    const minX_sw = startCrop.current.x + width - minSize;
                    const maxH_sw = originalH - y;

                    x = Math.max(0, Math.min(minX_sw, startCrop.current.x + dx_original));
                    width = startCrop.current.width - (x - startCrop.current.x);
                    height = Math.min(maxH_sw, Math.max(minSize, startCrop.current.height + dy_original));
                    break;
                case 'se':
                    const maxW_se = originalW - x;
                    const maxH_se = originalH - y;

                    width = Math.min(maxW_se, Math.max(minSize, startCrop.current.width + dx_original));
                    height = Math.min(maxH_se, Math.max(minSize, startCrop.current.height + dy_original));
                    break;
                case 'n':
                    const minY_n = startCrop.current.y + height - minSize;
                    y = Math.max(0, Math.min(minY_n, startCrop.current.y + dy_original));
                    height = startCrop.current.height - (y - startCrop.current.y);
                    break;
                case 's':
                    const maxH_s = originalH - y;
                    height = Math.min(maxH_s, Math.max(minSize, startCrop.current.height + dy_original));
                    break;
                case 'w':
                    const minX_w = startCrop.current.x + width - minSize;
                    x = Math.max(0, Math.min(minX_w, startCrop.current.x + dx_original));
                    width = startCrop.current.width - (x - startCrop.current.x);
                    break;
                case 'e':
                    const maxW_e = originalW - x;
                    width = Math.min(maxW_e, Math.max(minSize, startCrop.current.width + dx_original));
                    break;
            }
            newCrop = { x, y, width, height };
        }

        setCrop(newCrop);
    }, [isResizing, isDraggingCrop, originalImage]);


    const handleMouseUp = useCallback(() => {
        setIsResizing(null);
        setIsDraggingCrop(false);
    }, []);

    // 绑定全局鼠标事件 (保持不变)
    useEffect(() => {
        if (isResizing || isDraggingCrop) {
            document.addEventListener('mousemove', handleMouseMove as any);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove as any);
            document.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove as any);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, isDraggingCrop, handleMouseMove, handleMouseUp]);


    // 保存并导出图片 (保持不变)
    const handleSave = () => {
        if (!originalImage) return;

        setIsSaving(true);

        const finalCanvas = document.createElement('canvas');
        const finalCtx = finalCanvas.getContext('2d');
        if (!finalCtx) {
            setIsSaving(false);
            return;
        }

        const croppedWidth = Math.round(crop.width);
        const croppedHeight = Math.round(crop.height);

        finalCanvas.width = croppedWidth;
        finalCanvas.height = croppedHeight;

        finalCtx.save();

        finalCtx.drawImage(
            originalImage,
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            finalCanvas.width,
            finalCanvas.height
        );
        finalCtx.restore();

        finalCanvas.toBlob((blob) => {
            if (blob) {
                onSave(item.id, blob, finalCanvas.width, finalCanvas.height);
                setCrop(getInitialCrop(originalImage.naturalWidth, originalImage.naturalHeight));
            } else {
                alert("保存失败，无法创建新的图片文件。");
            }
            setIsSaving(false);
        }, 'image/png');
    };

    // --- JSX 样式和计算 ---
    if (!originalImage) return null;

    const { naturalWidth: originalW, naturalHeight: originalH } = originalImage;

    // 实时计算当前显示指标
    const wrapper = previewWrapperRef.current;
    let totalVisualScale = 1;
    let imgDisplayOffsetX = 0;
    let imgDisplayOffsetY = 0;
    let wrapperWidth = 0;
    let wrapperHeight = 0;

    // 只有在 wrapper 存在且布局稳定时才计算精确值
    if (wrapper) {
        wrapperWidth = wrapper.clientWidth;
        wrapperHeight = wrapper.clientHeight;

        const canvasAspectRatio = originalW / originalH;
        const wrapperAspectRatio = wrapperWidth / wrapperHeight;

        let imgDisplayWidth = 0;
        let imgDisplayHeight = 0;

        if (canvasAspectRatio > wrapperAspectRatio) {
            imgDisplayWidth = wrapperWidth;
            imgDisplayHeight = wrapperWidth / canvasAspectRatio;
            imgDisplayOffsetY = (wrapperHeight - imgDisplayHeight) / 2;
        } else {
            imgDisplayHeight = wrapperHeight;
            imgDisplayWidth = wrapperHeight * canvasAspectRatio;
            imgDisplayOffsetX = (wrapperWidth - imgDisplayWidth) / 2;
        }

        if (originalW > 0) {
            totalVisualScale = imgDisplayWidth / originalW;
        }
    }


    // 使用实时计算的结果来绘制裁剪框
    const cropBoxLeft = imgDisplayOffsetX + crop.x * totalVisualScale;
    const cropBoxTop = imgDisplayOffsetY + crop.y * totalVisualScale;
    const cropBoxWidth = crop.width * totalVisualScale;
    const cropBoxHeight = crop.height * totalVisualScale;

    const cropBoxStyle = {
        left: `${cropBoxLeft}px`,
        top: `${cropBoxTop}px`,
        width: `${cropBoxWidth}px`,
        height: `${cropBoxHeight}px`,
        cursor: isDraggingCrop ? 'grabbing' : (isResizing ? 'grabbing' : 'move'),
    };

    // 蒙版样式 (实现半透明遮罩) 
    const overlayTopStyle = { top: 0, left: 0, right: 0, height: cropBoxTop };
    const overlayBottomStyle = { bottom: 0, left: 0, right: 0, height: wrapperHeight - cropBoxTop - cropBoxHeight };
    const overlayLeftStyle = { top: cropBoxTop, left: 0, width: cropBoxLeft, height: cropBoxHeight };
    const overlayRightStyle = { top: cropBoxTop, right: 0, width: wrapperWidth - cropBoxLeft - cropBoxWidth, height: cropBoxHeight };


    const modalClasses = "fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 backdrop-blur-sm transition-opacity duration-300";
    const contentClasses = "bg-white rounded-xl shadow-2xl w-[90vw] h-[90vh] max-w-[1000px] max-h-[800px] flex flex-col overflow-hidden";
    const headerClasses = "flex justify-between items-center p-4 border-b border-gray-200";

    return (
        <div className={modalClasses}>
            <div className={contentClasses}>

                {/* 头部 (保持不变) */}
                <div className={headerClasses}>

                    <h2 className="text-xl font-bold text-gray-800">{t.Editor.cropButton}：{item.name}</h2>

                    {/* 顶部工具栏 (左侧控制) */}
                    <div className="flex space-x-4 mx-auto">
                        {/* 裁剪重置 */}
                        <button
                            onClick={() => {
                                setCrop(getInitialCrop(originalW, originalH));
                                setLayoutStabilized(true); // 重置后强制重新检查布局
                            }}
                            className="flex items-center space-x-2 py-1.5 px-3 text-sm border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            title={t.Editor.resetDescription || ''}
                        >
                            <CropIcon className="w-4 h-4" />
                            <span>{t.Editor.resetButton}</span>
                        </button>
                    </div>

                    {/* 顶部右侧的取消和保存按钮 */}
                    <div className="flex space-x-3 items-center">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            {t.Editor.cancelButton}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 flex items-center space-x-2"
                        >
                            <Save className="w-4 h-4" />
                            <span>{isSaving ? t.Editor.saving : t.Editor.saveButton}</span>
                        </button>
                        {/* 关闭按钮在最右侧 */}
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* 编辑区主体 (保持不变) */}
                <div className="flex-grow flex flex-col bg-gray-50 p-4">

                    {/* 图片预览区 & 裁剪框 */}
                    <div
                        ref={previewWrapperRef}
                        className="flex-1 min-w-0 flex items-center justify-center relative rounded-lg bg-gray-100"
                        onMouseDown={handleMouseDown}
                    >
                        {/* 实际绘制图像的 Canvas */}
                        <canvas
                            ref={canvasRef}
                            className="max-w-full max-h-full shadow-lg border border-gray-300 pointer-events-none"
                        />

                        {/* 裁剪蒙版 (50% 不透明度) */}
                        <div className="absolute inset-0 pointer-events-none z-10">
                            {layoutStabilized && (
                                <>
                                    <div className="absolute bg-gray-700/50" style={overlayTopStyle} />
                                    <div className="absolute bg-gray-700/50" style={overlayBottomStyle} />
                                    <div className="absolute bg-gray-700/50" style={overlayLeftStyle} />
                                    <div className="absolute bg-gray-700/50" style={overlayRightStyle} />
                                </>
                            )}
                        </div>

                        {/* 裁剪框本身 (可拖拽和调整大小) */}
                        {layoutStabilized && totalVisualScale > 0 && (
                            <div
                                className={`crop-box absolute border-2 border-blue-500 box-border z-20 ${isDraggingCrop ? 'cursor-grabbing' : 'cursor-move'}`}
                                style={cropBoxStyle}
                            >
                                {/* 拖拽手柄 */}
                                <div className="handler nw" data-handler="nw" />
                                <div className="handler ne" data-handler="ne" />
                                <div className="handler sw" data-handler="sw" />
                                <div className="handler se" data-handler="se" />
                                <div className="handler n" data-handler="n" />
                                <div className="handler s" data-handler="s" />
                                <div className="handler w" data-handler="w" />
                                <div className="handler e" data-handler="e" />
                            </div>
                        )}
                    </div>
                </div>

            </div>
            {/* 裁剪框手柄的样式 (保持不变) */}
            <style jsx>{`
                .handler {
                    position: absolute;
                    width: 20px; 
                    height: 20px; 
                    background: #3B82F6; /* blue-500 */
                    border: 1px solid #ffffff;
                    z-index: 30; /* 确保手柄始终在拖拽区域之上 */
                }
                /* 调整偏移量以保持居中，宽度/高度的一半 */
                .handler.nw { top: -10px; left: -10px; cursor: nwse-resize; }
                .handler.ne { top: -10px; right: -10px; cursor: nesw-resize; }
                .handler.sw { bottom: -10px; left: -10px; cursor: nesw-resize; }
                .handler.se { bottom: -10px; right: -10px; cursor: nwse-resize; }
                /* 中间手柄增加宽度/高度以覆盖整个边 */
                .handler.n { top: -10px; left: 50%; margin-left: -20px; cursor: ns-resize; width: 40px; height: 20px; } 
                .handler.s { bottom: -10px; left: 50%; margin-left: -20px; cursor: ns-resize; width: 40px; height: 20px; }
                .handler.w { left: -10px; top: 50%; margin-top: -20px; cursor: ew-resize; height: 40px; width: 20px; }
                .handler.e { right: -10px; top: 50%; margin-top: -20px; cursor: ew-resize; height: 40px; width: 20px; }
            `}</style>
        </div>
    );
}