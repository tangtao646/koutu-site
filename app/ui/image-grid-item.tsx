// app/ui/image-grid-item.tsx
import Image from 'next/image';
import { X } from 'lucide-react';
import { ImageItem } from '@/app/lib/types';

interface ImageGridItemProps {
  item: ImageItem;
  onDelete: (id: string) => void;
}

export default function ImageGridItem({ item, onDelete }: ImageGridItemProps) {
  const statusColors = {
    '待抠图': 'bg-blue-100 text-blue-600',
    '抠图中': 'bg-yellow-100 text-yellow-600 animate-pulse',
    '抠图完毕': 'bg-green-100 text-green-600',
    //'上传失败': 'bg-red-100 text-red-600',
  };

  return (
    <div className="relative group w-full pt-[100%] rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 bg-white border border-gray-200">
      
      {/* 图片展示区 */}
      <div className="absolute inset-0 p-3 flex items-center justify-center">
        <Image
          src={item.url}
          alt={item.name}
          fill
          sizes="25vw"
          // 注意：如果您之前没有导入，需要在此文件顶部添加：import Image from 'next/image';
          className="object-contain"
        />
      </div>

      {/* 删除按钮 */}
      {item.status !== '抠图中' && (
        <button
          onClick={() => onDelete(item.id)}
          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-700"
          title="删除图片"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* 底部信息 (修正区域) */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-white bg-opacity-90 border-t border-gray-100 rounded-b-lg text-xs space-y-0.5">
        
        {/* 名称 (保持单行) */}
        <p className="font-semibold text-gray-800 truncate" title={item.name}>{item.name}</p>
        
        {/* 分辨率 和 状态 (新的布局：两端对齐) */}
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
  );
}