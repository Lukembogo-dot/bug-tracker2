import { sql } from '../../db/config';
import { User, CreateUser, UpdateUser } from '../Types/user.types';

export class UserRepository {
  // Get all users
  static async getAllUsers(): Promise<User[]> {
    try {
      const result = await sql.query`SELECT * FROM Users ORDER BY CreatedAt DESC`;
      return result.recordset;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(userId: number): Promise<User | null> {
    try {
      const result = await sql.query`SELECT * FROM Users WHERE UserID = ${userId}`;
      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await sql.query`SELECT * FROM Users WHERE Email = ${email}`;
      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  // Create new user
  static async createUser(userData: CreateUser): Promise<User> {
    try {
      const result = await sql.query`
        INSERT INTO Users (Username, Email, PasswordHash, Role)
        OUTPUT INSERTED.*
        VALUES (${userData.Username}, ${userData.Email}, ${userData.PasswordHash}, ${userData.Role || 'User'})
      `;
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
      const values: any[] = [];

      if (userData.Username) {
        updateFields.push('Username = @username');
        values.push({ name: 'username', value: userData.Username });
      }
      if (userData.Email) {
        updateFields.push('Email = @email');
        values.push({ name: 'email', value: userData.Email });
      }
      if (userData.PasswordHash) {
        updateFields.push('PasswordHash = @passwordHash');
        values.push({ name: 'passwordHash', value: userData.PasswordHash });
      }
      if (userData.Role) {
        updateFields.push('Role = @role');
        values.push({ name: 'role', value: userData.Role });
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

      values.push({ name: 'userId', value: userId });

      const request = new (sql.Request as any)();
      values.forEach(param => request.input(param.name, param.value));

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
      const result = await sql.query`DELETE FROM Users WHERE UserID = ${userId}`;
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}