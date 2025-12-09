import { closePool } from '../db/config';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Clean up after each test to prevent data conflicts
afterEach(async () => {
  // Note: In a real application, you might want to clean up test data here
  // For now, we'll rely on unique emails/timestamps to avoid conflicts
});

// Clean up after all tests
afterAll(async () => {
  // Close database connection if needed
  try {
    await closePool();
  } catch (error) {
    // Ignore errors during cleanup
  }
});