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
        id, 
        position, 
        type, 
        mode, 
        description, 
        tasks, 
        requirements, 
        benefits
      FROM jobs
    `);

    const jobs = result.rows.map((job: any) => ({
      id: job.id,
      position: job.position,
      type: job.type,
      mode: job.mode,
      description: job.description,
      tasks: job.tasks || [],
      requirements: job.requirements || [],
      benefits: job.benefits || [],
    }));

    res.status(200).json({ jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
