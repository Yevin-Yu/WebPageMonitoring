import { Response } from 'express';
import { AppDataSource } from '../utils/database';
import { Project } from '../entities';
import { AuthRequest } from '../middlewares';
import { successResponse, errorResponse } from '../utils/response';
import { v4 as uuidv4 } from 'uuid';

const projectRepository = AppDataSource.getRepository(Project);

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { name, description, website } = req.body;

    // Generate unique key
    const key = uuidv4();

    const project = projectRepository.create({
      name,
      key,
      description,
      website,
      userId,
    });

    await projectRepository.save(project);

    res.status(201).json(successResponse(project, 'Project created successfully'));
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json(errorResponse('Internal server error', 'Create Failed'));
  }
};

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { page = 1, limit = 10, search } = req.query;

    const queryBuilder = projectRepository
      .createQueryBuilder('project')
      .where('project.userId = :userId', { userId })
      .orderBy('project.createdAt', 'DESC');

    if (search) {
      queryBuilder.andWhere('project.name LIKE :search', { search: `%${search}%` });
    }

    const [projects, total] = await queryBuilder
      .skip((Number(page) - 1) * Number(limit))
      .take(Number(limit))
      .getManyAndCount();

    res.json(
      successResponse(
        {
          projects,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
          },
        },
        'Projects retrieved successfully'
      )
    );
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json(errorResponse('Internal server error', 'Error'));
  }
};

export const getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const project = await projectRepository.findOne({
      where: { id, userId },
    });

    if (!project) {
      res.status(404).json(errorResponse('Project not found', 'Not Found'));
      return;
    }

    res.json(successResponse(project, 'Project retrieved successfully'));
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json(errorResponse('Internal server error', 'Error'));
  }
};

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { name, description, website, isActive } = req.body;

    const project = await projectRepository.findOne({
      where: { id, userId },
    });

    if (!project) {
      res.status(404).json(errorResponse('Project not found', 'Not Found'));
      return;
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (website !== undefined) project.website = website;
    if (isActive !== undefined) project.isActive = isActive;

    await projectRepository.save(project);

    res.json(successResponse(project, 'Project updated successfully'));
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json(errorResponse('Internal server error', 'Update Failed'));
  }
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const project = await projectRepository.findOne({
      where: { id, userId },
    });

    if (!project) {
      res.status(404).json(errorResponse('Project not found', 'Not Found'));
      return;
    }

    await projectRepository.remove(project);

    res.json(successResponse(null, 'Project deleted successfully'));
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json(errorResponse('Internal server error', 'Delete Failed'));
  }
};

export const getProjectStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const project = await projectRepository.findOne({
      where: { id, userId },
    });

    if (!project) {
      res.status(404).json(errorResponse('Project not found', 'Not Found'));
      return;
    }

    // Get statistics from daily stats
    const statsRepo = AppDataSource.getRepository('DailyStat');
    const queryBuilder = statsRepo
      .createQueryBuilder('stat')
      .where('stat.projectId = :projectId', { projectId: id });

    if (startDate) {
      queryBuilder.andWhere('stat.statDate >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('stat.statDate <= :endDate', { endDate });
    }

    const stats = await queryBuilder.orderBy('stat.statDate', 'ASC').getMany();

    const totalPageViews = stats.reduce((sum, stat) => sum + (stat.pageViews || 0), 0);
    const totalUniqueVisitors = stats.reduce((sum, stat) => sum + (stat.uniqueVisitors || 0), 0);
    const avgLoadTime = stats.length > 0
      ? stats.reduce((sum, stat) => sum + (stat.avgPageLoadTime || 0), 0) / stats.length
      : 0;

    res.json(
      successResponse(
        {
          totalPageViews,
          totalUniqueVisitors,
          avgLoadTime: Math.round(avgLoadTime * 100) / 100,
          dailyStats: stats,
        },
        'Statistics retrieved successfully'
      )
    );
  } catch (error) {
    console.error('Get project stats error:', error);
    res.status(500).json(errorResponse('Internal server error', 'Error'));
  }
};
