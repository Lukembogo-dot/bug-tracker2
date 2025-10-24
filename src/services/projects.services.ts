/**
 * Project Services Module
 *
 * This module manages all business logic for project management.
 * Projects serve as containers for bugs and provide organizational structure.
 * The service layer ensures proper project creation, updates, and access control.
 */

import { ProjectRepository } from '../repositories/projects.repositories';
import { Project, CreateProject, UpdateProject } from '../Types/projects.types';

/**
 * Validates and sanitizes data for creating a new project
 *
 * Business Rules:
 * - ProjectName is required and must be unique (enforced by database)
 * - CreatedBy is required and must reference an existing user
 * - Description is optional but trimmed if provided
 *
 * @param data - Raw input data from the request body
 * @returns Validated and sanitized CreateProject object
 * @throws Error if validation fails
 */
const validateCreateProjectData = (data: any): CreateProject => {
    // Validate required project name
    if (!data.ProjectName || typeof data.ProjectName !== 'string') {
        throw new Error('ProjectName is required and must be a string');
    }

    // Validate required creator ID
    if (!data.CreatedBy || typeof data.CreatedBy !== 'number') {
        throw new Error('CreatedBy is required and must be a number');
    }

    return {
        ProjectName: data.ProjectName.trim(),
        Description: data.Description ? data.Description.trim() : undefined,
        CreatedBy: data.CreatedBy,
    };
};

/**
 * Validates and sanitizes data for updating an existing project
 *
 * Business Rules:
 * - At least one field must be provided for update
 * - ProjectName must be a string if provided
 * - Description can be set to null to remove it
 *
 * @param data - Raw input data from the request body
 * @returns Validated and sanitized UpdateProject object
 * @throws Error if validation fails or no fields to update
 */
const validateUpdateProjectData = (data: any): UpdateProject => {
    const updateData: UpdateProject = {};

    // Validate and sanitize project name if provided
    if (data.ProjectName !== undefined) {
        if (typeof data.ProjectName !== 'string') {
            throw new Error('ProjectName must be a string');
        }
        updateData.ProjectName = data.ProjectName.trim();
    }

    // Handle description (can be set to null to remove)
    if (data.Description !== undefined) {
        updateData.Description = data.Description ? data.Description.trim() : null;
    }

    // Ensure at least one field is being updated
    if (Object.keys(updateData).length === 0) {
        throw new Error('No valid fields to update');
    }

    return updateData;
};

/**
 * Retrieves all projects from the database
 *
 * Returns a complete list of all projects in the system, ordered by creation date.
 * This is typically used for project listings, admin dashboards, or when
 * users need to browse available projects.
 *
 * @returns Promise resolving to array of all Project objects
 * @throws Error if database operation fails
 */
export const getAllProjects = async (): Promise<Project[]> => {
    try {
        return await ProjectRepository.getAllProjects();
    } catch (error) {
        console.error('Error in getAllProjects service:', error);
        throw error;
    }
};

/**
 * Retrieves a specific project by its ID
 *
 * Used when displaying project details, accessing project-specific data,
 * or verifying project existence before operations. Returns null if
 * the project doesn't exist.
 *
 * @param projectId - The unique identifier of the project
 * @returns Promise resolving to Project object or null if not found
 * @throws Error if projectId is invalid or database operation fails
 */
export const getProjectById = async (projectId: number): Promise<Project | null> => {
    try {
        if (!projectId || typeof projectId !== 'number') {
            throw new Error('Valid project ID is required');
        }
        return await ProjectRepository.getProjectById(projectId);
    } catch (error) {
        console.error('Error in getProjectById service:', error);
        throw error;
    }
};

/**
 * Retrieves all projects created by a specific user
 *
 * Useful for user dashboards, profile pages, or when showing a user's
 * project ownership. Helps track project creation activity and ownership.
 *
 * @param creatorId - The unique identifier of the project creator
 * @returns Promise resolving to array of Project objects created by the user
 * @throws Error if creatorId is invalid or database operation fails
 */
export const getProjectsByCreator = async (creatorId: number): Promise<Project[]> => {
    try {
        if (!creatorId || typeof creatorId !== 'number') {
            throw new Error('Valid creator ID is required');
        }
        return await ProjectRepository.getProjectsByCreator(creatorId);
    } catch (error) {
        console.error('Error in getProjectsByCreator service:', error);
        throw error;
    }
};

/**
 * Creates a new project in the database
 *
 * This is the main entry point for project creation. Validates all input data,
 * ensures the creator exists, and creates the project record with automatic
 * timestamp. Returns the complete project object including the generated ID.
 *
 * @param projectData - Raw project data (name, description, creator)
 * @returns Promise resolving to the created Project object with all fields
 * @throws Error if validation fails or database operation fails
 */
export const createProject = async (projectData: any): Promise<Project> => {
    try {
        const validatedData = validateCreateProjectData(projectData);
        return await ProjectRepository.createProject(validatedData);
    } catch (error) {
        console.error('Error in createProject service:', error);
        throw error;
    }
};

/**
 * Updates an existing project with new data
 *
 * Allows partial updates to project information. Only provided fields
 * are modified. Validates the project exists and update data before proceeding.
 * Returns the updated project or null if the project doesn't exist.
 *
 * @param projectId - The unique identifier of the project to update
 * @param projectData - Update data (name, description)
 * @returns Promise resolving to updated Project object or null if not found
 * @throws Error if projectId is invalid, validation fails, or database operation fails
 */
export const updateProject = async (projectId: number, projectData: any): Promise<Project | null> => {
    try {
        if (!projectId || typeof projectId !== 'number') {
            throw new Error('Valid project ID is required');
        }
        const validatedData = validateUpdateProjectData(projectData);
        return await ProjectRepository.updateProject(projectId, validatedData);
    } catch (error) {
        console.error('Error in updateProject service:', error);
        throw error;
    }
};

/**
 * Deletes a project from the database
 *
 * Permanently removes a project and should typically cascade to remove
 * associated bugs and comments. This operation should be restricted to
 * project creators or administrators. Returns boolean indicating success.
 *
 * @param projectId - The unique identifier of the project to delete
 * @returns Promise resolving to true if deleted, false if not found
 * @throws Error if projectId is invalid or database operation fails
 */
export const deleteProject = async (projectId: number): Promise<boolean> => {
    try {
        if (!projectId || typeof projectId !== 'number') {
            throw new Error('Valid project ID is required');
        }
        return await ProjectRepository.deleteProject(projectId);
    } catch (error) {
        console.error('Error in deleteProject service:', error);
        throw error;
    }
};