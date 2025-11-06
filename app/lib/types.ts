// app/lib/types.ts

// 定义图片状态
export type ImageStatus = '待抠图' | '抠图中' | '抠图完毕' | '上传失败';

// 定义图片项目的数据结构
export interface ImageItem {
  id: string;
  name: string;
  url: string; // S3 或本地 Blob URL
  s3Key?: string; // S3 文件路径
  width: number;
  height: number;
  status: ImageStatus;
}