const path = require('path');
// Load .env from the backend root directory, regardless of CWD
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = require('./app');
const { initDb } = require('./config/db');
const { runSeed } = require('./utils/seedRunner');

const PORT = process.env.PORT || 5000;

// Validate AI configuration on startup (without printing the key itself)
function validateAiConfig() {
  const key = (process.env.AI_API_KEY || '').trim();
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
  if (key && key.length > 5) {
    console.log(`  - AI Provider: ${provider.toUpperCase()} — API key detected (${key.length} chars), ready to connect.`);
  } else {
    console.warn('  - AI Provider: WARNING — AI_API_KEY is missing or empty in backend/.env. Chatbot will return setup-required responses.');
  }
}

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
      validateAiConfig();
      console.log(`=========================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
