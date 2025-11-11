export type MemorialApplicationState = 'APPROVED' | 'REJECTED' | 'PENDING';

export interface MemorialApplication {
  memorialApplicationId: number;
  userId: string;
  characterId: number;
  content: string;
  createdAt: string;
  state: MemorialApplicationState;
  likes: number;
  userDidLike?: boolean;
}

export interface MemorialApplicationResponse {
  userId: string;
  characterId: number;
  content: string;
  createdAt: string;
  state: MemorialApplicationState;
  likes: number;
  userDidLike: boolean;
}

export interface MemorialApplicationListResponse {
  userId: string;
  characterId: number;
  content: string;
  createdAt: string;
  state: MemorialApplicationState;
  likes: number;
  memorialApplicationId: number;
}

export interface MemorialApplicationsPagedResponse {
  values: MemorialApplicationListResponse[];
  hasNext: boolean;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface MemorialApplicationUpdateRequest {
  content: string;
}

export interface MemorialApplicationFilters {
  cursorId?: number;
  size?: number;
  memorizingCode?: 1 | 2 | 3; // 1: APPROVED, 2: REJECTED, 3: PENDING
  characterId?: number;
  userId?: string;
}