import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Create a new pool instance
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false, // Enable SSL for production
});

// Log connection success/failure
pool.connect((err) => {
  if (err) {
    console.error("Error connecting to PostgreSQL:", err);
  } else {
    console.log(" Connected to PostgreSQL database");
  }
});

export default pool;
