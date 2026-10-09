require('dotenv').config();
const app = require('./app');
const { initDb } = require('./config/db');
const { runSeed } = require('./utils/seedRunner');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 1. Initialize Database
    await initDb();

    // 2. Populate Seed Data if empty
    await runSeed();

    // 3. Listen on port
    app.listen(PORT, () => {
      console.log(`=========================================================`);
      console.log(`  INTERNHUB BACKEND API RUNNING AT http://localhost:${PORT}`);
      console.log(`  - REST API Engine Ready`);
      console.log(`  - JWT Auth & Role-Based Authorization Active`);
      console.log(`  - PostgreSQL Driver Connected (with SQLite auto-fallback)`);
      console.log(`  - C++ DSA Engine Bridge Connected`);
      console.log(`  - AI Service (Gemini/OpenAI + DSA Fallback) Ready`);
      console.log(`=========================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
