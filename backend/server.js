import "dotenv/config";
import app from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { env } from "./config/env.js";

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    console.log(`Server listening on port ${env.PORT}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start();
