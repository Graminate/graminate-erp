import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/config/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Extract data from request body
  const {
    user_id,
    company_name,
    owner_name,
    email,
    phone_number,
    address,
    type,
  } = req.body;

  // Validate required fields
  if (
    !user_id ||
    !company_name ||
    !owner_name ||
    !email ||
    !phone_number ||
    !address ||
    !type
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO companies (user_id, company_name, owner_name, email, phone_number, address, type) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [user_id, company_name, owner_name, email, phone_number, address, type]
    );

    return res.status(201).json({
      message: "Company added successfully",
      company: result.rows[0],
    });
  } catch (err) {
    console.error("Error adding company:", err);
    return res.status(500).json({ error: "Failed to add company" });
  }
}
