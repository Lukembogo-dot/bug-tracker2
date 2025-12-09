import { getPool, closePool } from '../db/config';

export default async function globalSetup() {
  // Set test environment
  process.env.NODE_ENV = 'test';

  try {
    // Ensure database connection is established
    await getPool();
    console.log('✅ Database connected for tests');
  } catch (error) {
    console.error('❌ Failed to connect to database for tests:', error);
    throw error;
  }
}