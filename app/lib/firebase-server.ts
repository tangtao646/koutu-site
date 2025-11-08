import { initializeApp, getApps, applicationDefault, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ⚠️ IMPORTANT:
// 1. 请在 Firebase Console -> Project Settings -> Service Accounts 页面生成并下载服务账号 JSON 文件。
// 2. 将 JSON 文件内容粘贴到 Vercel 环境变量 VERCEL_FIREBASE_SERVICE_ACCOUNT 中。

// 检查是否已经初始化，避免热重载时重复初始化
if (!getApps().length) {
    try {
        // 尝试从环境变量中加载服务账号 JSON 字符串
        const serviceAccountJson = process.env.VERCEL_FIREBASE_SERVICE_ACCOUNT;
        
        if (serviceAccountJson) {
            // 解析 JSON 字符串
            const serviceAccount = JSON.parse(serviceAccountJson);

            initializeApp({
                // 显式使用服务账号凭据
                credential: cert(serviceAccount), 
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, 
            });
        } else {
             // 如果环境变量不存在，则尝试使用默认凭证 (适用于本地或其他GCP环境)
             initializeApp({
                credential: applicationDefault(), 
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, 
            });
        }
        
    } catch (error) {
        console.error("Firebase Admin initialization error. Check VERCEL_FIREBASE_SERVICE_ACCOUNT:", error);
    }
}

// 导出 Admin Firestore 实例，供 NextAuth 适配器在服务器端使用
const adminDb = getFirestore();

export { adminDb };