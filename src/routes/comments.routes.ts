import type { Express } from "express";
import * as commentController from "../controllers/comment.controller";
import { requireAuth } from "../middleware/auth.middleware";

const commentRoutes = (app:Express) => {
    // GET /comments - Retrieve all comments
    app.get('/comments', requireAuth, commentController.getAllCommentsController);

    // GET /comments/:id - Retrieve a specific comment by ID
    app.get('/comments/:id', requireAuth, commentController.getCommentByIdController);

    // GET /comments/bug/:bugId - Retrieve all comments for a specific bug
    app.get('/comments/bug/:bugId', requireAuth, commentController.getCommentsByBugController);

    // GET /comments/user/:userId - Retrieve all comments by a specific user
    app.get('/comments/user/:userId', requireAuth, commentController.getCommentsByUserController);

    // POST /comments - Create a new comment
    app.post('/comments', requireAuth, commentController.createCommentController);

    // PUT /comments/:id - Update an existing comment
    app.put('/comments/:id', requireAuth, commentController.updateCommentController);

    // DELETE /comments/:id - Delete a specific comment
    app.delete('/comments/:id', requireAuth, commentController.deleteCommentController);

    // DELETE /comments/bug/:bugId - Delete all comments for a specific bug
    app.delete('/comments/bug/:bugId', requireAuth, commentController.deleteCommentsByBugController);
}

export default commentRoutes;