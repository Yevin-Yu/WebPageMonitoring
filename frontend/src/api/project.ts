import request from './request';

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  website?: string;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectParams {
  name: string;
  description?: string;
  website?: string;
}

export interface UpdateProjectParams {
  name?: string;
  description?: string;
  website?: string;
  isActive?: boolean;
}

export const projectApi = {
  getProjects(params?: { page?: number; limit?: number; search?: string }) {
    return request.get<any, any>('/projects', { params });
  },

  getProjectById(id: string) {
    return request.get<any, Project>(`/projects/${id}`);
  },

  createProject(data: CreateProjectParams) {
    return request.post<any, Project>('/projects', data);
  },

  updateProject(id: string, data: UpdateProjectParams) {
    return request.put<any, Project>(`/projects/${id}`, data);
  },

  deleteProject(id: string) {
    return request.delete<any, any>(`/projects/${id}`);
  },

  getProjectStats(id: string, params?: { startDate?: string; endDate?: string }) {
    return request.get<any, any>(`/projects/${id}/stats`, { params });
  },
};
