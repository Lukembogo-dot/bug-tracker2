import { getPool } from '../../db/config';
import { User, CreateUser, UpdateUser } from '../Types/user.types';
import sql from 'mssql';

export class UserRepository {
  // Get all users
  static async getAllUsers(): Promise<User[]> {
    try {
      const pool = await getPool();
      const result = await pool.query`SELECT * FROM Users ORDER BY CreatedAt DESC`;
      return result.recordset;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(userId: number): Promise<User | null> {
    try {
      const pool = await getPool();
      const result = await pool.query`SELECT * FROM Users WHERE UserID = ${userId}`;
      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const pool = await getPool();
      const result = await pool.query`SELECT * FROM Users WHERE Email = ${email}`;
      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  // Create new user
  static async createUser(userData: CreateUser): Promise<User> {
    try {
      const pool = await getPool();
      const result = await pool.request()
        .input("username", userData.Username)
        .input("email", userData.Email)
        .input("passwordHash", userData.PasswordHash)
        .input("role", userData.Role || 'User')
        .query(`
          INSERT INTO Users (Username, Email, PasswordHash, Role)
          OUTPUT INSERTED.*
          VALUES (@username, @email, @passwordHash, @role)
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update user
  static async updateUser(userId: number, userData: UpdateUser): Promise<User | null> {
    try {
      const updateFields: string[] = [];

      if (userData.Username) {
        updateFields.push('Username = @username');
      }
      if (userData.Email) {
        updateFields.push('Email = @email');
      }
      if (userData.PasswordHash) {
        updateFields.push('PasswordHash = @passwordHash');
      }
      if (userData.Role) {
        updateFields.push('Role = @role');
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      const query = `
        UPDATE Users
        SET ${updateFields.join(', ')}
        OUTPUT INSERTED.*
        WHERE UserID = @userId
      `;

      const pool = await getPool();
      const request = pool.request()
        .input("userId", userId);

      if (userData.Username) request.input("username", userData.Username);
      if (userData.Email) request.input("email", userData.Email);
      if (userData.PasswordHash) request.input("passwordHash", userData.PasswordHash);
      if (userData.Role) request.input("role", userData.Role);

      const result = await request.query(query);
      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user
  static async deleteUser(userId: number): Promise<boolean> {
    try {
      const pool = await getPool();
      const result = await pool.query`DELETE FROM Users WHERE UserID = ${userId}`;
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}