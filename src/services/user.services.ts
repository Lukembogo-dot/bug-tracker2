import bcrypt from 'bcrypt';
import { Response } from 'express';
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { CreateUser, UpdateUser, User } from '../Types/user.types';
import { UserRepository } from '../repositories/user.repositories';
import { request } from 'http';


const ensureUserexists =async(id: number) => {
  const verified = await UserRepository.getUserById(id);
  if(!verified){
    throw new Error("User not found");
  }
}
const validateAndParseCredentials = async (body:any): Promise<CreateUser> => {
const {Username, Email, Password, Role} = body ?? {};
if(!Username || !Email || !Password){
    throw new Error("Missing credentials, please fully fill credentials required")
};

if(typeof Username !== 'string' || typeof Email !== 'string') {
    throw new Error("Invalid field types  in req.body");
}
const username = Username.trim();
const email = Email.trim().toLowerCase();

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if(!emailRe.test(email)){
    throw new Error('Invalid email format');
}

if(Password.length < 8){
    throw new Error('Password must be at least 8 characters');
};

const passwordHash = await bcrypt.hash(Password, 10);

return{
    Username: username,
    Email: email,
    PasswordHash: passwordHash,
    Role: Role && typeof Role === 'string' ? Role : 'User'
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
        const { PasswordHash, ...userResponse } = createdUser;

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

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.PasswordHash);
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
        const { PasswordHash, ...userResponse } = user;

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
        const { PasswordHash, ...userResponse } = user;
        
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
export const updateUserProfile = async (id: number, updateData: UpdateUser) => {
    await ensureUserexists(id);

    // Validate and prepare update data
    const validatedData: Partial<UpdateUser> = {};

    if (updateData.Username !== undefined) {
        if (typeof updateData.Username !== 'string' || updateData.Username.trim() === '') {
            throw new Error("Invalid username");
        }
        validatedData.Username = updateData.Username.trim();
    }

    if (updateData.Email !== undefined) {
        if (typeof updateData.Email !== 'string') {
            throw new Error("Invalid email type");
        }
        const email = updateData.Email.trim().toLowerCase();
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(email)) {
            throw new Error("Invalid email format");
        }
        // Check if email is already taken by another user
        const existingUser = await UserRepository.getUserByEmail(email);
        if (existingUser && existingUser.UserID !== id) {
            throw new Error("Email is already taken");
        }
        validatedData.Email = email;
    }

    if (updateData.Role !== undefined) {
        if (typeof updateData.Role !== 'string') {
            throw new Error("Invalid role");
        }
        validatedData.Role = updateData.Role;
    }

    // Note: PasswordHash should not be updated here; use changePassword instead
    if (updateData.PasswordHash !== undefined) {
        throw new Error("Password cannot be updated via profile update");
    }

    if (Object.keys(validatedData).length === 0) {
        throw new Error("No valid fields to update");
    }

    const updatedUser = await UserRepository.updateUser(id, validatedData);
    if (!updatedUser) {
        throw new Error("Failed to update user");
    }

    // Remove password hash from response
    const { PasswordHash, ...userResponse } = updatedUser;
    return userResponse;
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
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.PasswordHash);
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