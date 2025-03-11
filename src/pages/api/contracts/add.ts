import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/config/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { user_id, deal_name, partner, amount, stage, start_date, end_date } =
    req.body;

  try {
    const result = await pool.query(
      `INSERT INTO deals (user_id, deal_name, partner, amount, stage, start_date, end_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [user_id, deal_name, partner, amount, stage, start_date, end_date]
    );

    return res.status(201).json({
      message: "Contract added successfully",
      contract: result.rows[0],
    });
  } catch (err) {
    console.error("Error adding contract:", err);
    return res.status(500).json({ error: "Failed to add contract" });
  }
}
