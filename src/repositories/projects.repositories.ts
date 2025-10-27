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

  // Get projects by creator
  static async getProjectsByCreator(creatorId: number): Promise<Project[]> {
    try {
      const pool: Pool = await getPool();
      const result = await pool.query('SELECT * FROM Projects WHERE CreatedBy = $1 ORDER BY CreatedAt DESC', [creatorId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching projects by creator:', error);
      throw error;
    }
  }

  // Create new project
  static async createProject(projectData: CreateProject): Promise<Project> {
    try {
      const pool: Pool = await getPool();
      const result = await pool.query(
        'INSERT INTO Projects (ProjectName, Description, CreatedBy) VALUES ($1, $2, $3) RETURNING *',
        [projectData.ProjectName, projectData.Description || null, projectData.CreatedBy]
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

      if (projectData.ProjectName) {
        updateFields.push(`ProjectName = $${paramIndex++}`);
        values.push(projectData.ProjectName);
      }
      if (projectData.Description !== undefined) {
        updateFields.push(`Description = $${paramIndex++}`);
        values.push(projectData.Description);
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