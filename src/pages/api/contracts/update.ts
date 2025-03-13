import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/config/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, deal_name, partner, amount, stage, start_date, end_date } =
    req.body;

  console.log("Received request method:", req.method);
  if (!id) {
    return res.status(400).json({ error: "Contract ID is required" });
  }

  const parsedId = parseInt(id as string, 10);
  if (isNaN(parsedId)) {
    return res.status(400).json({ error: "Invalid contract ID" });
  }

  try {
    const existingContract = await pool.query(
      "SELECT * FROM deals WHERE deal_id = $1",
      [parsedId]
    );

    if (existingContract.rows.length === 0) {
      return res.status(404).json({ error: "Contract not found" });
    }

    const result = await pool.query(
      `UPDATE deals 
       SET deal_name = COALESCE($1, deal_name),
           partner = COALESCE($2, partner),
           amount = COALESCE($3, amount),
           stage = COALESCE($4, stage),
           start_date = COALESCE($5, start_date),
           end_date = COALESCE($6, end_date)
       WHERE deal_id = $7
       RETURNING *`,
      [deal_name, partner, amount, stage, start_date, end_date, parsedId]
    );

    return res.status(200).json({
      message: "Contract updated successfully",
      contract: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating contract:", err);
    return res.status(500).json({ error: "Failed to update contract" });
  }
}
