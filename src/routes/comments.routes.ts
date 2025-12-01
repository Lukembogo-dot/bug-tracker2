import type { Express } from "express";
import * as commentController from "../controllers/comment.controller";

const commentRoutes = (app:Express) => {
    // GET /api/comments - Retrieve all comments
    app.get('/api/comments', commentController.getAllCommentsController);

    // GET /api/comments/:id - Retrieve a specific comment by ID
    app.get('/api/comments/:id', commentController.getCommentByIdController);

    // GET /api/comments/bug/:bugId - Retrieve all comments for a specific bug
    app.get('/api/comments/bug/:bugId', commentController.getCommentsByBugController);

    // GET /api/comments/user/:userId - Retrieve all comments by a specific user
    app.get('/api/comments/user/:userId', commentController.getCommentsByUserController);

    // POST /api/comments - Create a new comment
    app.post('/api/comments', commentController.createCommentController);

    // PUT /api/comments/:id - Update an existing comment
    app.put('/api/comments/:id', commentController.updateCommentController);

    // DELETE /api/comments/:id - Delete a specific comment
    app.delete('/api/comments/:id', commentController.deleteCommentController);

    // DELETE /api/comments/bug/:bugId - Delete all comments for a specific bug
    app.delete('/api/comments/bug/:bugId', commentController.deleteCommentsByBugController);
}

export default commentRoutes;