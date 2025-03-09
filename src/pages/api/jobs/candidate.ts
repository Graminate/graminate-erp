import type { NextApiRequest, NextApiResponse } from "next";
import pool from "../../../config/database";
import cors, { runMiddleware } from "../../../lib/corsMiddleware"; // Import CORS

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors); // Apply CORS middleware

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res
      .status(405)
      .json({ error: `Method '${req.method}' Not Allowed` });
  }

  try {
    const result = await pool.query(`
      SELECT 
        ja.id, 
        j.position AS job_position, 
        ja.first_name, 
        ja.last_name, 
        ja.email, 
        ja.phone, 
        ja.portfolio, 
        ja.cv_file, 
        ja.applied_at
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      ORDER BY ja.applied_at DESC
    `);

    res.status(200).json({ applications: result.rows });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
