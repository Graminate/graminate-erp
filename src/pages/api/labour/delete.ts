import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/config/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Get labour_id from query parameter
    const labour_id = req.query.id as string;

    // Validate input
    if (!labour_id) {
      return res
        .status(400)
        .json({ error: "Missing labour_id in query parameter" });
    }

    // Delete the labour record
    const query = `DELETE FROM labours WHERE labour_id = $1 RETURNING *;`;
    const values = [labour_id];

    const { rowCount, rows } = await pool.query(query, values);

    if (rowCount === 0) {
      return res.status(404).json({ error: "Labour not found" });
    }

    return res
      .status(200)
      .json({ message: "Labour deleted successfully", deletedLabour: rows[0] });
  } catch (error) {
    console.error("Error deleting labour:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
