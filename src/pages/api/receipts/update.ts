import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/config/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PUT" || req.method === "POST") {
    const {
      invoice_id,
      user_id,
      title,
      bill_to,
      date_created,
      amount_paid,
      amount_due,
      due_date,
      status,
    } = req.body;

    if (!invoice_id) {
      return res.status(400).json({ error: "Receipt id is required" });
    }

    try {
      const result = await pool.query(
        `UPDATE invoices 
         SET user_id = $1,
             title = $2,
             bill_to = $3,
             date_created = $4,
             amount_paid = $5,
             amount_due = $6,
             due_date = $7,
             status = $8
         WHERE invoice_id = $9
         RETURNING *`,
        [
          user_id,
          title,
          bill_to,
          date_created,
          amount_paid,
          amount_due,
          due_date,
          status,
          invoice_id,
        ]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Receipt not found" });
      }
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error("Error updating receipt:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["PUT", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
