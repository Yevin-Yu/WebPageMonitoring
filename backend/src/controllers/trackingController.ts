import { Response } from 'express';
import { AppDataSource } from '../utils/database';
import { PageVisit, PerformanceMetric, DailyStat } from '../entities';
import { successResponse } from '../utils/response';

const pageVisitRepository = AppDataSource.getRepository(PageVisit);
const performanceMetricRepository = AppDataSource.getRepository(PerformanceMetric);
const dailyStatRepository = AppDataSource.getRepository(DailyStat);

export const trackPageView = async (req: any, res: Response): Promise<void> => {
  try {
    const { key } = req.query;
    const {
      sessionId,
      pageUrl,
      pageTitle,
      referrer,
      userAgent,
      screenInfo,
      browserInfo,
      osInfo,
    } = req.body;

    const visit = pageVisitRepository.create({
      projectId: key,
      sessionId,
      pageUrl,
      pageTitle,
      referrer: referrer || '',
      userAgent,
      screenInfo,
      browserInfo,
      osInfo,
      visitDate: new Date(),
      visitTime: new Date().toTimeString().split(' ')[0],
    });

    await pageVisitRepository.save(visit);

    // Update daily stats (async)
    updateDailyStats(key, new Date()).catch(err => console.error('Daily stats update error:', err));

    res.json(successResponse({ tracked: true }, 'Page view tracked'));
  } catch (error) {
    console.error('Track page view error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const trackPerformance = async (req: any, res: Response): Promise<void> => {
  try {
    const { key } = req.query;
    const {
      sessionId,
      pageUrl,
      pageLoadTime,
      domContentLoadedTime,
      firstPaint,
      firstContentfulPaint,
      resourceCount,
      errorCount,
      resources,
      errors,
    } = req.body;

    const metric = performanceMetricRepository.create({
      projectId: key,
      sessionId,
      pageUrl,
      pageLoadTime,
      domContentLoadedTime,
      firstPaint,
      firstContentfulPaint,
      resourceCount,
      errorCount,
      resources,
      errors,
      metricDate: new Date(),
    });

    await performanceMetricRepository.save(metric);

    res.json(successResponse({ tracked: true }, 'Performance tracked'));
  } catch (error) {
    console.error('Track performance error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

async function updateDailyStats(projectId: string, date: Date): Promise<void> {
  try {
    const dateStr = date.toISOString().split('T')[0];

    let dailyStat = await dailyStatRepository.findOne({
      where: { projectId, statDate: dateStr as any },
    });

    if (!dailyStat) {
      dailyStat = dailyStatRepository.create({
        projectId,
        statDate: dateStr as any,
        pageViews: 0,
        uniqueVisitors: 0,
        sessions: 0,
        avgPageLoadTime: 0,
        avgDomContentLoadedTime: 0,
        bounceRate: 0,
      });
    }

    // Get page views for today
    const pageViews = await pageVisitRepository
      .createQueryBuilder('visit')
      .where('visit.projectId = :projectId', { projectId })
      .andWhere('visit.visitDate = :date', { date: dateStr })
      .getCount();

    // Get unique visitors
    const uniqueVisitors = await pageVisitRepository
      .createQueryBuilder('visit')
      .select('DISTINCT visit.sessionId', 'sessionId')
      .where('visit.projectId = :projectId', { projectId })
      .andWhere('visit.visitDate = :date', { date: dateStr })
      .getCount();

    // Get average load time
    const performanceData = await performanceMetricRepository
      .createQueryBuilder('metric')
      .select('AVG(metric.pageLoadTime)', 'avgLoadTime')
      .addSelect('AVG(metric.domContentLoadedTime)', 'avgDomTime')
      .where('metric.projectId = :projectId', { projectId })
      .andWhere('metric.metricDate = :date', { date: dateStr })
      .getRawOne();

    // Get top pages
    const topPagesData = await pageVisitRepository
      .createQueryBuilder('visit')
      .select('visit.pageUrl', 'url')
      .addSelect('visit.pageTitle', 'title')
      .addSelect('COUNT(*)', 'views')
      .where('visit.projectId = :projectId', { projectId })
      .andWhere('visit.visitDate = :date', { date: dateStr })
      .groupBy('visit.pageUrl, visit.pageTitle')
      .orderBy('views', 'DESC')
      .limit(10)
      .getRawMany();

    dailyStat.pageViews = pageViews;
    dailyStat.uniqueVisitors = uniqueVisitors;
    dailyStat.sessions = uniqueVisitors;
    dailyStat.avgPageLoadTime = performanceData?.avgLoadTime || 0;
    dailyStat.avgDomContentLoadedTime = performanceData?.avgDomTime || 0;
    dailyStat.topPages = topPagesData.map((p: any) => ({
      url: p.url,
      title: p.title,
      views: parseInt(p.views),
    }));

    await dailyStatRepository.save(dailyStat);
  } catch (error) {
    console.error('Update daily stats error:', error);
  }
}
