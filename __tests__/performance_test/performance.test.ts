import request from 'supertest';
import app from '../../src/index';

describe('Performance Tests', () => {
  let authToken: string;
  let userId: number;
  let projectIds: number[] = [];
  let bugIds: number[] = [];
  let commentIds: number[] = [];

  beforeAll(async () => {
    // Setup: Register and login user
    const uniqueEmail = `perf${Date.now()}@example.com`;
    const registerResponse = await request(app)
      .post('/users/register')
      .send({
        username: 'perftester',
        email: uniqueEmail,
        password: 'password123',
        role: 'user'
      });
    userId = registerResponse.body.user.UserID;

    const loginResponse = await request(app)
      .post('/users/login')
      .send({
        email: uniqueEmail,
        password: 'password123'
      });
    authToken = loginResponse.body.token;

    // Create test data
    for (let i = 0; i < 5; i++) {
      const projectResponse = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ProjectName: `Performance Project ${i}`,
          description: `Test project ${i} for performance testing`
        });
      projectIds.push(projectResponse.body.project.ProjectID);

      const bugResponse = await request(app)
        .post('/bugs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: `Performance Bug ${i}`,
          description: `Test bug ${i}`,
          status: 'Open',
          priority: 'Medium',
          projectid: projectIds[i],
          reportedby: userId
        });
      bugIds.push(bugResponse.body.bug.BugID);

      const commentResponse = await request(app)
        .post('/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bugid: bugIds[i],
          userid: userId,
          commenttext: `Performance comment ${i}`
        });
      commentIds.push(commentResponse.body.comment.commentid);
    }
  }, 30000); // Increase timeout for setup

  afterAll(async () => {
    // Cleanup: Delete test data
    for (const commentId of commentIds) {
      await request(app)
        .delete(`/comments/${commentId}`)
        .set('Authorization', `Bearer ${authToken}`);
    }
    for (const bugId of bugIds) {
      await request(app)
        .delete(`/bugs/${bugId}`)
        .set('Authorization', `Bearer ${authToken}`);
    }
    for (const projectId of projectIds) {
      await request(app)
        .delete(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`);
    }
  }, 30000);

  describe('CRUD Operations Performance', () => {
    it('should handle multiple GET requests within time limit', async () => {
      const startTime = Date.now();

      // Perform multiple GET requests
      const promises = [
        request(app).get('/projects').set('Authorization', `Bearer ${authToken}`),
        request(app).get('/bugs').set('Authorization', `Bearer ${authToken}`),
        request(app).get('/comments').set('Authorization', `Bearer ${authToken}`),
        request(app).get(`/projects/${projectIds[0]}`).set('Authorization', `Bearer ${authToken}`),
        request(app).get(`/bugs/${bugIds[0]}`).set('Authorization', `Bearer ${authToken}`),
        request(app).get(`/comments/${commentIds[0]}`).set('Authorization', `Bearer ${authToken}`)
      ];

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // All requests should succeed
      results.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should complete within 2 seconds
      expect(duration).toBeLessThan(2000);
      console.log(`Multiple GET operations completed in ${duration}ms`);
    }, 10000);

    it('should handle concurrent CREATE operations efficiently', async () => {
      const startTime = Date.now();

      // Create multiple projects concurrently
      const createPromises = [];
      for (let i = 0; i < 3; i++) {
        createPromises.push(
          request(app)
            .post('/projects')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              ProjectName: `Concurrent Project ${i}`,
              description: `Concurrent test project ${i}`
            })
        );
      }

      const results = await Promise.all(createPromises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // All creations should succeed
      results.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('project');
      });

      // Should complete within 3 seconds
      expect(duration).toBeLessThan(3000);
      console.log(`Concurrent CREATE operations completed in ${duration}ms`);

      // Cleanup concurrent projects
      for (const result of results) {
        await request(app)
          .delete(`/projects/${result.body.project.ProjectID}`)
          .set('Authorization', `Bearer ${authToken}`);
      }
    }, 10000);

    it('should handle UPDATE operations within acceptable time', async () => {
      const startTime = Date.now();

      // Update multiple resources
      const updatePromises = [
        request(app)
          .put(`/projects/${projectIds[0]}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            ProjectName: 'Updated Performance Project'
          }),
        request(app)
          .put(`/bugs/${bugIds[0]}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'Updated Performance Bug'
          }),
        request(app)
          .put(`/comments/${commentIds[0]}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            commenttext: 'Updated performance comment'
          })
      ];

      const results = await Promise.all(updatePromises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // All updates should succeed
      results.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should complete within 2 seconds
      expect(duration).toBeLessThan(2000);
      console.log(`UPDATE operations completed in ${duration}ms`);
    }, 10000);

    it('should handle DELETE operations efficiently', async () => {
      // Create temporary resources for deletion test
      const tempProject = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ProjectName: 'Temp Delete Project',
          description: 'Temporary project for delete test'
        });

      const tempBug = await request(app)
        .post('/bugs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Temp Delete Bug',
          description: 'Temporary bug for delete test',
          status: 'Open',
          priority: 'Low',
          projectid: tempProject.body.project.ProjectID,
          reportedby: userId
        });

      const tempComment = await request(app)
        .post('/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bugid: tempBug.body.bug.BugID,
          userid: userId,
          commenttext: 'Temp delete comment'
        });

      const startTime = Date.now();

      // Delete in reverse order (comment -> bug -> project)
      const deletePromises = [
        request(app)
          .delete(`/comments/${tempComment.body.comment.commentid}`)
          .set('Authorization', `Bearer ${authToken}`),
        request(app)
          .delete(`/bugs/${tempBug.body.bug.BugID}`)
          .set('Authorization', `Bearer ${authToken}`),
        request(app)
          .delete(`/projects/${tempProject.body.project.ProjectID}`)
          .set('Authorization', `Bearer ${authToken}`)
      ];

      const results = await Promise.all(deletePromises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // All deletions should succeed
      results.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should complete within 2 seconds
      expect(duration).toBeLessThan(2000);
      console.log(`DELETE operations completed in ${duration}ms`);
    }, 10000);
  });

  describe('Load Testing', () => {
    it('should handle repeated requests without degradation', async () => {
      const iterations = 10;
      const responseTimes: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        const response = await request(app)
          .get('/projects')
          .set('Authorization', `Bearer ${authToken}`);
        const endTime = Date.now();

        expect(response.status).toBe(200);
        responseTimes.push(endTime - startTime);
      }

      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);

      console.log(`Average response time: ${avgResponseTime}ms`);
      console.log(`Max response time: ${maxResponseTime}ms`);

      // Average should be under 500ms, max under 1000ms
      expect(avgResponseTime).toBeLessThan(500);
      expect(maxResponseTime).toBeLessThan(1000);
    }, 30000);
  });
});