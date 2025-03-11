import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/config/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: "Deal ID is required" });
  }

  const parsedId = parseInt(id as string, 10);
  if (isNaN(parsedId)) {
    return res.status(400).json({ error: "Invalid deal ID" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM deals WHERE deal_id = $1 RETURNING *",
      [parsedId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Contract not found" });
    }

    return res.status(200).json({
      message: "Contract deleted successfully",
      contract: result.rows[0],
    });
  } catch (err) {
    console.error("Error deleting contract:", err);
    return res.status(500).json({ error: "Failed to delete contract" });
  }
}
