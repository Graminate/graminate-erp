import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/config/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const {
    user_id,
    title,
    bill_to,
    date_created,
    amount_paid,
    amount_due,
    due_date,
    status,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO invoices (user_id, title, bill_to, date_created, amount_paid, amount_due, due_date, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        user_id,
        title,
        bill_to,
        date_created,
        amount_paid,
        amount_due,
        due_date,
        status,
      ]
    );

    return res.status(201).json({
      message: "Receipt added successfully",
      receipt: result.rows[0],
    });
  } catch (err) {
    console.error("Error adding receipt:", err);
    return res.status(500).json({ error: "Failed to add receipt" });
  }
}
