import { getPool } from '../../db/config';
import { Comment, CreateComment, UpdateComment } from '../Types/comments.types';
import { Pool } from 'pg';

export class CommentRepository {
  // Get all comments
  static async getAllComments(): Promise<Comment[]> {
    try {
      const pool: Pool = await getPool();
      const result = await pool.query(`
        SELECT c.*, u.Username
        FROM Comments c
        JOIN Users u ON c.UserID = u.UserID
        ORDER BY c.CreatedAt DESC
      `);
      return result.rows;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  // Get comment by ID
  static async getCommentById(commentId: number): Promise<Comment | null> {
    try {
      const pool: Pool = await getPool();
      const result = await pool.query(`
        SELECT c.*, u.Username
        FROM Comments c
        JOIN Users u ON c.UserID = u.UserID
        WHERE c.CommentID = $1
      `, [commentId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching comment by ID:', error);
      throw error;
    }
  }

  // Get comments by bug
  static async getCommentsByBug(bugId: number): Promise<Comment[]> {
    try {
      const pool: Pool = await getPool();
      const result = await pool.query(`
        SELECT c.*, u.Username
        FROM Comments c
        JOIN Users u ON c.UserID = u.UserID
        WHERE c.BugID = $1 ORDER BY c.CreatedAt ASC
      `, [bugId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching comments by bug:', error);
      throw error;
    }
  }

  // Get comments by user
  static async getCommentsByUser(userId: number): Promise<Comment[]> {
    try {
      const pool: Pool = await getPool();
      const result = await pool.query(`
        SELECT c.*, u.Username
        FROM Comments c
        JOIN Users u ON c.UserID = u.UserID
        WHERE c.UserID = $1 ORDER BY c.CreatedAt DESC
      `, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching comments by user:', error);
      throw error;
    }
  }

  // Create new comment
  static async createComment(commentData: CreateComment): Promise<Comment> {
    try {
      const pool: Pool = await getPool();
      const result = await pool.query(`
        INSERT INTO Comments (BugID, UserID, CommentText)
        VALUES ($1, $2, $3)
        RETURNING c.*, u.Username
        FROM Comments c
        JOIN Users u ON c.UserID = u.UserID
        WHERE c.CommentID = (SELECT LASTVAL())
      `, [commentData.BugID, commentData.UserID, commentData.CommentText]);

      // Alternative approach: insert and then select with join
      const insertResult = await pool.query(
        'INSERT INTO Comments (BugID, UserID, CommentText) VALUES ($1, $2, $3) RETURNING CommentID',
        [commentData.BugID, commentData.UserID, commentData.CommentText]
      );

      const newCommentId = insertResult.rows[0].CommentID;
      const selectResult = await pool.query(`
        SELECT c.*, u.Username
        FROM Comments c
        JOIN Users u ON c.UserID = u.UserID
        WHERE c.CommentID = $1
      `, [newCommentId]);

      return selectResult.rows[0];
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  // Update comment
  static async updateComment(commentId: number, commentData: UpdateComment): Promise<Comment | null> {
    try {
      if (!commentData.CommentText) {
        throw new Error('Comment text is required for update');
      }

      const pool: Pool = await getPool();
      const result = await pool.query(`
        UPDATE Comments SET CommentText = $1 WHERE CommentID = $2
        RETURNING c.*, u.Username
        FROM Comments c
        JOIN Users u ON c.UserID = u.UserID
        WHERE c.CommentID = $2
      `, [commentData.CommentText, commentId]);

      // Alternative approach
      await pool.query(
        'UPDATE Comments SET CommentText = $1 WHERE CommentID = $2',
        [commentData.CommentText, commentId]
      );

      const selectResult = await pool.query(`
        SELECT c.*, u.Username
        FROM Comments c
        JOIN Users u ON c.UserID = u.UserID
        WHERE c.CommentID = $1
      `, [commentId]);

      return selectResult.rows[0] || null;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  // Delete comment
  static async deleteComment(commentId: number): Promise<boolean> {
    try {
      const pool: Pool = await getPool();
      const result = await pool.query('DELETE FROM Comments WHERE CommentID = $1', [commentId]);
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  // Delete all comments for a bug (useful when deleting a bug)
  static async deleteCommentsByBug(bugId: number): Promise<number> {
    try {
      const pool: Pool = await getPool();
      const result = await pool.query('DELETE FROM Comments WHERE BugID = $1', [bugId]);
      return result.rowCount || 0;
    } catch (error) {
      console.error('Error deleting comments by bug:', error);
      throw error;
    }
  }
}