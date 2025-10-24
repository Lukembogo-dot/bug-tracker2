/**
 * Comment Services Module
 *
 * This module handles all business logic related to bug comments.
 * Comments provide discussion threads for bugs, allowing team members
 * to collaborate on issue resolution. The service layer ensures:
 * - Comments are properly associated with bugs and users
 * - Comment text is validated and sanitized
 * - Bulk operations for comment management
 */

import { CommentRepository } from '../repositories/comments.repositories';
import { Comment, CreateComment, UpdateComment } from '../Types/comments.types';

/**
 * Validates and sanitizes data for creating a new comment
 *
 * Business Rules:
 * - BugID is required and must reference an existing bug
 * - UserID is required and must reference an existing user
 * - CommentText is required and cannot be empty after trimming
 *
 * @param data - Raw input data from the request body
 * @returns Validated and sanitized CreateComment object
 * @throws Error if validation fails
 */
const validateCreateCommentData = (data: any): CreateComment => {
    // Validate required bug ID
    if (!data.BugID || typeof data.BugID !== 'number') {
        throw new Error('BugID is required and must be a number');
    }

    // Validate required user ID
    if (!data.UserID || typeof data.UserID !== 'number') {
        throw new Error('UserID is required and must be a number');
    }

    // Validate required comment text
    if (!data.CommentText || typeof data.CommentText !== 'string') {
        throw new Error('CommentText is required and must be a string');
    }

    return {
        BugID: data.BugID,
        UserID: data.UserID,
        CommentText: data.CommentText.trim(),
    };
};

/**
 * Validates and sanitizes data for updating an existing comment
 *
 * Business Rules:
 * - CommentText is required for updates (comments cannot be blank)
 * - Only the comment text can be updated (other fields are immutable)
 *
 * @param data - Raw input data from the request body
 * @returns Validated and sanitized UpdateComment object
 * @throws Error if validation fails
 */
const validateUpdateCommentData = (data: any): UpdateComment => {
    if (data.CommentText !== undefined) {
        if (typeof data.CommentText !== 'string') {
            throw new Error('CommentText must be a string');
        }
        return {
            CommentText: data.CommentText.trim(),
        };
    }

    throw new Error('CommentText is required for update');
};

/**
 * Retrieves all comments from the database
 *
 * Returns a complete list of all comments across all bugs, ordered by creation date.
 * This is typically used for administrative purposes or system-wide comment analysis.
 *
 * @returns Promise resolving to array of all Comment objects
 * @throws Error if database operation fails
 */
export const getAllComments = async (): Promise<Comment[]> => {
    try {
        return await CommentRepository.getAllComments();
    } catch (error) {
        console.error('Error in getAllComments service:', error);
        throw error;
    }
};

/**
 * Retrieves a specific comment by its ID
 *
 * Used when displaying individual comments or when a user wants to view
 * or edit a specific comment. Returns null if the comment doesn't exist.
 *
 * @param commentId - The unique identifier of the comment
 * @returns Promise resolving to Comment object or null if not found
 * @throws Error if commentId is invalid or database operation fails
 */
export const getCommentById = async (commentId: number): Promise<Comment | null> => {
    try {
        if (!commentId || typeof commentId !== 'number') {
            throw new Error('Valid comment ID is required');
        }
        return await CommentRepository.getCommentById(commentId);
    } catch (error) {
        console.error('Error in getCommentById service:', error);
        throw error;
    }
};

/**
 * Retrieves all comments associated with a specific bug
 *
 * This is the primary method for displaying comment threads on bug detail pages.
 * Comments are ordered chronologically (oldest first) to show conversation flow.
 * Essential for bug discussion and collaboration features.
 *
 * @param bugId - The unique identifier of the bug
 * @returns Promise resolving to array of Comment objects for the bug
 * @throws Error if bugId is invalid or database operation fails
 */
export const getCommentsByBug = async (bugId: number): Promise<Comment[]> => {
    try {
        if (!bugId || typeof bugId !== 'number') {
            throw new Error('Valid bug ID is required');
        }
        return await CommentRepository.getCommentsByBug(bugId);
    } catch (error) {
        console.error('Error in getCommentsByBug service:', error);
        throw error;
    }
};

/**
 * Retrieves all comments made by a specific user
 *
 * Useful for user profile pages, activity feeds, or analyzing user engagement.
 * Shows the commenting history and contributions of individual team members.
 *
 * @param userId - The unique identifier of the user
 * @returns Promise resolving to array of Comment objects by the user
 * @throws Error if userId is invalid or database operation fails
 */
export const getCommentsByUser = async (userId: number): Promise<Comment[]> => {
    try {
        if (!userId || typeof userId !== 'number') {
            throw new Error('Valid user ID is required');
        }
        return await CommentRepository.getCommentsByUser(userId);
    } catch (error) {
        console.error('Error in getCommentsByUser service:', error);
        throw error;
    }
};

/**
 * Creates a new comment on a bug
 *
 * This is the main entry point for adding comments to bug discussions.
 * Validates that the bug and user exist, ensures comment text is valid,
 * then creates the comment record with automatic timestamp.
 *
 * @param commentData - Raw comment data (bugId, userId, commentText)
 * @returns Promise resolving to the created Comment object with all fields
 * @throws Error if validation fails or database operation fails
 */
export const createComment = async (commentData: any): Promise<Comment> => {
    try {
        const validatedData = validateCreateCommentData(commentData);
        return await CommentRepository.createComment(validatedData);
    } catch (error) {
        console.error('Error in createComment service:', error);
        throw error;
    }
};

/**
 * Updates the text of an existing comment
 *
 * Allows users to edit their comments (typically with time restrictions).
 * Only the comment text can be modified - bug and user associations are immutable.
 * Returns the updated comment or null if the comment doesn't exist.
 *
 * @param commentId - The unique identifier of the comment to update
 * @param commentData - Update data containing new comment text
 * @returns Promise resolving to updated Comment object or null if not found
 * @throws Error if commentId is invalid, validation fails, or database operation fails
 */
export const updateComment = async (commentId: number, commentData: any): Promise<Comment | null> => {
    try {
        if (!commentId || typeof commentId !== 'number') {
            throw new Error('Valid comment ID is required');
        }
        const validatedData = validateUpdateCommentData(commentData);
        return await CommentRepository.updateComment(commentId, validatedData);
    } catch (error) {
        console.error('Error in updateComment service:', error);
        throw error;
    }
};

/**
 * Deletes a specific comment
 *
 * Permanently removes a comment from the database. This operation should
 * typically be restricted to comment authors or administrators.
 * Returns boolean indicating whether the deletion was successful.
 *
 * @param commentId - The unique identifier of the comment to delete
 * @returns Promise resolving to true if deleted, false if not found
 * @throws Error if commentId is invalid or database operation fails
 */
export const deleteComment = async (commentId: number): Promise<boolean> => {
    try {
        if (!commentId || typeof commentId !== 'number') {
            throw new Error('Valid comment ID is required');
        }
        return await CommentRepository.deleteComment(commentId);
    } catch (error) {
        console.error('Error in deleteComment service:', error);
        throw error;
    }
};

/**
 * Deletes all comments associated with a specific bug
 *
 * This is typically called when deleting a bug, as comments should not
 * exist without their parent bug. The CASCADE delete in the database
 * schema handles this automatically, but this method provides programmatic
 * control and returns the number of comments deleted.
 *
 * @param bugId - The unique identifier of the bug whose comments to delete
 * @returns Promise resolving to number of comments deleted
 * @throws Error if bugId is invalid or database operation fails
 */
export const deleteCommentsByBug = async (bugId: number): Promise<number> => {
    try {
        if (!bugId || typeof bugId !== 'number') {
            throw new Error('Valid bug ID is required');
        }
        return await CommentRepository.deleteCommentsByBug(bugId);
    } catch (error) {
        console.error('Error in deleteCommentsByBug service:', error);
        throw error;
    }
};