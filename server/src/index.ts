import app from './app.js';
import { initializeDatabase } from './config/database.js';

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Initialize database
    console.log('Initializing database...');
    initializeDatabase();
    console.log('Database initialized successfully');

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`API base URL: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();