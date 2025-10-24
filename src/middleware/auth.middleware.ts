import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorType } from '../utils/errorHandler';

// Extend Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                email: string;
                role: string;
            };
        }
    }
}

// Authentication middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            throw new AppError(
                ErrorType.UNAUTHORIZED,
                'Access token is required',
                'Include Bearer token in Authorization header'
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };

        next();
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                error: {
                    type: error.type,
                    message: error.message,
                    mitigation: error.mitigation
                }
            });
        }

        // Handle JWT specific errors
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                error: {
                    type: ErrorType.UNAUTHORIZED,
                    message: 'Invalid authentication token',
                    mitigation: 'Please login again to obtain a valid token'
                }
            });
        }

        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                error: {
                    type: ErrorType.UNAUTHORIZED,
                    message: 'Authentication token has expired',
                    mitigation: 'Please login again to refresh your token'
                }
            });
        }

        return res.status(500).json({
            error: {
                type: ErrorType.INTERNAL_ERROR,
                message: 'Authentication failed',
                mitigation: 'Please try again later'
            }
        });
    }
};

// Admin-only middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new AppError(
                ErrorType.UNAUTHORIZED,
                'Authentication required',
                'Please login to access this resource'
            );
        }

        if (req.user.role !== 'Admin') {
            throw new AppError(
                ErrorType.FORBIDDEN,
                'Admin access required',
                'Only administrators can perform this action'
            );
        }

        next();
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                error: {
                    type: error.type,
                    message: error.message,
                    mitigation: error.mitigation
                }
            });
        }

        return res.status(500).json({
            error: {
                type: ErrorType.INTERNAL_ERROR,
                message: 'Authorization check failed',
                mitigation: 'Please try again later'
            }
        });
    }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
                req.user = {
                    userId: decoded.userId,
                    email: decoded.email,
                    role: decoded.role
                };
            } catch (error) {
                // Silently ignore invalid tokens for optional auth
                console.warn('Invalid token in optional auth:', error);
            }
        }

        next();
    } catch (error) {
        // Continue without authentication for optional auth
        next();
    }
};