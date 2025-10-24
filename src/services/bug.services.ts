/**
 * Bug Services Module
 *
 * This module provides business logic for bug management operations.
 * It acts as an intermediary between controllers and repositories, handling:
 * - Input validation and sanitization
 * - Business rule enforcement
 * - Error handling and transformation
 * - Data transformation between layers
 *
 * The service layer ensures data integrity and implements business rules
 * before calling repository methods for database operations.
 */

import { BugRepository } from '../repositories/bugs.repositories';
import { Bug, CreateBug, UpdateBug } from '../Types/bugs.types';

/**
 * Validates and sanitizes data for creating a new bug
 *
 * Business Rules:
 * - Title is required and must be a non-empty string
 * - ProjectID is required and must be a valid number
 * - Description is optional but trimmed if provided
 * - Status defaults to 'Open' if not specified
 * - Priority defaults to 'Medium' if not specified
 * - ReportedBy and AssignedTo are optional user IDs
 *
 * @param data - Raw input data from the request body
 * @returns Validated and sanitized CreateBug object
 * @throws Error if validation fails
 */
const validateCreateBugData = (data: any): CreateBug => {
    // Validate required title field
    if (!data.Title || typeof data.Title !== 'string') {
        throw new Error('Title is required and must be a string');
    }

    // Validate required project ID
    if (!data.ProjectID || typeof data.ProjectID !== 'number') {
        throw new Error('ProjectID is required and must be a number');
    }

    // Return sanitized data with defaults applied
    return {
        Title: data.Title.trim(),
        Description: data.Description ? data.Description.trim() : undefined,
        Status: data.Status || 'Open',
        Priority: data.Priority || 'Medium',
        ProjectID: data.ProjectID,
        ReportedBy: data.ReportedBy || undefined,
        AssignedTo: data.AssignedTo || undefined,
    };
};

/**
 * Validates and sanitizes data for updating an existing bug
 *
 * Business Rules:
 * - At least one field must be provided for update
 * - Title must be a string if provided
 * - Description can be set to null to remove it
 * - Status and Priority must be strings if provided
 * - AssignedTo can be a number (user ID) or null to unassign
 *
 * @param data - Raw input data from the request body
 * @returns Validated and sanitized UpdateBug object
 * @throws Error if validation fails or no fields to update
 */
const validateUpdateBugData = (data: any): UpdateBug => {
    const updateData: UpdateBug = {};

    // Validate and sanitize title if provided
    if (data.Title !== undefined) {
        if (typeof data.Title !== 'string') {
            throw new Error('Title must be a string');
        }
        updateData.Title = data.Title.trim();
    }

    // Handle description (can be set to null to remove)
    if (data.Description !== undefined) {
        updateData.Description = data.Description ? data.Description.trim() : null;
    }

    // Validate status if provided
    if (data.Status !== undefined) {
        if (typeof data.Status !== 'string') {
            throw new Error('Status must be a string');
        }
        updateData.Status = data.Status;
    }

    // Validate priority if provided
    if (data.Priority !== undefined) {
        if (typeof data.Priority !== 'string') {
            throw new Error('Priority must be a string');
        }
        updateData.Priority = data.Priority;
    }

    // Validate assigned user ID if provided
    if (data.AssignedTo !== undefined) {
        if (data.AssignedTo !== null && typeof data.AssignedTo !== 'number') {
            throw new Error('AssignedTo must be a number or null');
        }
        updateData.AssignedTo = data.AssignedTo;
    }

    // Ensure at least one field is being updated
    if (Object.keys(updateData).length === 0) {
        throw new Error('No valid fields to update');
    }

    return updateData;
};

/**
 * Retrieves all bugs from the database
 *
 * This function provides a complete list of all bugs across all projects,
 * ordered by creation date (most recent first). Used for administrative
 * views or when filtering is not required.
 *
 * @returns Promise resolving to array of all Bug objects
 * @throws Error if database operation fails
 */
export const getAllBugs = async (): Promise<Bug[]> => {
    try {
        return await BugRepository.getAllBugs();
    } catch (error) {
        console.error('Error in getAllBugs service:', error);
        throw error;
    }
};

/**
 * Retrieves a specific bug by its ID
 *
 * Validates the bug ID parameter and fetches the corresponding bug record.
 * Returns null if the bug doesn't exist, which allows controllers to
 * return appropriate 404 responses.
 *
 * @param bugId - The unique identifier of the bug
 * @returns Promise resolving to Bug object or null if not found
 * @throws Error if bugId is invalid or database operation fails
 */
export const getBugById = async (bugId: number): Promise<Bug | null> => {
    try {
        if (!bugId || typeof bugId !== 'number') {
            throw new Error('Valid bug ID is required');
        }
        return await BugRepository.getBugById(bugId);
    } catch (error) {
        console.error('Error in getBugById service:', error);
        throw error;
    }
};

/**
 * Retrieves all bugs associated with a specific project
 *
 * This is commonly used in project dashboards to show all bugs
 * within a particular project scope, ordered by creation date.
 *
 * @param projectId - The unique identifier of the project
 * @returns Promise resolving to array of Bug objects for the project
 * @throws Error if projectId is invalid or database operation fails
 */
export const getBugsByProject = async (projectId: number): Promise<Bug[]> => {
    try {
        if (!projectId || typeof projectId !== 'number') {
            throw new Error('Valid project ID is required');
        }
        return await BugRepository.getBugsByProject(projectId);
    } catch (error) {
        console.error('Error in getBugsByProject service:', error);
        throw error;
    }
};

/**
 * Retrieves all bugs assigned to a specific user
 *
 * Used to show a user's workload or task list. Only returns bugs
 * where the AssignedTo field matches the provided user ID.
 *
 * @param assigneeId - The unique identifier of the assigned user
 * @returns Promise resolving to array of Bug objects assigned to the user
 * @throws Error if assigneeId is invalid or database operation fails
 */
export const getBugsByAssignee = async (assigneeId: number): Promise<Bug[]> => {
    try {
        if (!assigneeId || typeof assigneeId !== 'number') {
            throw new Error('Valid assignee ID is required');
        }
        return await BugRepository.getBugsByAssignee(assigneeId);
    } catch (error) {
        console.error('Error in getBugsByAssignee service:', error);
        throw error;
    }
};

/**
 * Retrieves all bugs reported by a specific user
 *
 * Shows the bug reporting history of a user. Useful for user profiles
 * or tracking who reported which issues.
 *
 * @param reporterId - The unique identifier of the reporting user
 * @returns Promise resolving to array of Bug objects reported by the user
 * @throws Error if reporterId is invalid or database operation fails
 */
export const getBugsByReporter = async (reporterId: number): Promise<Bug[]> => {
    try {
        if (!reporterId || typeof reporterId !== 'number') {
            throw new Error('Valid reporter ID is required');
        }
        return await BugRepository.getBugsByReporter(reporterId);
    } catch (error) {
        console.error('Error in getBugsByReporter service:', error);
        throw error;
    }
};

/**
 * Retrieves all bugs with a specific status
 *
 * Useful for filtering bugs by their current state (Open, In Progress, Resolved, etc.).
 * Commonly used in dashboards and reporting features.
 *
 * @param status - The status string to filter by (e.g., 'Open', 'In Progress')
 * @returns Promise resolving to array of Bug objects with the specified status
 * @throws Error if status is invalid or database operation fails
 */
export const getBugsByStatus = async (status: string): Promise<Bug[]> => {
    try {
        if (!status || typeof status !== 'string') {
            throw new Error('Valid status is required');
        }
        return await BugRepository.getBugsByStatus(status);
    } catch (error) {
        console.error('Error in getBugsByStatus service:', error);
        throw error;
    }
};

/**
 * Creates a new bug in the database
 *
 * This is the main entry point for bug creation. It validates all input data,
 * applies business rules and defaults, then persists the bug to the database.
 * The created bug object (including auto-generated ID and timestamps) is returned.
 *
 * @param bugData - Raw bug data from the request (title, description, etc.)
 * @returns Promise resolving to the created Bug object with all fields populated
 * @throws Error if validation fails or database operation fails
 */
export const createBug = async (bugData: any): Promise<Bug> => {
    try {
        const validatedData = validateCreateBugData(bugData);
        return await BugRepository.createBug(validatedData);
    } catch (error) {
        console.error('Error in createBug service:', error);
        throw error;
    }
};

/**
 * Updates an existing bug with new data
 *
 * Allows partial updates - only provided fields are modified.
 * Validates the bug ID and update data before proceeding.
 * Returns the updated bug object or null if the bug doesn't exist.
 *
 * @param bugId - The unique identifier of the bug to update
 * @param bugData - Raw update data (only provided fields will be updated)
 * @returns Promise resolving to updated Bug object or null if not found
 * @throws Error if bugId is invalid, validation fails, or database operation fails
 */
export const updateBug = async (bugId: number, bugData: any): Promise<Bug | null> => {
    try {
        if (!bugId || typeof bugId !== 'number') {
            throw new Error('Valid bug ID is required');
        }
        const validatedData = validateUpdateBugData(bugData);
        return await BugRepository.updateBug(bugId, validatedData);
    } catch (error) {
        console.error('Error in updateBug service:', error);
        throw error;
    }
};

/**
 * Deletes a bug from the database
 *
 * Permanently removes a bug and all its associated data.
 * Note: Comments are automatically deleted due to CASCADE constraints.
 * Returns boolean indicating success/failure of the operation.
 *
 * @param bugId - The unique identifier of the bug to delete
 * @returns Promise resolving to true if deleted, false if not found
 * @throws Error if bugId is invalid or database operation fails
 */
export const deleteBug = async (bugId: number): Promise<boolean> => {
    try {
        if (!bugId || typeof bugId !== 'number') {
            throw new Error('Valid bug ID is required');
        }
        return await BugRepository.deleteBug(bugId);
    } catch (error) {
        console.error('Error in deleteBug service:', error);
        throw error;
    }
};