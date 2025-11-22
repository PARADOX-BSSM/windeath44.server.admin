export interface User {
  userId: string;
  email: string;
  name: string;
  remainToken: number;
  profile: string;
  role: 'ADMIN' | 'CHIEF' | 'USER' | 'TESTER' | 'ANONYMOUS';
  createdAt: string;
}

export interface UserResponse {
  userId: string;
  name: string;
  remainToken: number;
  profile: string;
  role: string;
}

export interface UserListResponse {
  content: User[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  totalUserCount: number;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface UserCreateRequest {
  userId: string;
  email: string;
  name: string;
  password: string;
}

export interface UserDeleteRequest {
  userId: string;
}

export interface PasswordResetRequest {
  email: string;
  password: string;
}

export interface UserIdRetrievalRequest {
  email: string;
  password: string;
}

export interface NameChangeRequest {
  name: string;
}

export type UserRole = 'ADMIN' | 'CHIEF' | 'USER' | 'TESTER' | 'ANONYMOUS';