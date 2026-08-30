import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let dbState = {
  isConnected: false,
  isMemory: false,
  uri: "",
  host: "",
  error: null,
};

export const getDbStatus = () => ({
  ...dbState,
  host: mongoose.connection?.host || "",
  name: mongoose.connection?.name || "",
});

export const connectDB = async () => {
  if (dbState.isConnected && mongoose.connection.readyState === 1) return;

  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/playsphere";

  try {
    // Attempt direct connection with optimized pool and timeout
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 50,
      minPoolSize: 5,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    dbState.isConnected = true;
    dbState.isMemory = false;
    dbState.uri = mongoUri;
    dbState.host = mongoose.connection.host;
    console.log(`[MongoDB] Connected to database: ${mongoose.connection.host}`);
  } catch (err) {
    dbState.error = err.message;
    console.warn(`[MongoDB] Direct connection to ${mongoUri} failed (${err.message}).`);
    console.log("[MongoDB] Initializing automated in-memory MongoDB fallback instance...");

    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      dbState.isConnected = true;
      dbState.isMemory = true;
      dbState.uri = uri;
      dbState.host = mongoose.connection.host;
      console.log(`[MongoDB] Successfully connected to In-Memory MongoDB at ${uri}`);
    } catch (memErr) {
      console.error("[MongoDB] Failed to start in-memory MongoDB instance:", memErr.message);
    }
  }
};

mongoose.connection.on("disconnected", () => {
  dbState.isConnected = false;
  console.log("[MongoDB] Connection disconnected.");
});

export default connectDB;
