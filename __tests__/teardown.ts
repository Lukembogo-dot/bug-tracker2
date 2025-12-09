import { closePool } from '../db/config';

export default async function globalTeardown() {
  try {
    // Close database connection
    await closePool();
    console.log('✅ Database connection closed after tests');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
}