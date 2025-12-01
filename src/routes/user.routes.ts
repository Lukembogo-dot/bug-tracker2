import type { Express } from "express";
import * as userController from "../controllers/user.controller";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";

const userRoutes = (app:Express) => {
    // GET /users - Get all users
    app.get('/users', requireAuth, userController.getAllUsersController);

    // POST /users/register - Create a new user
    app.post('/users/register', userController.createUserController);

    // POST /users/login - Login user
    app.post('/users/login', userController.loginUserController);

    // GET /users/profile - Get current user profile
    app.get('/users/profile', requireAuth, userController.getUserProfileController);

    // PUT /users/profile - Update user profile
    app.put('/users/profile', requireAuth, userController.updateUserProfileController);

    // PUT /users/change-password - Change password
    app.put('/users/change-password', requireAuth, userController.updateUserPasswordController);

    // DELETE /users/:id - Delete user
    app.delete('/users/:id', requireAuth, userController.deleteUserController);
}

export default userRoutes;