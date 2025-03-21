import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/config/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const {
      user_id,
      title,
      bill_to,
      amount_paid,
      amount_due,
      due_date,
      status,
    } = req.body;

    // 🔍 Debugging: Log incoming data
    console.log("Received Data:", req.body);

    // 🚨 Validate required fields
    if (!user_id || !title || !bill_to || !amount_due || !due_date || !status) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Ensure amount fields are valid numbers
    const amountPaidValue = amount_paid ? parseFloat(amount_paid) : 0;
    const amountDueValue = parseFloat(amount_due);
    if (isNaN(amountPaidValue) || isNaN(amountDueValue)) {
      return res.status(400).json({ error: "Invalid amount values." });
    }

    // Validate date format
    const isValidDate = (date: string) => !isNaN(Date.parse(date));
    if (!isValidDate(due_date)) {
      return res
        .status(400)
        .json({ error: "Invalid due date format. Expected YYYY-MM-DD." });
    }

    // Insert into the database
    const query = `
      INSERT INTO invoices (user_id, title, bill_to, amount_paid, amount_due, due_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const values = [
      user_id,
      title,
      bill_to,
      amountPaidValue,
      amountDueValue,
      due_date,
      status,
    ];

    const result = await pool.query(query, values);

    console.log("Inserted Invoice:", result.rows[0]);

    return res.status(201).json({
      message: "Invoice added successfully",
      invoice: result.rows[0],
    });
  } catch (error) {
    console.error("Error adding invoice:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
