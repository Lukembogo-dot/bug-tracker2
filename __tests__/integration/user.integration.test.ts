import request from 'supertest';
import app from '../../src/index';

// Mock the database functions to avoid external dependencies
jest.mock('../../src/repositories/user.repositories');
jest.mock('../../src/repositories/projects.repositories');
jest.mock('../../src/repositories/bugs.repositories');
jest.mock('../../src/repositories/comments.repositories');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('User Routes Integration Tests', () => {
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    // Setup mocks
    const { UserRepository } = require('../../src/repositories/user.repositories');
    const bcrypt = require('bcrypt');
    const jwt = require('jsonwebtoken');

    // Mock bcrypt functions
    bcrypt.hash.mockResolvedValue('$2b$10$test.hashed.password');
    bcrypt.compare.mockResolvedValue(true);

    // Mock JWT
    jwt.sign.mockReturnValue('mock.jwt.token');

    // Mock successful user registration
    UserRepository.getUserByEmail.mockResolvedValue(null); // No existing user
    UserRepository.createUser.mockResolvedValue({
      userid: 1,
      username: 'testuser',
      email: 'test@example.com',
      passwordhash: '$2b$10$test.hashed.password',
      role: 'user',
      createdat: new Date()
    });

    // Register a test user
    const registerResponse = await request(app)
      .post('/api/users/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      });
    expect(registerResponse.status).toBe(201);
    userId = registerResponse.body.user.UserID;

    // Mock successful login
    UserRepository.getUserByEmail.mockResolvedValue({
      userid: 1,
      username: 'testuser',
      email: 'test@example.com',
      passwordhash: '$2b$10$test.hash',
      role: 'user',
      createdat: new Date()
    });

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    expect(loginResponse.status).toBe(200);
    authToken = loginResponse.body.token;
  });

  beforeEach(() => {
    // Reset mocks before each test
    const { UserRepository } = require('../../src/repositories/user.repositories');
    jest.clearAllMocks();

    // Set up default mocks
    UserRepository.getAllUsers.mockResolvedValue([{
      userid: 1,
      username: 'testuser',
      email: 'test@example.com',
      passwordhash: '$2b$10$test.hash',
      role: 'user',
      createdat: new Date()
    }]);
  });

  it('should get all users', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('users');
    expect(Array.isArray(response.body.users)).toBe(true);
  });

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        role: 'user'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'User created successfully');
    expect(response.body).toHaveProperty('user');
  });

  it('should login user', async () => {
    // Register a user for this test
    const testEmail = `login${Date.now()}@example.com`;
    await request(app)
      .post('/api/users/register')
      .send({
        username: 'logintest',
        email: testEmail,
        password: 'password123',
        role: 'user'
      });

    const response = await request(app)
      .post('/api/users/login')
      .send({
        email: testEmail,
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Login successful');
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
  });

  it('should get user profile', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
  });

  it('should update user profile', async () => {
    const response = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        username: 'updateduser',
        email: 'updated@example.com',
        role: 'user'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Profile updated successfully');
    expect(response.body).toHaveProperty('user');
  });

  it('should change user password', async () => {
    const response = await request(app)
      .put('/api/users/change-password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: 'password123',
        newPassword: 'newpassword123'
      });

    expect(response.status).toBe(204);
  });

  it('should delete user', async () => {
    const response = await request(app)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(204);
  });
});