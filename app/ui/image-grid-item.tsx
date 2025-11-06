// app/ui/image-grid-item.tsx
'use client'; // 💥 需要使用客户端状态

import Image from 'next/image';
import { Trash2, CropIcon, X } from 'lucide-react'; // 引入 X 用于模态框
import { useState } from 'react';
import { ImageItem } from '@/app/lib/types'; // 确保 ImageItem 定义正确

interface ImageGridItemProps {
  item: ImageItem;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export default function ImageGridItem({ item, onDelete, onEdit }: ImageGridItemProps) {
  // 💥 NEW: 状态管理确认删除对话框的显示
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const statusColors = {
    '待抠图': 'bg-blue-100 text-blue-600',
    '抠图中': 'bg-yellow-100 text-yellow-600 animate-pulse',
    '抠图完毕': 'bg-green-100 text-green-600',
  };

  const handleDeleteClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    onDelete(item.id);
    setShowConfirmModal(false);
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
  };

  return (
    <>
      {/* 图片卡片主体 */}
      <div className="relative group w-full pt-[100%] rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 bg-white border border-gray-200">

        {/* 图片展示区 */}
        <div className="absolute inset-0 p-3 flex items-center justify-center">
          <Image
            src={item.url}
            alt={item.name}
            fill
            sizes="25vw"
            className="object-contain"
          />
        </div>

        {/* 按钮容器：包括编辑和删除 */}
        {item.status !== '抠图中' && (
          <div className="absolute top-1 right-1 flex space-x-1 z-10 opacity-100">

            {/* 编辑按钮 */}
            <button
              onClick={() => onEdit(item.id)}
              className="p-1 bg-blue-500 text-white rounded-full transition-colors hover:bg-blue-700"
              title="编辑图片"
            >
              <CropIcon className="w-4 h-4" />
            </button>

            {/* 删除按钮 💥 (点击时打开模态框) */}
            <button
              onClick={handleDeleteClick}
              className="p-1 bg-red-500 text-white rounded-full transition-colors hover:bg-red-700"
              title="删除图片"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 底部信息 (保持不变) */}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-white bg-opacity-90 border-t border-gray-100 rounded-b-lg text-xs space-y-0.5">

          {/* 名称 */}
          <p className="font-semibold text-gray-800 truncate" title={item.name}>{item.name}</p>

          {/* 分辨率 和 状态 (两端对齐) */}
          <div className="flex justify-between items-center">

            {/* 分辨率 (在前) */}
            <p className="text-gray-500 whitespace-nowrap">
              {item.width}x{item.height} px
            </p>

            {/* 状态 (在后) */}
            <span className={`px-2 py-0.5 rounded-full font-medium ${statusColors[item.status]} whitespace-nowrap`}>
              {item.status}
            </span>
          </div>

        </div>
      </div>

      {/* 💥 删除确认对话框 (Modal) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/10  backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full transform transition-all">
            
            {/* 头部 */}
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-lg font-bold text-red-600">确认删除</h3>
              <button onClick={handleCancelDelete} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* 内容 */}
            <p className="text-gray-700 mb-6">
              您确定要删除图片 **{item.name}** 吗？此操作不可撤销。
            </p>
            
            {/* 底部操作按钮 */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                确定删除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}