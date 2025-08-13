import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface TokenPayload {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization token provided' });
    }
    
    const token = authHeader.split(' ')[1]; // Bearer TOKEN format
    
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as TokenPayload;
    
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check if user has admin role
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
};