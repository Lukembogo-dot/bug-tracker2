import { getPool } from '../../db/config';
import { User, CreateUser, UpdateUser } from '../Types/user.types';
import { Pool } from 'pg';

export class UserRepository {
  // Get all users
  static async getAllUsers(): Promise<User[]> {
    try {
      const pool: Pool = await getPool();
      const result = await pool.query('SELECT * FROM Users ORDER BY CreatedAt DESC');
      return result.rows;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(userId: number): Promise<User | null> {
    try {
      const pool: Pool = await getPool();
      const result = await pool.query('SELECT * FROM Users WHERE UserID = $1', [userId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  // Get user by email (case insensitive)
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const pool: Pool = await getPool();
      const result = await pool.query('SELECT * FROM Users WHERE LOWER(Email) = LOWER($1)', [email.toLowerCase()]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  // Create new user
  static async createUser(userData: CreateUser): Promise<User> {
    try {
      const pool: Pool = await getPool();
      const result = await pool.query(
        'INSERT INTO Users (Username, Email, PasswordHash, Role) VALUES ($1, $2, $3, $4) RETURNING *',
        [userData.Username, userData.Email, userData.PasswordHash, userData.Role || 'User']
      );
      return result.rows[0];
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
      let paramIndex = 1;

      if (userData.Username) {
        updateFields.push(`Username = $${paramIndex++}`);
        values.push(userData.Username);
      }
      if (userData.Email) {
        updateFields.push(`Email = $${paramIndex++}`);
        values.push(userData.Email);
      }
      if (userData.PasswordHash) {
        updateFields.push(`PasswordHash = $${paramIndex++}`);
        values.push(userData.PasswordHash);
      }
      if (userData.Role) {
        updateFields.push(`Role = $${paramIndex++}`);
        values.push(userData.Role);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(userId); // Add userId at the end

      const query = `
        UPDATE Users
        SET ${updateFields.join(', ')}
        WHERE UserID = $${paramIndex}
        RETURNING *
      `;

      const pool: Pool = await getPool();
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user
  static async deleteUser(userId: number): Promise<boolean> {
    try {
      const pool: Pool = await getPool();
      const result = await pool.query('DELETE FROM Users WHERE UserID = $1', [userId]);
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}