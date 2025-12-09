import { closePool } from '../db/config';
import { teardownDatabase } from './dbSetup';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Clean up after each test to prevent data conflicts
afterEach(async () => {
  try {
    await teardownDatabase();
  } catch (error) {
    console.error('Error during test cleanup:', error);
  }
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