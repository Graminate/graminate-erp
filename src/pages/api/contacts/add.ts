import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/config/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { user_id, first_name, last_name, email, phone_number, type, address } =
    req.body;

  // Validate required fields
  if (
    !user_id ||
    !first_name ||
    !last_name ||
    !email ||
    !phone_number ||
    !type ||
    !address
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO contacts (user_id, first_name, last_name, email, phone_number, type, address) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [user_id, first_name, last_name, email, phone_number, type, address]
    );

    return res
      .status(201)
      .json({ message: "Contact added successfully", contact: result.rows[0] });
  } catch (err) {
    console.error("Error adding contact:", err);
    return res.status(500).json({ error: "Failed to add contact" });
  }
}
