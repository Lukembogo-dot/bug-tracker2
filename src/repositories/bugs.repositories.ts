import { getPool } from '../../db/config';
import { Bug, CreateBug, UpdateBug } from '../Types/bugs.types';
import sql from 'mssql';

export class BugRepository {
  // Get all bugs
  static async getAllBugs(): Promise<Bug[]> {
    try {
      const pool = await getPool();
      const result = await pool.query`SELECT * FROM Bugs ORDER BY CreatedAt DESC`;
      return result.recordset;
    } catch (error) {
      console.error('Error fetching bugs:', error);
      throw error;
    }
  }

  // Get bug by ID
  static async getBugById(bugId: number): Promise<Bug | null> {
    try {
      const pool = await getPool();
      const result = await pool.query`SELECT * FROM Bugs WHERE BugID = ${bugId}`;
      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error fetching bug by ID:', error);
      throw error;
    }
  }

  // Get bugs by project
  static async getBugsByProject(projectId: number): Promise<Bug[]> {
    try {
      const pool = await getPool();
      const result = await pool.query`SELECT * FROM Bugs WHERE ProjectID = ${projectId} ORDER BY CreatedAt DESC`;
      return result.recordset;
    } catch (error) {
      console.error('Error fetching bugs by project:', error);
      throw error;
    }
  }

  // Get bugs by assignee
  static async getBugsByAssignee(assigneeId: number): Promise<Bug[]> {
    try {
      const pool = await getPool();
      const result = await pool.query`SELECT * FROM Bugs WHERE AssignedTo = ${assigneeId} ORDER BY CreatedAt DESC`;
      return result.recordset;
    } catch (error) {
      console.error('Error fetching bugs by assignee:', error);
      throw error;
    }
  }

  // Get bugs by reporter
  static async getBugsByReporter(reporterId: number): Promise<Bug[]> {
    try {
      const pool = await getPool();
      const result = await pool.query`SELECT * FROM Bugs WHERE ReportedBy = ${reporterId} ORDER BY CreatedAt DESC`;
      return result.recordset;
    } catch (error) {
      console.error('Error fetching bugs by reporter:', error);
      throw error;
    }
  }

  // Get bugs by status
  static async getBugsByStatus(status: string): Promise<Bug[]> {
    try {
      const pool = await getPool();
      const result = await pool.query`SELECT * FROM Bugs WHERE Status = ${status} ORDER BY CreatedAt DESC`;
      return result.recordset;
    } catch (error) {
      console.error('Error fetching bugs by status:', error);
      throw error;
    }
  }

  // Create new bug
  static async createBug(bugData: CreateBug): Promise<Bug> {
    try {
      const pool = await getPool();
      const result = await pool.request()
        .input("title", bugData.Title)
        .input("description", bugData.Description || null)
        .input("status", bugData.Status || 'Open')
        .input("priority", bugData.Priority || 'Medium')
        .input("projectID", bugData.ProjectID)
        .input("reportedBy", bugData.ReportedBy || null)
        .input("assignedTo", bugData.AssignedTo || null)
        .query(`
          INSERT INTO Bugs (Title, Description, Status, Priority, ProjectID, ReportedBy, AssignedTo)
          OUTPUT INSERTED.*
          VALUES (@title, @description, @status, @priority, @projectID, @reportedBy, @assignedTo)
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating bug:', error);
      throw error;
    }
  }

  // Update bug
  static async updateBug(bugId: number, bugData: UpdateBug): Promise<Bug | null> {
    try {
      const updateFields: string[] = [];

      if (bugData.Title) {
        updateFields.push('Title = @title');
      }
      if (bugData.Description !== undefined) {
        updateFields.push('Description = @description');
      }
      if (bugData.Status) {
        updateFields.push('Status = @status');
      }
      if (bugData.Priority) {
        updateFields.push('Priority = @priority');
      }
      if (bugData.AssignedTo !== undefined) {
        updateFields.push('AssignedTo = @assignedTo');
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      const query = `
        UPDATE Bugs
        SET ${updateFields.join(', ')}
        OUTPUT INSERTED.*
        WHERE BugID = @bugId
      `;

      const pool = await getPool();
      const request = pool.request()
        .input("bugId", bugId);

      if (bugData.Title) request.input("title", bugData.Title);
      if (bugData.Description !== undefined) request.input("description", bugData.Description);
      if (bugData.Status) request.input("status", bugData.Status);
      if (bugData.Priority) request.input("priority", bugData.Priority);
      if (bugData.AssignedTo !== undefined) request.input("assignedTo", bugData.AssignedTo);

      const result = await request.query(query);
      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error updating bug:', error);
      throw error;
    }
  }

  // Delete bug
  static async deleteBug(bugId: number): Promise<boolean> {
    try {
      const pool = await getPool();
      const result = await pool.query`DELETE FROM Bugs WHERE BugID = ${bugId}`;
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Error deleting bug:', error);
      throw error;
    }
  }
}