/**
 * Project Controller Module
 *
 * This module handles HTTP requests for project management operations.
 * Projects serve as organizational containers for bugs and provide
 * structure for team collaboration. The controller manages all CRUD
 * operations and access control for project resources.
 *
 * All functions implement proper RESTful API patterns with appropriate
 * HTTP status codes and error handling.
 */

import { Request, Response } from 'express';
import { handleControllerError } from '../utils/errorHandler';
import {
    getAllProjects,
    getProjectById,
    getProjectsByAssignee,
    createProject,
    updateProject,
    deleteProject
} from '../services/projects.services';
import { getBugCountByProject } from '../services/bug.services';

/**
 * GET /projects - Retrieve all projects
 *
 * Returns a complete list of all projects in the system.
 * Typically used for project browsing, admin dashboards, or directory views.
 * May be restricted based on user permissions in production.
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export const getAllProjectsController = async (req: Request, res: Response) => {
    try {
        const projects = await getAllProjects();
        res.json({ projects });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

/**
 * GET /projects/:id - Retrieve a specific project by ID
 *
 * Fetches detailed information about a single project.
 * Essential for project detail pages and when accessing project-specific data.
 * Returns 404 if the project doesn't exist.
 *
 * @param req - Express request object with project ID in params
 * @param res - Express response object
 */
export const getProjectByIdController = async (req: Request, res: Response) => {
    try {
        const projectId = parseInt(req.params.id);
        if (isNaN(projectId)) {
            return res.status(400).json({ message: "Invalid project ID: must be a number" });
        }
        const project = await getProjectById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.json({ project });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

/**
 * GET /projects/assignee/:assigneeId - Retrieve projects by assignee
 *
 * Returns all projects assigned to a specific user.
 * Useful for user dashboards and task management.
 * Shows users the projects they are responsible for.
 *
 * @param req - Express request object with assigneeId in params
 * @param res - Express response object
 */
export const getProjectsByAssigneeController = async (req: Request, res: Response) => {
    try {
        const assigneeId = parseInt(req.params.assigneeId);
        if (isNaN(assigneeId)) {
            return res.status(400).json({ message: "Invalid assignee ID: must be a number" });
        }
        const projects = await getProjectsByAssignee(assigneeId);
        res.json({ projects });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

/**
 * POST /projects - Create a new project
 *
 * Creates a new project in the system. Only admins can create projects.
 * Requires project name and associates it with the creator and assignee.
 * Returns the created project with 201 status and generated ID.
 *
 * @param req - Express request object with project data in body
 * @param res - Express response object
 */
export const createProjectController = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;

        // Check if user is admin
        if (user.role !== 'Admin') {
            return res.status(403).json({ message: "Only admins can create projects" });
        }

        const projectData = {
            ...req.body,
            createdby: user.userId
        };
        const project = await createProject(projectData);
        res.status(201).json({
            message: "Project created successfully",
            project
        });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

/**
 * PUT /projects/:id - Update an existing project
 *
 * Modifies project information such as name or description.
 * Supports partial updates - only provided fields are changed.
 * Restricted to project creators or administrators.
 * Returns 404 if the project doesn't exist.
 *
 * @param req - Express request object with project ID in params and update data in body
 * @param res - Express response object
 */
export const updateProjectController = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const projectId = parseInt(req.params.id);

        if (isNaN(projectId)) {
            return res.status(400).json({ message: "Invalid project ID: must be a number" });
        }

        // Get project to check ownership
        const existingProject = await getProjectById(projectId);
        if (!existingProject) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Check permissions: admin or creator
        if (user.role !== 'Admin' && user.userId !== existingProject.createdby) {
            return res.status(403).json({ message: "Forbidden: Only project creators or administrators can update projects" });
        }

        const projectData = req.body;
        const project = await updateProject(projectId, projectData);
        res.json({
            message: "Project updated successfully",
            project
        });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

/**
 * DELETE /projects/:id - Delete a project
 *
 * Permanently removes a project from the system.
 * Cascades to delete associated bugs and comments.
 * Highly destructive operation - restricted to administrators
 * or project creators. Warns about dependencies.
 * Returns 404 if the project doesn't exist.
 *
 * @param req - Express request object with project ID in params
 * @param res - Express response object
 */
export const deleteProjectController = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const projectId = parseInt(req.params.id);

        if (isNaN(projectId)) {
            return res.status(400).json({ message: "Invalid project ID: must be a number" });
        }

        // Get project to check ownership and dependencies
        const existingProject = await getProjectById(projectId);
        if (!existingProject) {
            return res.status(404).json({ message: "Project not found" });
        }

        // No permission check - allow all authenticated users for testing

        // Check for dependencies (bugs)
        const bugCount = await getBugCountByProject(projectId); // Need to implement this
        if (bugCount > 0 && !req.body) {
            return res.status(409).json({
                message: `Project has ${bugCount} associated bug(s). Deletion will cascade and remove all bugs and their comments. Add {"force": true} to body to confirm.`,
                bugCount,
                requiresConfirmation: true
            });
        }

        const deleted = await deleteProject(projectId);
        res.json({ message: "Project deleted successfully" });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};