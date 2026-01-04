import { Response } from 'express';
import { AppDataSource } from '../utils/database';
import { PageVisit, PerformanceMetric, DailyStat, Project } from '../entities';
import { AuthRequest } from '../middlewares';
import { successResponse, errorResponse } from '../utils/response';

const projectRepository = AppDataSource.getRepository(Project);
const pageVisitRepository = AppDataSource.getRepository(PageVisit);
const performanceMetricRepository = AppDataSource.getRepository(PerformanceMetric);
const dailyStatRepository = AppDataSource.getRepository(DailyStat);

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { projectId } = req.params;
    const { days = 7 } = req.query;

    const project = await projectRepository.findOne({
      where: { id: projectId, userId },
    });

    if (!project) {
      res.status(404).json(errorResponse('Project not found', 'Not Found'));
      return;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const stats = await dailyStatRepository
      .createQueryBuilder('stat')
      .where('stat.projectId = :projectId', { projectId })
      .andWhere('stat.statDate >= :startDate', { startDate: startDate.toISOString().split('T')[0] })
      .andWhere('stat.statDate <= :endDate', { endDate: endDate.toISOString().split('T')[0] })
      .orderBy('stat.statDate', 'ASC')
      .getMany();

    const totalPageViews = stats.reduce((sum, stat) => sum + stat.pageViews, 0);
    const totalUniqueVisitors = stats.reduce((sum, stat) => sum + stat.uniqueVisitors, 0);
    const avgLoadTime = stats.length > 0
      ? stats.reduce((sum, stat) => sum + stat.avgPageLoadTime, 0) / stats.length
      : 0;

    // Real-time visitors (last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const realTimeVisitors = await pageVisitRepository
      .createQueryBuilder('visit')
      .select('DISTINCT visit.sessionId', 'sessionId')
      .where('visit.projectId = :projectId', { projectId })
      .andWhere('visit.createdAt >= :time', { time: thirtyMinutesAgo })
      .getCount();

    res.json(
      successResponse(
        {
          totalPageViews,
          totalUniqueVisitors,
          avgLoadTime: Math.round(avgLoadTime * 100) / 100,
          realTimeVisitors,
          dailyStats: stats,
        },
        'Dashboard stats retrieved successfully'
      )
    );
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json(errorResponse('Internal server error', 'Error'));
  }
};

export const getPageStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { projectId } = req.params;
    const { startDate, endDate, limit = 10 } = req.query;

    const project = await projectRepository.findOne({
      where: { id: projectId, userId },
    });

    if (!project) {
      res.status(404).json(errorResponse('Project not found', 'Not Found'));
      return;
    }

    const queryBuilder = pageVisitRepository
      .createQueryBuilder('visit')
      .select('visit.pageUrl', 'url')
      .addSelect('visit.pageTitle', 'title')
      .addSelect('COUNT(*)', 'views')
      .addSelect('COUNT(DISTINCT visit.sessionId)', 'uniqueVisitors')
      .where('visit.projectId = :projectId', { projectId });

    if (startDate) {
      queryBuilder.andWhere('visit.visitDate >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('visit.visitDate <= :endDate', { endDate });
    }

    const pages = await queryBuilder
      .groupBy('visit.pageUrl, visit.pageTitle')
      .orderBy('views', 'DESC')
      .limit(Number(limit))
      .getRawMany();

    res.json(
      successResponse(
        pages.map((p: any) => ({
          url: p.url,
          title: p.title,
          views: parseInt(p.views),
          uniqueVisitors: parseInt(p.uniqueVisitors),
        })),
        'Page stats retrieved successfully'
      )
    );
  } catch (error) {
    console.error('Get page stats error:', error);
    res.status(500).json(errorResponse('Internal server error', 'Error'));
  }
};

export const getPerformanceStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { projectId } = req.params;
    const { startDate, endDate } = req.query;

    const project = await projectRepository.findOne({
      where: { id: projectId, userId },
    });

    if (!project) {
      res.status(404).json(errorResponse('Project not found', 'Not Found'));
      return;
    }

    const queryBuilder = performanceMetricRepository
      .createQueryBuilder('metric')
      .select('metric.pageUrl', 'url')
      .addSelect('AVG(metric.pageLoadTime)', 'avgLoadTime')
      .addSelect('AVG(metric.domContentLoadedTime)', 'avgDomTime')
      .addSelect('AVG(metric.firstPaint)', 'avgFirstPaint')
      .addSelect('AVG(metric.firstContentfulPaint)', 'avgFCP')
      .addSelect('COUNT(*)', 'samples')
      .where('metric.projectId = :projectId', { projectId });

    if (startDate) {
      queryBuilder.andWhere('metric.metricDate >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('metric.metricDate <= :endDate', { endDate });
    }

    const stats = await queryBuilder
      .groupBy('metric.pageUrl')
      .orderBy('avgLoadTime', 'DESC')
      .getRawMany();

    res.json(
      successResponse(
        stats.map((s: any) => ({
          url: s.url,
          avgLoadTime: Math.round(s.avgLoadTime * 100) / 100,
          avgDomTime: Math.round(s.avgDomTime * 100) / 100,
          avgFirstPaint: Math.round(s.avgFirstPaint * 100) / 100,
          avgFCP: Math.round(s.avgFCP * 100) / 100,
          samples: parseInt(s.samples),
        })),
        'Performance stats retrieved successfully'
      )
    );
  } catch (error) {
    console.error('Get performance stats error:', error);
    res.status(500).json(errorResponse('Internal server error', 'Error'));
  }
};

export const getVisitorStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { projectId } = req.params;

    const project = await projectRepository.findOne({
      where: { id: projectId, userId },
    });

    if (!project) {
      res.status(404).json(errorResponse('Project not found', 'Not Found'));
      return;
    }

    // Browser stats
    const browserStats = await pageVisitRepository
      .createQueryBuilder('visit')
      .select("JSON_UNQUOTE(JSON_EXTRACT(visit.browserInfo, '$.name'))", 'browser')
      .addSelect('COUNT(*)', 'count')
      .where('visit.projectId = :projectId', { projectId })
      .groupBy('browser')
      .orderBy('count', 'DESC')
      .getRawMany();

    // OS stats
    const osStats = await pageVisitRepository
      .createQueryBuilder('visit')
      .select("JSON_UNQUOTE(JSON_EXTRACT(visit.osInfo, '$.name'))", 'os')
      .addSelect('COUNT(*)', 'count')
      .where('visit.projectId = :projectId', { projectId })
      .groupBy('os')
      .orderBy('count', 'DESC')
      .getRawMany();

    // Screen resolution stats
    const screenStats = await pageVisitRepository
      .createQueryBuilder('visit')
      .select("CONCAT(JSON_UNQUOTE(JSON_EXTRACT(visit.screenInfo, '$.width')), 'x', JSON_UNQUOTE(JSON_EXTRACT(visit.screenInfo, '$.height')))", 'resolution')
      .addSelect('COUNT(*)', 'count')
      .where('visit.projectId = :projectId', { projectId })
      .groupBy('resolution')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    res.json(
      successResponse(
        {
          browsers: browserStats.map((s: any) => ({ name: s.browser || 'Unknown', count: parseInt(s.count) })),
          os: osStats.map((s: any) => ({ name: s.os || 'Unknown', count: parseInt(s.count) })),
          screens: screenStats.map((s: any) => ({ resolution: s.resolution, count: parseInt(s.count) })),
        },
        'Visitor stats retrieved successfully'
      )
    );
  } catch (error) {
    console.error('Get visitor stats error:', error);
    res.status(500).json(errorResponse('Internal server error', 'Error'));
  }
};
