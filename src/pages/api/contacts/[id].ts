import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/config/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { id } = req.query;

  try {
    let result;

    if (id) {
      const parsedId = parseInt(id as string, 10);

      if (isNaN(parsedId)) {
        return res.status(400).json({ error: "Invalid user ID parameter" });
      }

      result = await pool.query(
        `SELECT * FROM contacts WHERE user_id = $1 ORDER BY created_at DESC`,
        [parsedId]
      );
    } else {
      result = await pool.query(
        `SELECT * FROM contacts ORDER BY created_at DESC`
      );
    }

    return res.status(200).json({ contacts: result.rows });
  } catch (err) {
    console.error("Error fetching contacts:", err);
    return res.status(500).json({ error: "Failed to fetch contacts" });
  }
}
