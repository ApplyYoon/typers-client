import { api } from './client';

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  level: number;
  initial_cpm: number;
  rank_score: number;   // 배틀 랭크 포인트 (기본 1000)
}

export const authApi = {
  register: (username: string, email: string, password: string) =>
    api.post<UserResponse>('/auth/register', { username, email, password }),

  login: (username: string, password: string) =>
    api.post<UserResponse>('/auth/login', { username, password }),

  logout: () => api.post<{ ok: boolean }>('/auth/logout', {}),

  me: () => api.get<UserResponse>('/auth/me'),

  updateLevel: (level: number, initial_cpm: number) =>
    api.patch<UserResponse>('/auth/level', { level, initial_cpm }),
};
