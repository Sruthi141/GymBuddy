import dotenv from 'dotenv';
dotenv.config();

// Reuse existing Express app from the JavaScript server for now.
// This gives us a TypeScript entrypoint without breaking current behavior.
// server.js already exports the configured Express app instance.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const app = require('../server');

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 GymBuddy API (TS entry) running on port ${PORT}`);
});

