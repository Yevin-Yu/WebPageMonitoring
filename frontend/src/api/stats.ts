import request from './request';

export interface DashboardStats {
  totalPageViews: number;
  totalUniqueVisitors: number;
  avgLoadTime: number;
  realTimeVisitors: number;
  dailyStats: DailyStat[];
}

export interface DailyStat {
  statDate: string;
  pageViews: number;
  uniqueVisitors: number;
  avgPageLoadTime: number;
}

export interface PageStat {
  url: string;
  title: string;
  views: number;
  uniqueVisitors: number;
}

export interface PerformanceStat {
  url: string;
  avgLoadTime: number;
  avgDomTime: number;
  avgFirstPaint: number;
  avgFCP: number;
  samples: number;
}

export interface VisitorStats {
  browsers: Array<{ name: string; count: number }>;
  os: Array<{ name: string; count: number }>;
  screens: Array<{ resolution: string; count: number }>;
}

export const statsApi = {
  getDashboardStats(projectId: string, days: number = 7) {
    return request.get<any, DashboardStats>(`/stats/dashboard/${projectId}`, {
      params: { days },
    });
  },

  getPageStats(projectId: string, params?: { startDate?: string; endDate?: string; limit?: number }) {
    return request.get<any, PageStat[]>(`/stats/pages/${projectId}`, { params });
  },

  getPerformanceStats(projectId: string, params?: { startDate?: string; endDate?: string }) {
    return request.get<any, PerformanceStat[]>(`/stats/performance/${projectId}`, { params });
  },

  getVisitorStats(projectId: string) {
    return request.get<any, VisitorStats>(`/stats/visitors/${projectId}`);
  },
};
