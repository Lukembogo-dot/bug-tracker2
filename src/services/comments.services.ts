import { CommentRepository } from "../repositories/comments.repositories";
import { BugRepository } from "../repositories/bugs.repositories";
import { UserRepository } from "../repositories/user.repositories";
import { Comment, CreateComment, UpdateComment } from "../Types/comments.types";
import { Response } from 'express';
import { Request } from 'express';

const validateAndParseCommentData = async (body: any): Promise<CreateComment> => {
    const { BugID, UserID, CommentText } = body ?? {};

    if (!BugID || !UserID || !CommentText) {
        throw new Error("Missing required fields: BugID, UserID, and CommentText are required");
    }

    if (typeof BugID !== 'number' || typeof UserID !== 'number' || typeof CommentText !== 'string') {
        throw new Error("Invalid field types: BugID and UserID must be numbers, CommentText must be string");
    }

    const commentText = CommentText.trim();
    if (commentText.length === 0) {
        throw new Error("CommentText cannot be empty");
    }

    // Validate bug exists
    const bug = await BugRepository.getBugById(BugID);
    if (!bug) {
        throw new Error("Invalid BugID: Bug does not exist");
    }

    // Validate user exists
    const user = await UserRepository.getUserById(UserID);
    if (!user) {
        throw new Error("Invalid UserID: User does not exist");
    }

    return {
        BugID,
        UserID,
        CommentText: commentText
    };
};

const validateAndParseUpdateCommentData = (body: any): UpdateComment => {
    const { CommentText } = body ?? {};

    if (CommentText !== undefined && (typeof CommentText !== 'string' || CommentText.trim().length === 0)) {
        throw new Error("Invalid CommentText: Must be non-empty string");
    }

    return {
        CommentText: CommentText ? CommentText.trim() : undefined
    };
};

// Get all comments
export const getAllComments = async (req: Request, res: Response) => {
    try {
        const comments: Comment[] = await CommentRepository.getAllComments();
        return res.status(200).json(comments);
    } catch (error: any) {
        console.error('Error fetching comments:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get comment by ID
export const getCommentById = async (req: Request, res: Response) => {
    try {
        const commentId = parseInt(req.params.id, 10);
        if (isNaN(commentId)) {
            return res.status(400).json({ message: 'Invalid comment ID' });
        }

        const comment: Comment | null = await CommentRepository.getCommentById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        return res.status(200).json(comment);
    } catch (error: any) {
        console.error('Error fetching comment by ID:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get comments by bug
export const getCommentsByBug = async (req: Request, res: Response) => {
    try {
        const bugId = parseInt(req.params.bugId, 10);
        if (isNaN(bugId)) {
            return res.status(400).json({ message: 'Invalid bug ID' });
        }

        const comments: Comment[] = await CommentRepository.getCommentsByBug(bugId);
        return res.status(200).json(comments);
    } catch (error: any) {
        console.error('Error fetching comments by bug:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get comments by user
export const getCommentsByUser = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const comments: Comment[] = await CommentRepository.getCommentsByUser(userId);
        return res.status(200).json(comments);
    } catch (error: any) {
        console.error('Error fetching comments by user:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Create new comment
export const createComment = async (req: Request, res: Response) => {
    console.log("Comment received", req.body);
    if (!req.body) {
        console.log("Comment creation requires body");
        return res.status(400).json({ message: "Please provide comment data" });
    }

    try {
        const newComment = await validateAndParseCommentData(req.body);
        console.log("Comment parsed", newComment);

        const createdComment = await CommentRepository.createComment(newComment);

        res.status(201).json({
            message: "Comment created successfully",
            comment: createdComment
        });
    } catch (error: any) {
        console.error('Error creating comment:', error);
        if (error.message.includes('Missing required fields') ||
            error.message.includes('Invalid field types') ||
            error.message.includes('Invalid') ||
            error.message.includes('cannot be empty')) {
            return res.status(400).json({
                message: "Validation failed",
                error: error.message
            });
        }
        res.status(500).json({
            message: "Failed to create comment",
            error: error.message
        });
    }
};

// Update comment
export const updateComment = async (req: Request, res: Response) => {
    try {
        const commentId = parseInt(req.params.id, 10);
        if (isNaN(commentId)) {
            return res.status(400).json({ message: 'Invalid comment ID' });
        }

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "No update data provided" });
        }

        const updateData = validateAndParseUpdateCommentData(req.body);

        const updatedComment = await CommentRepository.updateComment(commentId, updateData);
        if (!updatedComment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        res.json({
            message: "Comment updated successfully",
            comment: updatedComment
        });
    } catch (error: any) {
        console.error('Error updating comment:', error);
        if (error.message.includes('Invalid') ||
            error.message.includes('Comment text is required')) {
            return res.status(400).json({
                message: "Validation failed",
                error: error.message
            });
        }
        res.status(500).json({
            message: "Failed to update comment",
            error: error.message
        });
    }
};

// Delete comment
export const deleteComment = async (req: Request, res: Response) => {
    try {
        const commentId = parseInt(req.params.id, 10);
        if (isNaN(commentId)) {
            return res.status(400).json({ message: 'Invalid comment ID' });
        }

        const deleted = await CommentRepository.deleteComment(commentId);
        if (!deleted) {
            return res.status(404).json({ message: "Comment not found" });
        }

        res.json({ message: "Comment deleted successfully" });
    } catch (error: any) {
        console.error('Error deleting comment:', error);
        res.status(500).json({
            message: "Failed to delete comment",
            error: error.message
        });
    }
};

// Delete all comments for a bug
export const deleteCommentsByBug = async (req: Request, res: Response) => {
    try {
        const bugId = parseInt(req.params.bugId, 10);
        if (isNaN(bugId)) {
            return res.status(400).json({ message: 'Invalid bug ID' });
        }

        const deletedCount = await CommentRepository.deleteCommentsByBug(bugId);

        res.json({
            message: `Deleted ${deletedCount} comments for bug ${bugId}`
        });
    } catch (error: any) {
        console.error('Error deleting comments by bug:', error);
        res.status(500).json({
            message: "Failed to delete comments",
            error: error.message
        });
    }
};