import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/config/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PUT") {
    const { id } = req.query;
    const { first_name, last_name, phone_number, language, time_format } =
      req.body;

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    try {
      await pool.query(
        `UPDATE users 
       SET first_name = $1, last_name = $2, phone_number = $3, language = $4, time_format = $5 
       WHERE user_id = $6`,
        [first_name, last_name, phone_number, language, time_format, id]
      );

      return res.status(200).json({ message: "User updated successfully" });
    } catch (err) {
      console.error("Error updating user:", err);
      return res.status(500).json({ error: "Failed to update user" });
    }
  }

  // Ensure only GET requests are allowed
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { id } = req.query; // Get user ID from the request

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    return res.status(200).json({
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        business_name: user.business_name,
        imageUrl: user.image_url || null,
        language: user.language || "English",
        time_format: user.time_format || "24-hour",
      },
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
}
