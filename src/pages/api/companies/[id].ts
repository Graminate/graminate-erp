import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/config/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query; // 'id' acts as userId in this case

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    let result;

    if (id) {
      const parsedUserId = parseInt(id as string, 10);

      if (isNaN(parsedUserId)) {
        return res.status(400).json({ error: "Invalid user ID parameter" });
      }

      result = await pool.query(
        `SELECT * FROM companies WHERE user_id = $1 ORDER BY created_at DESC`,
        [parsedUserId]
      );
    } else {
      result = await pool.query(
        `SELECT * FROM companies ORDER BY created_at DESC`
      );
    }

    return res.status(200).json({ companies: result.rows });
  } catch (err) {
    console.error("Error fetching companies:", err);
    return res.status(500).json({ error: "Failed to fetch companies" });
  }
}
