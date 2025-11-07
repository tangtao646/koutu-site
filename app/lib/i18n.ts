// app/lib/i18n.ts

/**
 * 消息结构定义 (确保所有语言结构一致)
 */
export interface Messages {
  Navigation: {
    title: string;
    domain: string;
  };
  General: {
    // 接受 MAX_COUNT 变量，返回完整的句子
    maxImageLimit: (maxCount: number) => string;
  };
  Welcome: {
    title: string;
    loginButton: string;
    registerButton: string
    description: string;
  };
  Portal: {
    selectImage: string;
    selectedImage: string;
    dragDropHint: string;
    addImages: string;
    startProcessing: string;
    isProcessing: string;
    confirmDeleteTitle: string;
    confirmDeleteMessage: (name: string) => string;
    cancelButton: string;
    confirmButton: string;
    cropButton: string;
    deleteButton: string;
  };
  Editor: {
    cropButton: string;
    resetButton: string;
    resetDescription?: string;
    cancelButton: string;
    saving: string;
    saveButton: string;
  };
  Status: {
    pending: string;
    processing: string;
    completed: string;
  };
}

// ==========================================================
// 1. 简体中文 (zh-CN) 消息
// ==========================================================
const zhCNMessages: Messages = {
  Navigation: {
    title: "抠图快手",
    domain: "koutukuai.com",
  },
  General: {
    maxImageLimit: (maxCount) => `一次最多 ${maxCount} 张图片。`,
  },
  Welcome: {
    title: "全自动智能抠图",
    loginButton: "登录",
    registerButton: "注册",
    description: "在线抠图，支持所有场景的图片抠图，全程自动3秒即可抠好一张图。",
  },
  Portal: {
    selectImage: "选择图片",
    selectedImage: "已选图片",
    dragDropHint: " Ctrl+V **粘贴图片**，或者把图片**拖拽**到这里！",
    addImages: `添加图片`,
    startProcessing: `开始抠图 `,
    isProcessing: "任务处理中...",
    confirmDeleteTitle: "确认删除",
    confirmDeleteMessage: (name) => `您确定要删除图片 ${name} 吗？此操作不可撤销。`,
    cancelButton: "取消",
    confirmButton: "确定删除",
    cropButton: "裁剪图片",
    deleteButton: "删除图片",
  },
  Editor: {
    cropButton: "图片裁剪",
    resetButton: "重置",
    resetDescription: "重置裁剪区域 (恢复初始边距)",
    cancelButton: "取消",
    saving: "保存中...",
    saveButton: "保存",
  },  
  Status: {
    pending: "待抠图",
    processing: "抠图中",
    completed: "抠图完毕",
  },
};

// ==========================================================
// 2. 英文 (en) 消息
// ==========================================================
const enMessages: Messages = {
  Navigation: {
    title: "Remove bg Fast",
    domain: "koutukuai.com",
  },
  General: {
    maxImageLimit: (maxCount) => `Maximum ${maxCount} images allowed at once.`,
  },
  Welcome: {
    title: "Start Your Batch Processing Journey",
    loginButton: "Log in",
    registerButton: "Sign up",
    description: "Online background removal, supporting all scenarios of image background removal, fully automatic and fast.",
  },
  Portal: {
    selectImage: "Select Images",
    selectedImage: "Selected Images",
    dragDropHint: " Paste images with Ctrl+V or drag and drop them here!",
    addImages: "Add Images",
    startProcessing: "Start Processing",
    isProcessing: "Processing...",
    confirmDeleteTitle: "Confirm Deletion",
    confirmDeleteMessage: (name) => `Are you sure you want to delete ${name}? This action cannot be undone.`,
    cancelButton: "Cancel",
    cropButton: "Crop Image",
    confirmButton: "Confirm Delete",
    deleteButton: "Delete Image",
  },
  Editor: {
    cropButton: "Crop Image",
    resetButton: "Reset",
    resetDescription: "Reset crop area (restore initial margins)",
    cancelButton: "Cancel",
    saving: "Saving...",
    saveButton: "Save",
  },
  Status: {
    pending: "Pending",
    processing: "Processing",
    completed: "Completed",
  },
};

/**
 * 语言映射表
 */
export const dictionaries = {
  'zh-CN': zhCNMessages,
  'en': enMessages,
};

/**
 * 默认语言
 */
export const defaultLocale = 'zh-CN';

/**
 * 获取翻译信息的函数 (模拟 useTranslations)
 * @param locale 当前语言
 * @returns 对应语言的消息对象
 */
export const getDictionary = (locale: keyof typeof dictionaries = defaultLocale): Messages => {
  return dictionaries[locale] || dictionaries[defaultLocale];
};

/**
 * 类型安全的状态映射函数 (用于状态文本)
 * @param status 状态键名
 * @param locale 当前语言
 * @returns 对应的翻译文本
 */
export const translateStatus = (
  status: keyof Messages['Status'],
  locale: keyof typeof dictionaries = defaultLocale
): string => {
  return getDictionary(locale).Status[status];
};

/**
 * 动态获取浏览器首选语言，并映射到我们支持的语言
 * * @returns 支持的语言键名 (keyof typeof dictionaries)
 */
export const getInitialLocale = (): keyof typeof dictionaries => {
    // 1. 检查浏览器是否支持 navigator (防止 SSR 报错)
    if (typeof window === 'undefined' || !navigator.language) {
        return defaultLocale;
    }
    
    // 2. 获取浏览器首选语言，并转换为小写，例如 "en-US" -> "en-us"
    const browserLang = navigator.language.toLowerCase();

    // 3. 检查是否直接匹配我们支持的语言 (例如 'zh-cn' 或 'en')
    if (dictionaries.hasOwnProperty(browserLang)) {
        // 强制转换为正确的类型并返回
        return browserLang as keyof typeof dictionaries;
    }
    
    // 4. 检查是否匹配语言族群 (例如 'en-us' 匹配 'en')
    const langFamily = browserLang.split('-')[0];
    if (dictionaries.hasOwnProperty(langFamily)) {
        // 强制转换为正确的类型并返回
        return langFamily as keyof typeof dictionaries;
    }

    // 5. 无法匹配，则回退到默认语言
    return defaultLocale;
};