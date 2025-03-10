import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/config/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Company ID is required" });
  }

  const parsedId = parseInt(id as string, 10);
  if (isNaN(parsedId)) {
    return res.status(400).json({ error: "Invalid company ID" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM companies WHERE company_id = $1 RETURNING *",
      [parsedId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    return res.status(200).json({
      message: "Company deleted successfully",
      company: result.rows[0],
    });
  } catch (err) {
    console.error("Error deleting company:", err);
    return res.status(500).json({ error: "Failed to delete company" });
  }
}
