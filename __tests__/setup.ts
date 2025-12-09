import { getPool, closePool } from '../db/config';
import { setupDatabase } from './dbSetup';

export default async function globalSetup() {
  // Set test environment
  process.env.NODE_ENV = 'test';

  try {
    // Ensure database connection is established
    await getPool();
    console.log('✅ Database connected for tests');

    // Setup database tables if they don't exist
    await setupDatabase();
  } catch (error) {
    console.error('❌ Failed to setup database for tests:', error);
    throw error;
  }
}