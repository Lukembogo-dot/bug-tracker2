import bcrypt from 'bcrypt';
import { Response } from 'express';
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { CreateUser, User } from '../Types/user.types';
import { UserRepository } from '../repositories/user.repositories';

const validateAndParseCredentials = async (body:any): Promise<CreateUser> => {
 const {username, email, password, role} = body ?? {};
 if(!username || !email || !password){
     throw new Error("Missing credentials, please fully fill credentials required")
 };

 if(typeof username !== 'string' || typeof email !== 'string') {
     throw new Error("Invalid field types  in req.body");
 }
 const trimmedUsername = username.trim();
 const trimmedEmail = email.trim().toLowerCase();

 const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

 if(!emailRe.test(trimmedEmail)){
     throw new Error('Invalid email format');
 }

 if(password.length < 8){
     throw new Error('Password must be at least 8 characters');
 };

 console.log("this is the pass", password);

 const passwordHash = await bcrypt.hash(password, 10);

 return{
     Username: trimmedUsername,
     Email: trimmedEmail,
     PasswordHash: passwordHash,
     Role: role && typeof role === 'string' ? role : 'User'
 }
}

export const createUser = async (req: Request, res: Response) => {
     console.log("User received",req.body);
    if(!req.body){
        console.log("you need to fill in credentials");
      return  res.status(400).json({message:"Please fill in credentials"});
    };
    try {
        const newUser =  await  validateAndParseCredentials(req.body);
        console.log("User parsed", newUser);

        // Check if user already exists
        const existingUser = await UserRepository.getUserByEmail(newUser.Email);
        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists" });
        }

        // Create the user
        const createdUser = await UserRepository.createUser(newUser);

        // Remove password hash from response
        const { passwordhash, ...userResponse } = createdUser;

        res.status(201).json({
            message: "User created successfully",
            user: userResponse
        });
    } catch (error: any) {
        console.error('Error creating user:', error);
        res.status(500).json({
            message: "Failed to create user",
            error: error.message
        });
    }
}

// Login user
export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        // Find user by email
        const user = await UserRepository.getUserByEmail(email.toLowerCase().trim());
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }


        console.log("Password from client:", password);
        console.log("Password hash from DB:", user);

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordhash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.UserID,
                email: user.Email,
                role: user.Role
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Remove password hash from response
        const { passwordhash, ...userResponse } = user;

        res.status(200).json({
            message: "Login successful",
            token,
            user: userResponse
        });
    } catch (error: any) {
        console.error('Error logging in user:', error);
        res.status(500).json({
            message: "Failed to login",
            error: error.message
        });
    }
}

// Get current user profile
export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId; // From auth middleware

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await UserRepository.getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Remove password hash from response
        const { passwordhash, ...userResponse } = user;
        
        res.status(200).json({ user: userResponse });
    } catch (error: any) {
        console.error('Error getting user profile:', error);
        res.status(500).json({
            message: "Failed to get user profile",
            error: error.message
        });
    }
}

// Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId; // From auth middleware

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { username, email } = req.body;
        const updateData: any = {};

        if (username) updateData.Username = username.trim();
        if (email) updateData.Email = email.trim().toLowerCase();

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No valid fields to update" });
        }

        // Check if email is already taken by another user
        if (email) {
            const existingUser = await UserRepository.getUserByEmail(email);
            if (existingUser && existingUser.UserID !== userId) {
                return res.status(409).json({ message: "Email is already taken" });
            }
        }

        const updatedUser = await UserRepository.updateUser(userId, updateData);
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Remove password hash from response
        const { passwordhash, ...userResponse } = updatedUser;

        res.status(200).json({
            message: "Profile updated successfully",
            user: userResponse
        });
    } catch (error: any) {
        console.error('Error updating user profile:', error);
        res.status(500).json({
            message: "Failed to update profile",
            error: error.message
        });
    }
}

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await UserRepository.getAllUsers();

        // Remove password hashes from response
        const usersResponse = users.map(user => {
            const { passwordhash, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        res.json({
            message: "Users retrieved successfully",
            users: usersResponse
        });
    } catch (error: any) {
        console.error('Error getting all users:', error);
        res.status(500).json({
            message: "Failed to get users",
            error: error.message
        });
    }
}

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);

        if (!userId || isNaN(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        // Check if user exists
        const user = await UserRepository.getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete the user
        const deleted = await UserRepository.deleteUser(userId);
        if (!deleted) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User deleted successfully" });
    } catch (error: any) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            message: "Failed to delete user",
            error: error.message
        });
    }
}

// Change password
export const changePassword = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId; // From auth middleware
        const { currentPassword, newPassword } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current password and new password are required" });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: "New password must be at least 8 characters" });
        }

        // Get user
        const user = await UserRepository.getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordhash);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Update password
        await UserRepository.updateUser(userId, { PasswordHash: newPasswordHash });

        res.status(204).json({ message: "Password changed successfully" });
    } catch (error: any) {
        console.error('Error changing password:', error);
        res.status(500).json({
            message: "Failed to change password",
            error: error.message
        });
    }
}