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
      full_name,
      date_of_birth,
      gender,
      guardian_name,
      address,
      contact_number,
      aadhar_card_number,
      voter_id,
      ration_card,
      pan_card,
      driving_license,
      mnrega_job_card_number,
      bank_account_number,
      ifsc_code,
      bank_name,
      bank_branch,
      disability_status,
      role,
      epfo,
      esic,
      pm_kisan,
    } = req.body;

    console.log("Received Labour Data:", req.body);

    // Validate required fields
    if (
      !user_id ||
      !full_name ||
      !date_of_birth ||
      !gender ||
      !guardian_name ||
      !address ||
      !contact_number ||
      !aadhar_card_number ||
      !role
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Insert into database
    const query = `
      INSERT INTO labours (
        user_id, full_name, date_of_birth, gender, guardian_name, address, 
        contact_number, aadhar_card_number, voter_id, ration_card, pan_card, 
        driving_license, mnrega_job_card_number, bank_account_number, ifsc_code, 
        bank_name, bank_branch, disability_status, role, epfo, esic, pm_kisan
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
      ) RETURNING *;
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
      voter_id || null,
      ration_card || null,
      pan_card || null,
      driving_license || null,
      mnrega_job_card_number || null,
      bank_account_number || null,
      ifsc_code || null,
      bank_name || null,
      bank_branch || null,
      disability_status || false,
      role,
      epfo || null,
      esic || null,
      pm_kisan || false,
    ];

    const result = await pool.query(query, values);
    console.log("Inserted Labour:", result.rows[0]);

    return res.status(201).json({
      message: "Labour added successfully",
      labour: result.rows[0],
    });
  } catch (error) {
    console.error("Error adding labour:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
