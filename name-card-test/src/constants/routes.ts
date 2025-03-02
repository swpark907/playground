// 라우트 경로를 상수로 관리
export const ROUTES = {
  // 메인
  HOME: '/',
  
  // 인증 관련
  LOGIN: '/login',
  REGISTER: '/register',
  
  // 사용자 관련
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  // 게시판 관련 
  BOARD: '/board',
  BOARD_DETAIL: '/board/:id',
  BOARD_WRITE: '/board/write',
  
  // 에러 페이지
  NOT_FOUND: '/404',
} as const;

// 타입 안전성을 위한 타입 정의
export type RoutePathType = typeof ROUTES[keyof typeof ROUTES]; 