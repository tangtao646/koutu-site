// app/ui/koutu-portal.tsx
'use client'; 

import { useState, useRef, useTransition, useEffect, useCallback, DragEvent } from 'react';
import Image from 'next/image'; 
import { Plus, Cloud } from 'lucide-react';
import ImageGridItem from './image-grid-item';
import { ImageItem, ImageStatus } from '@/app/lib/types';

// 由于不上传，我们不再需要从 actions 导入 S3 相关的函数，只保留模拟的抠图函数。
// 假设您的 app/actions.ts 中还有 startBatchKoutuAction 函数
import { startBatchKoutuAction } from '@/app/actions'; 

const MAX_IMAGES = 12; 

export default function KoutuPortal() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isPending, startTransition] = useTransition();
  const [globalMessage, setGlobalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false); 
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null); 

  // **********************************************************
  // 核心逻辑：文件处理函数 (仅本地展示)
  // **********************************************************
  const processFiles = async (files: File[]) => {
    console.log(`[PROCESS FILES] 收到 ${files.length} 个文件，开始处理本地展示...`);
    
    const filesToUpload = files.slice(0, MAX_IMAGES - images.length);
    if (filesToUpload.length === 0) {
        if (files.length > 0) {
            setGlobalMessage({ type: 'error', text: `已达到 ${MAX_IMAGES} 张图片上限，无法继续添加。` });
        }
        return;
    }

    setGlobalMessage(null);

    // 遍历文件，准备添加到列表
    for (const file of filesToUpload) {
        if (!file.type.startsWith('image/')) {
            setGlobalMessage({ type: 'error', text: `文件 ${file.name} 不是图片类型，已跳过。` });
            continue;
        }

        // 使用 FileReader 读取文件以获取尺寸
        const reader = new FileReader();
        reader.onload = async (e) => {
            const img = new window.Image();
            
            img.onerror = () => {
                console.error(`[ERROR] 图片 ${file.name} 加载失败或格式不支持。`);
                setGlobalMessage({ type: 'error', text: `图片 ${file.name} 格式错误或加载失败。` });
            };

            img.onload = async () => {
                const tempId = Date.now().toString() + Math.random().toString(16).slice(2);
                
                // 关键点 1: 使用本地 Blob URL 作为图片源
                const placeholderUrl = URL.createObjectURL(file); 
                
                // 关键点 2: 存储 File 对象本身，以备后续（抠图时）需要上传
                const newItem: ImageItem = {
                    id: tempId,
                    name: file.name,
                    url: placeholderUrl, 
                    width: img.width,
                    height: img.height,
                    status: '待抠图',
                    fileObject: file, // 👈 存储原始 File 对象
                } as ImageItem & { fileObject: File }; // 扩展类型以包含 File 对象
                
                setImages(current => {
                    const nextImages = [...current, newItem as ImageItem]; 
                    return nextImages.length > MAX_IMAGES ? current : nextImages;
                });
                
               // setGlobalMessage({ type: 'success', text: `图片 ${file.name} 已添加到本地列表，等待抠图。` });
                
                // !!! 移除所有 S3 相关的异步代码 !!!
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }
  };


  // 4. 处理文件选择 (来自按钮/拖拽)
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
        processFiles(files);
    }
    if (fileInputRef.current) fileInputRef.current.value = ''; 
  };
  
  // 1. 删除图片
  const handleDelete = useCallback((id: string) => {
    // 关键点 3: 清理本地 URL 资源
    const itemToDelete = images.find(img => img.id === id);
    if (itemToDelete) {
        URL.revokeObjectURL(itemToDelete.url);
    }
    setImages(current => current.filter(img => img.id !== id));
    setGlobalMessage({ type: 'success', text: '图片已从列表中移除。' });
  }, [images]);

  // 2. 触发文件选择 (与之前相同)
  const handleTriggerUpload = () => {
    if (images.length >= MAX_IMAGES) {
        setGlobalMessage({ type: 'error', text: `最多只能上传 ${MAX_IMAGES} 张图片。` });
        return;
    }
    fileInputRef.current?.click();
  };

  // **********************************************************
  // 3. 开始批量抠图 (模拟 S3 逻辑)
  // **********************************************************
  const handleStartKoutu = async () => {
    // 在这里，我们将模拟 S3 上传逻辑转移到“开始抠图”按钮中
    const pendingImages = images.filter(img => img.status === '待抠图');

    if (pendingImages.length === 0) {
        setGlobalMessage({ type: 'error', text: '没有可开始抠图的任务。' });
        return;
    }
    
    // 假设：如果现在开始抠图，需要将图片上传到云端
    setGlobalMessage({ type: 'success', text: `模拟开始 ${pendingImages.length} 个抠图任务 (假定此时才上传 S3)...` });
    
    // 1. 更新状态为“抠图中”
    setImages(current => current.map(img => 
        img.status === '待抠图' ? { ...img, status: '抠图中' } : img
    ));

    // 2. 模拟抠图 API 调用 (使用原来 S3 逻辑中的模拟延迟)
    // 实际项目中：在这里发起 S3 上传或直接发送图片数据给抠图服务器
    const mockKeys = pendingImages.map(img => img.name);
    await startBatchKoutuAction(mockKeys); 

    // 3. 模拟抠图完成
    setImages(current => current.map(img => 
        img.status === '抠图中' ? { ...img, status: '抠图完毕' } : img
    ));
    setGlobalMessage({ type: 'success', text: '所有抠图任务已模拟完成！' });
  };


  // **********************************************************
  // 拖放和粘贴逻辑 (保持不变)
  // **********************************************************
  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true); 
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
        setIsDragging(false);
    }
  };
  
  const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true); 
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false); 

    if (images.length >= MAX_IMAGES) {
        setGlobalMessage({ type: 'error', text: `已达到 ${MAX_IMAGES} 张图片上限。` });
        return;
    }

    const droppedFiles: File[] = [];
    const items = e.dataTransfer.items;
    
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            droppedFiles.push(file);
          }
        }
      }
    } else {
        const files = e.dataTransfer.files;
        for (let i = 0; i < files.length; i++) {
            if (files[i].type.startsWith('image/')) {
                droppedFiles.push(files[i]);
            }
        }
    }

    if (droppedFiles.length > 0) {
        processFiles(droppedFiles);
    }
  };

  useEffect(() => {
    // 关键点 4: 移除 localStorage 读取，确保每次刷新都是初始状态
    // const saved = localStorage.getItem('koutu_images');
    // if (saved) { setImages(JSON.parse(saved)); }

    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      const pastedFiles: File[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          event.preventDefault(); 
          const blob = item.getAsFile();
          if (blob) {
            const newFile = new File([blob], `Pasted_Image_${Date.now()}.png`, { type: blob.type });
            pastedFiles.push(newFile);
          }
        }
      }

      if (pastedFiles.length > 0) {
        processFiles(pastedFiles);
      }
    };

    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('paste', handlePaste);
      // 关键点 5: 在组件卸载时，释放所有本地 Blob URL 占用的内存
      images.forEach(item => URL.revokeObjectURL(item.url));
    };
  }, []); 

  // 关键点 6: 移除 localStorage 写入，不再持久化状态
  // useEffect(() => { localStorage.setItem('koutu_images', JSON.stringify(images)); }, [images]);

  const hasPendingImages = images.some(img => img.status === '待抠图' || img.status === '抠图中');
  const uploadedCount = images.length;
  const primaryBg = 'bg-blue-600 hover:bg-blue-700';
  const dropZoneBorderClass = isDragging ? 'border-blue-500 ring-4 ring-blue-200' : 'border-gray-200';

  return (
    // ... (JSX 结构与之前完全相同) ...
    <div className="space-y-10">
      
      {/* 初始状态展示区：同时作为拖放区域 */}
      {uploadedCount === 0 && (
        <div 
            ref={dropZoneRef} 
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop} 
            className={`bg-white rounded-3xl shadow-xl p-6 border-4 border-dashed transition-all duration-300 ${dropZoneBorderClass}`}
        >
            <h2 className="text-3xl font-bold text-gray-800 mb-2 mt-4 text-center">
                全自动智能抠图
            </h2>
            <p className="text-gray-500 mb-8 text-center">
                免费在线抠图，支持所有场景的图片抠图，全程自动3秒即可抠好一张图
            </p>
            
            <div className="flex flex-col lg:flex-row items-center justify-center p-8 lg:p-16 space-y-8 lg:space-x-12">
                {/* 左侧：示例图片 */}
                <div className="w-full max-w-sm flex-shrink-0">
                    <div className="relative pt-[100%] border-4 border-dashed border-gray-200 rounded-xl overflow-hidden shadow-lg">
                        <Image src="/sample-image.png" alt="抠图示例" fill style={{objectFit: 'contain'}} className="p-4" unoptimized />
                    </div>
                </div>

                {/* 右侧：上传按钮和提示 */}
                <div className="w-full max-w-sm space-y-4 text-center lg:text-left flex flex-col items-center lg:items-start">
                    <button 
                        className={`flex items-center justify-center space-x-2 px-8 py-3 text-lg font-semibold rounded-lg text-white ${primaryBg} transition-colors shadow-lg`}
                        onClick={handleTriggerUpload} 
                    >
                        <Cloud className="w-6 h-6" />
                        <span>上传图片</span>
                    </button>
                    <p className="text-gray-500 text-sm mt-2">
                        Ctrl+V **粘贴图片**，或者把图片**拖拽**到这里！
                    </p>
                    <p className="text-gray-500 text-sm">
                        一次最多 {MAX_IMAGES} 张图片。
                    </p>
                </div>
            </div>
        </div>
      )}

      {/* 状态反馈和已上传列表区 */}
      {uploadedCount > 0 && (
        <div 
            ref={dropZoneRef} 
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop} 
            className={`bg-white rounded-3xl shadow-xl p-6 border-4 border-dashed transition-all duration-300 ${dropZoneBorderClass}`}
        >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                已选图片 ({uploadedCount} / {MAX_IMAGES})
            </h2>
            
            {globalMessage && (
                <div className={`p-3 mb-4 rounded-lg text-sm font-medium ${globalMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {globalMessage.text}
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map(item => (
                    <ImageGridItem key={item.id} item={item} onDelete={handleDelete} />
                ))}

                {/* 添加图片占位按钮 */}
                {uploadedCount < MAX_IMAGES && (
                    <button 
                        onClick={handleTriggerUpload}
                        className="relative w-full pt-[100%] border-4 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-600 transition-colors"
                    >
                        <Plus className="w-8 h-8 absolute inset-0 m-auto" />
                        <span className="absolute bottom-5 text-sm font-medium">添加图片</span>
                    </button>
                )}
            </div>
            
            {/* 开始抠图按钮 */}
            <div className="flex justify-center mt-8">
                <button
                    onClick={handleStartKoutu}
                    disabled={!hasPendingImages || isPending}
                    className={`px-12 py-3 text-lg font-semibold rounded-lg text-white transition-colors shadow-lg 
                        ${!hasPendingImages || isPending ? 'bg-gray-400 cursor-not-allowed' : primaryBg}`}
                >
                    {isPending ? '任务处理中...' : '开始抠图'}
                </button>
            </div>
        </div>
      )}

      {/* 隐藏的文件输入框 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        multiple
      />
    </div>
  );
}