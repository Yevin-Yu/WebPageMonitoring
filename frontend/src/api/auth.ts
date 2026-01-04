import request from './request';

export interface LoginParams {
  username: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  login(data: LoginParams) {
    return request.post<any, AuthResponse>('/auth/login', data);
  },

  register(data: RegisterParams) {
    return request.post<any, AuthResponse>('/auth/register', data);
  },

  getCurrentUser() {
    return request.get<any, User>('/auth/me');
  },

  updateProfile(data: Partial<User>) {
    return request.put('/auth/profile', data);
  },

  changePassword(data: { currentPassword: string; newPassword: string }) {
    return request.put('/auth/password', data);
  },
};
