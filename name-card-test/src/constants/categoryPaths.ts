export const CATEGORY_PATH_MAP = {
    'audio-visual': '/audio-visual-card',
    'design': '/design-card',
    'development': '/development-card',
    'marketing': '/marketing-card',
    'consulting': '/consulting-card',
} as const;

// TypeScript 타입 안전성을 위한 타입 정의
export type CardCategory = keyof typeof CATEGORY_PATH_MAP; 