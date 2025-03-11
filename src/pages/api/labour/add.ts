import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/config/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: "Method Not Allowed", message: "Use POST instead" });
  }

  try {
    const {
      user_id,
      full_name,
      date_of_birth,
      gender,
      guardian_name,
      address,
      contact_number,
      aadhar_card_number,
    } = req.body;

    // Validate required fields
    if (
      !user_id ||
      !full_name ||
      !date_of_birth ||
      !gender ||
      !guardian_name ||
      !address ||
      !contact_number ||
      !aadhar_card_number
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Insert data into the database
    const query = `
      INSERT INTO labours (user_id, full_name, date_of_birth, gender, guardian_name, address, contact_number, aadhar_card_number, role) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Worker') 
      RETURNING *;
    `;

    const values = [
      user_id,
      full_name,
      date_of_birth,
      gender,
      guardian_name,
      address,
      contact_number,
      aadhar_card_number,
    ];

    const { rows } = await pool.query(query, values);

    return res
      .status(201)
      .json({ message: "Labour added successfully", labour: rows[0] });
  } catch (error) {
    console.error("Error inserting labour:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
