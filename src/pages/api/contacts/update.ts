import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/config/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, first_name, last_name, email, phone_number, address, type } =
    req.body;

  console.log("Received request method:", req.method);
  if (!id) {
    return res.status(400).json({ error: "Contact ID is required" });
  }

  const parsedId = parseInt(id as string, 10);
  if (isNaN(parsedId)) {
    return res.status(400).json({ error: "Invalid contact ID" });
  }

  try {
    const existingContact = await pool.query(
      "SELECT * FROM contacts WHERE contact_id = $1",
      [parsedId]
    );

    if (existingContact.rows.length === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }

    const result = await pool.query(
      `UPDATE contacts 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           email = COALESCE($3, email),
           phone_number = COALESCE($4, phone_number),
           address = COALESCE($5, address),
           type = COALESCE($6, type)
       WHERE contact_id = $7
       RETURNING *`,
      [first_name, last_name, email, phone_number, address, type, parsedId]
    );

    return res.status(200).json({
      message: "Contact updated successfully",
      contact: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating contact:", err);
    return res.status(500).json({ error: "Failed to update contact" });
  }
}
