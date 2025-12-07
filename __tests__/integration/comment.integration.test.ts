import request from 'supertest';
import app from '../../src/index';

describe('Comment Routes Integration Tests', () => {
  let authToken: string;
  let userId: number;
  let projectId: number;
  let bugId: number;
  let commentId: number;

  beforeAll(async () => {
    // Register and login user with unique email
    const uniqueEmail = `commenttest${Date.now()}@example.com`;
    const registerResponse = await request(app)
      .post('/users/register')
      .send({
        username: 'commenttester',
        email: uniqueEmail,
        password: 'password123',
        role: 'user'
      });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body).toHaveProperty('user');
    userId = registerResponse.body.user.UserID;

    const loginResponse = await request(app)
      .post('/users/login')
      .send({
        email: uniqueEmail,
        password: 'password123'
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty('token');
    authToken = loginResponse.body.token;

    // Create a project
    const projectResponse = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        ProjectName: 'Test Project for Comments',
        description: 'A project for testing comments'
      });

    expect(projectResponse.status).toBe(201);
    expect(projectResponse.body).toHaveProperty('project');
    projectId = projectResponse.body.project.ProjectID;

    // Create a bug
    const bugResponse = await request(app)
      .post('/bugs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Bug for Comments',
        description: 'This is a test bug for comments',
        status: 'Open',
        priority: 'High',
        projectid: projectId,
        reportedby: userId
      });

    expect(bugResponse.status).toBe(201);
    expect(bugResponse.body).toHaveProperty('bug');
    bugId = bugResponse.body.bug.BugID;
  }, 30000);

  afterAll(async () => {
    // Cleanup: Delete test data in reverse order
    if (commentId) {
      await request(app)
        .delete(`/comments/${commentId}`)
        .set('Authorization', `Bearer ${authToken}`);
    }
    if (bugId) {
      await request(app)
        .delete(`/bugs/${bugId}`)
        .set('Authorization', `Bearer ${authToken}`);
    }
    if (projectId) {
      await request(app)
        .delete(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`);
    }
  }, 30000);

  describe('POST /comments', () => {
    it('should create a new comment successfully', async () => {
      const response = await request(app)
        .post('/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bugid: bugId,
          userid: userId,
          commenttext: 'This is a test comment'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Comment created successfully');
      expect(response.body).toHaveProperty('comment');
      expect(response.body.comment).toHaveProperty('commentid');
      expect(response.body.comment).toHaveProperty('bugid', bugId);
      expect(response.body.comment).toHaveProperty('userid', userId);
      expect(response.body.comment).toHaveProperty('commenttext', 'This is a test comment');

      commentId = response.body.comment.commentid;
    });

    it('should fail to create comment without authentication', async () => {
      const response = await request(app)
        .post('/comments')
        .send({
          bugid: bugId,
          userid: userId,
          commenttext: 'Unauthorized comment'
        });

      expect(response.status).toBe(401);
    });

    it('should fail to create comment with invalid data', async () => {
      const response = await request(app)
        .post('/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bugid: 'invalid',
          userid: userId,
          commenttext: 'Invalid bug ID'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /comments', () => {
    it('should get all comments', async () => {
      const response = await request(app)
        .get('/comments')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('comments');
      expect(Array.isArray(response.body.comments)).toBe(true);
      expect(response.body.comments.length).toBeGreaterThanOrEqual(1);
    });

    it('should get comment by id', async () => {
      const response = await request(app)
        .get(`/comments/${commentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('comment');
      expect(response.body.comment.commentid).toBe(commentId);
    });

    it('should return 404 for non-existent comment', async () => {
      const response = await request(app)
        .get('/comments/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Comment not found');
    });

    it('should fail to get comment with invalid ID', async () => {
      const response = await request(app)
        .get('/comments/abc')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid comment ID: must be a number');
    });
  });

  describe('GET /comments/bug/:bugId', () => {
    it('should get comments by bug ID', async () => {
      const response = await request(app)
        .get(`/comments/bug/${bugId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('comments');
      expect(Array.isArray(response.body.comments)).toBe(true);
    });

    it('should fail with invalid bug ID', async () => {
      const response = await request(app)
        .get('/comments/bug/abc')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid bug ID: must be a number');
    });
  });

  describe('GET /comments/user/:userId', () => {
    it('should get comments by user ID', async () => {
      const response = await request(app)
        .get(`/comments/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('comments');
      expect(Array.isArray(response.body.comments)).toBe(true);
    });

    it('should fail with invalid user ID', async () => {
      const response = await request(app)
        .get('/comments/user/abc')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid user ID: must be a number');
    });
  });

  describe('PUT /comments/:id', () => {
    it('should update comment successfully', async () => {
      const response = await request(app)
        .put(`/comments/${commentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          commenttext: 'Updated test comment'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Comment updated successfully');
      expect(response.body).toHaveProperty('comment');
      expect(response.body.comment.commenttext).toBe('Updated test comment');
    });

    it('should fail to update non-existent comment', async () => {
      const response = await request(app)
        .put('/comments/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          commenttext: 'Update non-existent'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Comment not found');
    });

    it('should fail to update with invalid data', async () => {
      const response = await request(app)
        .put(`/comments/${commentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          commenttext: ''
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /comments/:id', () => {
    let tempCommentId: number;

    beforeAll(async () => {
      // Create a temporary comment for deletion test
      const response = await request(app)
        .post('/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bugid: bugId,
          userid: userId,
          commenttext: 'Temporary comment for deletion'
        });
      tempCommentId = response.body.comment.commentid;
    });

    it('should delete comment successfully', async () => {
      const response = await request(app)
        .delete(`/comments/${tempCommentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Comment deleted successfully');
    });

    it('should fail to delete non-existent comment', async () => {
      const response = await request(app)
        .delete('/comments/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Comment not found');
    });

    it('should fail to delete with invalid ID', async () => {
      const response = await request(app)
        .delete('/comments/abc')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid comment ID: must be a number');
    });
  });

  describe('DELETE /comments/bug/:bugId', () => {
    let tempBugId: number;
    let tempCommentId: number;

    beforeAll(async () => {
      // Create temporary bug and comment for bulk deletion test
      const bugResponse = await request(app)
        .post('/bugs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Temp Bug for Bulk Delete',
          description: 'Temporary bug',
          status: 'Open',
          priority: 'Low',
          projectid: projectId,
          reportedby: userId
        });
      tempBugId = bugResponse.body.bug.BugID;

      const commentResponse = await request(app)
        .post('/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bugid: tempBugId,
          userid: userId,
          commenttext: 'Temp comment for bulk delete'
        });
      tempCommentId = commentResponse.body.comment.commentid;
    });

    it('should delete all comments by bug ID', async () => {
      const response = await request(app)
        .delete(`/comments/bug/${tempBugId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('comments deleted successfully');
    });

    it('should fail with invalid bug ID', async () => {
      const response = await request(app)
        .delete('/comments/bug/abc')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid bug ID: must be a number');
    });

    afterAll(async () => {
      // Cleanup temp bug
      if (tempBugId) {
        await request(app)
          .delete(`/bugs/${tempBugId}`)
          .set('Authorization', `Bearer ${authToken}`);
      }
    });
  });
});