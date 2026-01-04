import { Request, Response } from 'express';
import { AppDataSource } from '../utils/database';
import { User } from '../entities';
import { generateToken } from '../utils/jwt';
import { successResponse, errorResponse } from '../utils/response';

const userRepository = AppDataSource.getRepository(User);

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await userRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      res.status(400).json(errorResponse('Username or email already exists', 'Registration Failed'));
      return;
    }

    // Create new user
    const user = userRepository.create({ username, email, password });
    await userRepository.save(user);

    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    res.status(201).json(
      successResponse(
        {
          token,
          user: user.toJSON(),
        },
        'Registration successful'
      )
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json(errorResponse('Internal server error', 'Registration Failed'));
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    const user = await userRepository.findOne({
      where: { username },
    });

    if (!user) {
      res.status(401).json(errorResponse('Invalid credentials', 'Login Failed'));
      return;
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      res.status(401).json(errorResponse('Invalid credentials', 'Login Failed'));
      return;
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    res.json(
      successResponse(
        {
          token,
          user: user.toJSON(),
        },
        'Login successful'
      )
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(errorResponse('Internal server error', 'Login Failed'));
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;

    const user = await userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json(errorResponse('User not found', 'Not Found'));
      return;
    }

    res.json(successResponse(user.toJSON(), 'User retrieved successfully'));
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json(errorResponse('Internal server error', 'Error'));
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { username, email, avatar } = req.body;

    const user = await userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json(errorResponse('User not found', 'Not Found'));
      return;
    }

    // Check if username/email is taken by another user
    if (username && username !== user.username) {
      const existingUser = await userRepository.findOne({ where: { username } });
      if (existingUser) {
        res.status(400).json(errorResponse('Username already taken', 'Update Failed'));
        return;
      }
    }

    if (email && email !== user.email) {
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        res.status(400).json(errorResponse('Email already taken', 'Update Failed'));
        return;
      }
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;

    await userRepository.save(user);

    res.json(successResponse(user.toJSON(), 'Profile updated successfully'));
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json(errorResponse('Internal server error', 'Update Failed'));
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json(errorResponse('User not found', 'Not Found'));
      return;
    }

    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      res.status(401).json(errorResponse('Current password is incorrect', 'Password Change Failed'));
      return;
    }

    user.password = newPassword;
    await userRepository.save(user);

    res.json(successResponse(null, 'Password changed successfully'));
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json(errorResponse('Internal server error', 'Password Change Failed'));
  }
};
