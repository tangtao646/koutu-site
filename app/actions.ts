// app/actions.ts (保留 S3 预签名 URL 生成功能)
'use server';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

/**
 * 生成一个预签名 URL，用于客户端直传文件到 S3。
 */
export async function getPresignedUploadUrlAction(fileName: string, fileType: string) {
  const fileKey = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${fileName}`;
  const putCommand = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
  });

  try {
    const uploadUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 60, // 60秒有效期
    });

    const imageUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    return { success: true, uploadUrl, imageUrl, message: '成功生成上传 URL。' };
  } catch (error) {
    console.error('生成预签名 URL 失败:', error);
    return { success: false, message: '无法准备上传。' };
  }
}

// 抠图模拟函数：实际项目中这里是调用抠图 API
export async function startBatchKoutuAction(imageUrls: string[]) {
    console.log(`开始为 ${imageUrls.length} 张图片抠图...`);
    // 实际项目中：调用后台抠图 API，等待结果
    await new Promise(resolve => setTimeout(resolve, 3000)); // 模拟网络延迟
    return { success: true, message: `已成功模拟开始 ${imageUrls.length} 个抠图任务。` };
}