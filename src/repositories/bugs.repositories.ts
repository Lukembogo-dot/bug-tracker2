import { getPool } from '../../db/config';
import { Bug, CreateBug, UpdateBug } from '../Types/bugs.types';
import { Pool } from 'pg';

export class BugRepository {
  // Get all bugs
  static async getAllBugs(): Promise<Bug[]> {
    try {
      const pool: Pool = await getPool();
      const result = await pool.query('SELECT * FROM Bugs ORDER BY CreatedAt DESC');
      return result.rows;
    } catch (error) {
      console.error('Error fetching bugs:', error);
      throw error;
    }
  }

  // Get bug by ID
  static async getBugById(bugId: number): Promise<Bug | null> {
    try {
      const pool: Pool = await getPool();
      const result = await pool.query('SELECT * FROM Bugs WHERE BugID = $1', [bugId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching bug by ID:', error);
      throw error;
    }
  }

  // Get bugs by project
  static async getBugsByProject(projectId: number): Promise<Bug[]> {
    try {
      const pool: Pool = await getPool();
      const result = await pool.query('SELECT * FROM Bugs WHERE ProjectID = $1 ORDER BY CreatedAt DESC', [projectId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching bugs by project:', error);
      throw error;
    }
  }

  // Get bugs by assignee
  static async getBugsByAssignee(assigneeId: number): Promise<Bug[]> {
    try {
      const pool: Pool = await getPool();
      const result = await pool.query('SELECT * FROM Bugs WHERE AssignedTo = $1 ORDER BY CreatedAt DESC', [assigneeId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching bugs by assignee:', error);
      throw error;
    }
  }

  // Get bugs by reporter
  static async getBugsByReporter(reporterId: number): Promise<Bug[]> {
    try {
      const pool: Pool = await getPool();
      const result = await pool.query('SELECT * FROM Bugs WHERE ReportedBy = $1 ORDER BY CreatedAt DESC', [reporterId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching bugs by reporter:', error);
      throw error;
    }
  }

  // Get bugs by status
  static async getBugsByStatus(status: string): Promise<Bug[]> {
    try {
      const pool: Pool = await getPool();
      const result = await pool.query('SELECT * FROM Bugs WHERE Status = $1 ORDER BY CreatedAt DESC', [status]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching bugs by status:', error);
      throw error;
    }
  }

  // Create new bug
  static async createBug(bugData: CreateBug): Promise<Bug> {
    try {
      const pool: Pool = await getPool();
      const result = await pool.query(
        'INSERT INTO Bugs (title, description, status, priority, projectid, reportedby, assignedto) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [bugData.title, bugData.description || null, bugData.status || 'Open', bugData.priority || 'Medium', bugData.projectid, bugData.reportedby || null, bugData.assignedto || null]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating bug:', error);
      throw error;
    }
  }

  // Update bug
  static async updateBug(bugId: number, bugData: UpdateBug): Promise<Bug | null> {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (bugData.title) {
        updateFields.push(`Title = $${paramIndex++}`);
        values.push(bugData.title);
      }
      if (bugData.description !== undefined) {
        updateFields.push(`Description = $${paramIndex++}`);
        values.push(bugData.description);
      }
      if (bugData.status) {
        updateFields.push(`Status = $${paramIndex++}`);
        values.push(bugData.status);
      }
      if (bugData.priority) {
        updateFields.push(`Priority = $${paramIndex++}`);
        values.push(bugData.priority);
      }
      if (bugData.assignedto !== undefined) {
        updateFields.push(`AssignedTo = $${paramIndex++}`);
        values.push(bugData.assignedto);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(bugId); // Add bugId at the end

      const query = `
        UPDATE Bugs
        SET ${updateFields.join(', ')}
        WHERE BugID = $${paramIndex}
        RETURNING *
      `;

      const pool: Pool = await getPool();
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating bug:', error);
      throw error;
    }
  }

  // Delete bug
  static async deleteBug(bugId: number): Promise<boolean> {
    try {
      const pool: Pool = await getPool();
      const result = await pool.query('DELETE FROM Bugs WHERE BugID = $1', [bugId]);
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error deleting bug:', error);
      throw error;
    }
  }
}