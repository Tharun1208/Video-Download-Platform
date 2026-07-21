import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);

async function testConnection() {
  try {
    await client.connect();
    console.log("✅ Connected successfully!");
    await client.close();
  } catch (error) {
    console.error("❌ Connection Error:");
    console.error(error);
  }
}

testConnection();