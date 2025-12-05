import { getPool } from '../../db/config';
import { Project, CreateProject, UpdateProject } from '../Types/projects.types';
import { Pool } from 'pg';

export class ProjectRepository {
  // Get all projects
  static async getAllProjects(): Promise<Project[]> {
    try {
      const pool: Pool = await getPool();
      const result = await pool.query('SELECT * FROM Projects ORDER BY CreatedAt DESC');
      return result.rows;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  // Get project by ID
  static async getProjectById(projectId: number): Promise<Project | null> {
    try {
      const pool: Pool = await getPool();
      const result = await pool.query('SELECT * FROM Projects WHERE ProjectID = $1', [projectId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching project by ID:', error);
      throw error;
    }
  }

  // Get projects by assignee
  static async getProjectsByAssignee(assigneeId: number): Promise<Project[]> {
    try {
      const pool: Pool = await getPool();
      const result = await pool.query('SELECT * FROM Projects WHERE AssignedTo = $1 ORDER BY CreatedAt DESC', [assigneeId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching projects by assignee:', error);
      throw error;
    }
  }

  // Create new project
  static async createProject(projectData: CreateProject): Promise<Project> {
    try {
      const pool: Pool = await getPool();
      const result = await pool.query(
        'INSERT INTO Projects (ProjectName, Description, CreatedBy, AssignedTo) VALUES ($1, $2, $3, $4) RETURNING *',
        [projectData.projectname, projectData.description || null, projectData.createdby, projectData.assignedto || null]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  // Update project
  static async updateProject(projectId: number, projectData: UpdateProject): Promise<Project | null> {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (projectData.projectname) {
        updateFields.push(`ProjectName = $${paramIndex++}`);
        values.push(projectData.projectname);
      }
      if (projectData.description !== undefined) {
        updateFields.push(`Description = $${paramIndex++}`);
        values.push(projectData.description);
      }
      if (projectData.assignedto !== undefined) {
        updateFields.push(`AssignedTo = $${paramIndex++}`);
        values.push(projectData.assignedto);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(projectId); // Add projectId at the end

      const query = `
        UPDATE Projects
        SET ${updateFields.join(', ')}
        WHERE ProjectID = $${paramIndex}
        RETURNING *
      `;

      const pool: Pool = await getPool();
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // Delete project
  static async deleteProject(projectId: number): Promise<boolean> {
    try {
      const pool: Pool = await getPool();
      const result = await pool.query('DELETE FROM Projects WHERE ProjectID = $1', [projectId]);
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }
}