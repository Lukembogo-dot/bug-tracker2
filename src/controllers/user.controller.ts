import { Request, Response } from 'express';
import {
    createUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword
} from '../services/user.services';
import { handleControllerError } from '../utils/errorHandler';

// Create a new user
export const createUserController = async (req: Request, res: Response) => {
    try {
        await createUser(req, res);
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

// Login user
export const loginUserController = async (req: Request, res: Response) => {
    try {
        await loginUser(req, res);
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

// Get current user profile
export const getUserProfileController = async (req: Request, res: Response) => {
    try {
        await getUserProfile(req, res);
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

// Update user profile
export const updateUserProfileController = async (req: Request, res: Response) => {
    try {
        await updateUserProfile(req, res);
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

// Change password
export const changePasswordController = async (req: Request, res: Response) => {
    try {
        await changePassword(req, res);
    } catch (error: any) {
        handleControllerError(error, res);
    }
};