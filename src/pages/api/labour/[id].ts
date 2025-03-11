import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/config/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { id } = req.query;
    console.log("API: Received id:", id);

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: "Invalid or missing id parameter" });
    }
    const userId = Number(id);

    const query = `SELECT * FROM labours WHERE user_id = $1 ORDER BY created_at DESC;`;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "No labour records found for this user" });
    }

    return res.status(200).json({ labours: result.rows });
  } catch (error) {
    console.error("API Error fetching labour data:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
