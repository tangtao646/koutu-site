// app/lib/types.ts

// 定义图片状态
export type ImageStatus = '待抠图' | '抠图中' | '抠图完毕' ;

// 定义图片项目的数据结构
export interface ImageItem {
  id: string;
  name: string;
  url: string; // S3 或本地 Blob URL (当前展示的图片)
  s3Key?: string; // S3 文件路径
  width: number;
  height: number;
  status: ImageStatus;
  
  // 核心改动：存储原始 File 对象，用于编辑
  fileObject: File; 
}