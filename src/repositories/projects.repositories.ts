import { sql } from '../../db/config';
import { Project, CreateProject, UpdateProject } from '../Types/projects.types';

export class ProjectRepository {
  // Get all projects
  static async getAllProjects(): Promise<Project[]> {
    try {
      const result = await sql.query`SELECT * FROM Projects ORDER BY CreatedAt DESC`;
      return result.recordset;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  // Get project by ID
  static async getProjectById(projectId: number): Promise<Project | null> {
    try {
      const result = await sql.query`SELECT * FROM Projects WHERE ProjectID = ${projectId}`;
      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error fetching project by ID:', error);
      throw error;
    }
  }

  // Get projects by creator
  static async getProjectsByCreator(creatorId: number): Promise<Project[]> {
    try {
      const result = await sql.query`SELECT * FROM Projects WHERE CreatedBy = ${creatorId} ORDER BY CreatedAt DESC`;
      return result.recordset;
    } catch (error) {
      console.error('Error fetching projects by creator:', error);
      throw error;
    }
  }

  // Create new project
  static async createProject(projectData: CreateProject): Promise<Project> {
    try {
      const result = await sql.query`
        INSERT INTO Projects (ProjectName, Description, CreatedBy)
        OUTPUT INSERTED.*
        VALUES (${projectData.ProjectName}, ${projectData.Description || null}, ${projectData.CreatedBy})
      `;
      return result.recordset[0];
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

      if (projectData.ProjectName) {
        updateFields.push('ProjectName = @projectName');
        values.push({ name: 'projectName', value: projectData.ProjectName });
      }
      if (projectData.Description !== undefined) {
        updateFields.push('Description = @description');
        values.push({ name: 'description', value: projectData.Description });
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      const query = `
        UPDATE Projects
        SET ${updateFields.join(', ')}
        OUTPUT INSERTED.*
        WHERE ProjectID = @projectId
      `;

      values.push({ name: 'projectId', value: projectId });

      const request = new sql.Request();
      values.forEach(param => request.input(param.name, param.value));

      const result = await request.query(query);
      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // Delete project
  static async deleteProject(projectId: number): Promise<boolean> {
    try {
      const result = await sql.query`DELETE FROM Projects WHERE ProjectID = ${projectId}`;
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }
}