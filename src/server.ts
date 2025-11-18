/**
 * Server entry point
 */

import 'dotenv/config';
import { createApp } from './app';
import { prisma } from './utils/db';

const PORT = process.env.PORT || 3000;

const app = createApp();

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✓ Database connected');

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ API available at http://localhost:${PORT}${process.env.API_PREFIX || '/api'}`);
      console.log(`✓ Health check: http://localhost:${PORT}${process.env.API_PREFIX || '/api'}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
