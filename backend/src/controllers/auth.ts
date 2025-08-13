import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserModel } from '../models/user';
import dotenv from 'dotenv';

dotenv.config();

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, hospital_id } = req.body;
    
    // Validate input
    if (!name || !email || !password || !hospital_id) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    
    // Create new user (default role is 'staff')
    const newUser = await UserModel.create({
      name,
      email,
      password,
      role: 'staff',
      hospital_id
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' } as SignOptions
    );
    
    // Return user data (excluding password) and token
    const { password: _, ...userData } = newUser;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Validate password
    const isPasswordValid = await UserModel.validatePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' } as SignOptions
    );
    
    // Return user data (excluding password) and token
    const { password: _, ...userData } = user;
    
    res.status(200).json({
      message: 'Login successful',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user data (excluding password)
    const { password, ...userData } = user;
    
    res.status(200).json({
      user: userData
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};