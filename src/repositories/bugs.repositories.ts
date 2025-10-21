import { sql } from '../../db/config';
import { Bug, CreateBug, UpdateBug } from '../Types/bugs.types';

export class BugRepository {
  // Get all bugs
  static async getAllBugs(): Promise<Bug[]> {
    try {
      const result = await sql.query`SELECT * FROM Bugs ORDER BY CreatedAt DESC`;
      return result.recordset;
    } catch (error) {
      console.error('Error fetching bugs:', error);
      throw error;
    }
  }

  // Get bug by ID
  static async getBugById(bugId: number): Promise<Bug | null> {
    try {
      const result = await sql.query`SELECT * FROM Bugs WHERE BugID = ${bugId}`;
      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error fetching bug by ID:', error);
      throw error;
    }
  }

  // Get bugs by project
  static async getBugsByProject(projectId: number): Promise<Bug[]> {
    try {
      const result = await sql.query`SELECT * FROM Bugs WHERE ProjectID = ${projectId} ORDER BY CreatedAt DESC`;
      return result.recordset;
    } catch (error) {
      console.error('Error fetching bugs by project:', error);
      throw error;
    }
  }

  // Get bugs by assignee
  static async getBugsByAssignee(assigneeId: number): Promise<Bug[]> {
    try {
      const result = await sql.query`SELECT * FROM Bugs WHERE AssignedTo = ${assigneeId} ORDER BY CreatedAt DESC`;
      return result.recordset;
    } catch (error) {
      console.error('Error fetching bugs by assignee:', error);
      throw error;
    }
  }

  // Get bugs by reporter
  static async getBugsByReporter(reporterId: number): Promise<Bug[]> {
    try {
      const result = await sql.query`SELECT * FROM Bugs WHERE ReportedBy = ${reporterId} ORDER BY CreatedAt DESC`;
      return result.recordset;
    } catch (error) {
      console.error('Error fetching bugs by reporter:', error);
      throw error;
    }
  }

  // Get bugs by status
  static async getBugsByStatus(status: string): Promise<Bug[]> {
    try {
      const result = await sql.query`SELECT * FROM Bugs WHERE Status = ${status} ORDER BY CreatedAt DESC`;
      return result.recordset;
    } catch (error) {
      console.error('Error fetching bugs by status:', error);
      throw error;
    }
  }

  // Create new bug
  static async createBug(bugData: CreateBug): Promise<Bug> {
    try {
      const result = await sql.query`
        INSERT INTO Bugs (Title, Description, Status, Priority, ProjectID, ReportedBy, AssignedTo)
        OUTPUT INSERTED.*
        VALUES (
          ${bugData.Title},
          ${bugData.Description || null},
          ${bugData.Status || 'Open'},
          ${bugData.Priority || 'Medium'},
          ${bugData.ProjectID},
          ${bugData.ReportedBy || null},
          ${bugData.AssignedTo || null}
        )
      `;
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
      const values: any[] = [];

      if (bugData.Title) {
        updateFields.push('Title = @title');
        values.push({ name: 'title', value: bugData.Title });
      }
      if (bugData.Description !== undefined) {
        updateFields.push('Description = @description');
        values.push({ name: 'description', value: bugData.Description });
      }
      if (bugData.Status) {
        updateFields.push('Status = @status');
        values.push({ name: 'status', value: bugData.Status });
      }
      if (bugData.Priority) {
        updateFields.push('Priority = @priority');
        values.push({ name: 'priority', value: bugData.Priority });
      }
      if (bugData.AssignedTo !== undefined) {
        updateFields.push('AssignedTo = @assignedTo');
        values.push({ name: 'assignedTo', value: bugData.AssignedTo });
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

      values.push({ name: 'bugId', value: bugId });

      const request = new (sql.Request as any)();
      values.forEach(param => request.input(param.name, param.value));

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
      const result = await sql.query`DELETE FROM Bugs WHERE BugID = ${bugId}`;
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Error deleting bug:', error);
      throw error;
    }
  }
}