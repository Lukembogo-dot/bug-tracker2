/**
 * Bug Controller Module
 *
 * This module handles HTTP requests related to bug management.
 * It acts as the interface between HTTP clients and the bug service layer,
 * managing request/response formatting, parameter extraction, and HTTP status codes.
 *
 * All controller functions follow a consistent pattern:
 * 1. Extract and validate parameters from the request
 * 2. Call the appropriate service function
 * 3. Format the response with appropriate HTTP status codes
 * 4. Handle errors using the centralized error handler
 */

import { Request, Response } from 'express';
import { handleControllerError } from '../utils/errorHandler';
import {
    getAllBugs,
    getBugById,
    getBugsByProject,
    getBugsByAssignee,
    getBugsByReporter,
    getBugsByStatus,
    createBug,
    updateBug,
    deleteBug
} from '../services/bug.services';
import { getCommentCountByBug } from '../services/comments.services';

/**
 * GET /bugs - Retrieve all bugs
 *
 * Returns a complete list of all bugs in the system.
 * Used for administrative views or when no filtering is required.
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export const getAllBugsController = async (req: Request, res: Response) => {
    try {
        const bugs = await getAllBugs();
        res.json({ bugs });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

/**
 * GET /bugs/:id - Retrieve a specific bug by ID
 *
 * Fetches a single bug for detailed viewing or editing.
 * Returns 404 if the bug doesn't exist.
 *
 * @param req - Express request object with bug ID in params
 * @param res - Express response object
 */
export const getBugByIdController = async (req: Request, res: Response) => {
    try {
        const bugId = parseInt(req.params.id);
        if (isNaN(bugId)) {
            return res.status(400).json({ message: "Invalid bug ID: must be a number" });
        }
        const bug = await getBugById(bugId);
        if (!bug) {
            return res.status(404).json({ message: "Bug not found" });
        }
        res.json({ bug });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

/**
 * GET /bugs/project/:projectId - Retrieve bugs for a specific project
 *
 * Returns all bugs associated with a particular project.
 * Essential for project dashboards and bug tracking within projects.
 *
 * @param req - Express request object with projectId in params
 * @param res - Express response object
 */
export const getBugsByProjectController = async (req: Request, res: Response) => {
    try {
        const projectId = parseInt(req.params.projectId);
        if (isNaN(projectId)) {
            return res.status(400).json({ message: "Invalid project ID: must be a number" });
        }
        const bugs = await getBugsByProject(projectId);
        res.json({ bugs });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

/**
 * GET /bugs/assignee/:assigneeId - Retrieve bugs assigned to a user
 *
 * Shows the workload/tasks assigned to a specific team member.
 * Used for personal dashboards and task management.
 *
 * @param req - Express request object with assigneeId in params
 * @param res - Express response object
 */
export const getBugsByAssigneeController = async (req: Request, res: Response) => {
    try {
        const assigneeId = parseInt(req.params.assigneeId);
        if (isNaN(assigneeId)) {
            return res.status(400).json({ message: "Invalid assignee ID: must be a number" });
        }
        const bugs = await getBugsByAssignee(assigneeId);
        res.json({ bugs });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

/**
 * GET /bugs/reporter/:reporterId - Retrieve bugs reported by a user
 *
 * Shows the bug reporting history of a specific user.
 * Useful for user profiles and tracking contribution patterns.
 *
 * @param req - Express request object with reporterId in params
 * @param res - Express response object
 */
export const getBugsByReporterController = async (req: Request, res: Response) => {
    try {
        const reporterId = parseInt(req.params.reporterId);
        if (isNaN(reporterId)) {
            return res.status(400).json({ message: "Invalid reporter ID: must be a number" });
        }
        const bugs = await getBugsByReporter(reporterId);
        res.json({ bugs });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

/**
 * GET /bugs/status/:status - Retrieve bugs by status
 *
 * Filters bugs by their current status (Open, In Progress, Resolved, etc.).
 * Essential for workflow management and status-based reporting.
 *
 * @param req - Express request object with status in params
 * @param res - Express response object
 */
export const getBugsByStatusController = async (req: Request, res: Response) => {
    try {
        const status = req.params.status;
        const bugs = await getBugsByStatus(status);
        res.json({ bugs });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

/**
 * POST /bugs - Create a new bug
 *
 * Creates a new bug report in the system.
 * Expects bug data in request body and returns the created bug with 201 status.
 *
 * @param req - Express request object with bug data in body
 * @param res - Express response object
 */
export const createBugController = async (req: Request, res: Response) => {
    try {
        const bugData = req.body;
        const bug = await createBug(bugData);
        res.status(201).json({
            message: "Bug created successfully",
            bug
        });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

/**
 * PUT /bugs/:id - Update an existing bug
 *
 * Modifies an existing bug with new information.
 * Supports partial updates - only provided fields are changed.
 * Restricted to bug reporters, assignees, or administrators.
 * Returns 404 if the bug doesn't exist.
 *
 * @param req - Express request object with bug ID in params and update data in body
 * @param res - Express response object
 */
export const updateBugController = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const bugId = parseInt(req.params.id);

        if (isNaN(bugId)) {
            return res.status(400).json({ message: "Invalid bug ID: must be a number" });
        }

        // Get bug to check ownership
        const existingBug = await getBugById(bugId);
        if (!existingBug) {
            return res.status(404).json({ message: "Bug not found" });
        }

        // Check permissions: admin or reporter or assignee
        if (user.role !== 'Admin' && user.userId !== existingBug.reportedby && user.userId !== existingBug.assignedto) {
            return res.status(403).json({ message: "Forbidden: Only bug reporters, assignees, or administrators can update bugs" });
        }

        const bugData = req.body;
        const bug = await updateBug(bugId, bugData);
        res.json({
            message: "Bug updated successfully",
            bug
        });
    } catch (error: any) {
        if (error.message === "No update data provided") {
            return res.status(400).json({ message: error.message });
        }
        handleControllerError(error, res);
    }
};

/**
 * DELETE /bugs/:id - Delete a bug
 *
 * Permanently removes a bug from the system.
 * Associated comments are automatically deleted due to CASCADE constraints.
 * Restricted to bug reporters, assignees, or administrators.
 * Warns about associated comments.
 * Returns 404 if the bug doesn't exist.
 *
 * @param req - Express request object with bug ID in params
 * @param res - Express response object
 */
export const deleteBugController = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const bugId = parseInt(req.params.id);

        if (isNaN(bugId)) {
            return res.status(400).json({ message: "Invalid bug ID: must be a number" });
        }

        // Get bug to check ownership and dependencies
        const existingBug = await getBugById(bugId);
        if (!existingBug) {
            return res.status(404).json({ message: "Bug not found" });
        }

        // Check permissions: admin or reporter or assignee
        if (user.userId !== existingBug.reportedby && user.userId !== existingBug.assignedto) {
            return res.status(403).json({ message: "Forbidden: Only bug reporters, assignees, or administrators can delete bugs" });
        }

        // Check for dependencies (comments)
        const commentCount = await getCommentCountByBug(bugId);
        if (commentCount > 0 && !(req.body && req.body.force)) {
            return res.status(409).json({
                message: `Bug has ${commentCount} associated comment(s). Deletion will cascade and remove all comments. Add {"force": true} to body to confirm.`,
                commentCount,
                requiresConfirmation: true
            });
        }

        const deleted = await deleteBug(bugId);
        res.json({ message: "Bug deleted successfully" });
    } catch (error: any) {
        if (error.message === "Invalid bug ID") {
            return res.status(400).json({ message: error.message });
        }
        handleControllerError(error, res);
    }
};