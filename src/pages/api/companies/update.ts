import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/config/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Extract data from request body
  const { id, company_name, owner_name, email, phone_number, address, type } =
    req.body;

  console.log("Received request method:", req.method);
  if (!id) {
    return res.status(400).json({ error: "Company ID is required" });
  }

  const parsedId = parseInt(id as string, 10);
  if (isNaN(parsedId)) {
    return res.status(400).json({ error: "Invalid company ID" });
  }

  try {
    // Check if company exists
    const existingCompany = await pool.query(
      "SELECT * FROM companies WHERE company_id = $1",
      [parsedId]
    );

    if (existingCompany.rows.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Update company details
    const result = await pool.query(
      `UPDATE companies 
       SET company_name = COALESCE($1, company_name),
           owner_name = COALESCE($2, owner_name),
           email = COALESCE($3, email),
           phone_number = COALESCE($4, phone_number),
           address = COALESCE($5, address),
           type = COALESCE($6, type)
       WHERE company_id = $7
       RETURNING *`,
      [company_name, owner_name, email, phone_number, address, type, parsedId]
    );

    return res.status(200).json({
      message: "Company updated successfully",
      company: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating company:", err);
    return res.status(500).json({ error: "Failed to update company" });
  }
}
