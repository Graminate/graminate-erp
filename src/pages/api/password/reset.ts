import type { NextApiRequest, NextApiResponse } from "next";
import argon2 from "argon2";
import pool from "@/config/database";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const resetRecord = await pool.query(
      "SELECT * FROM password_resets WHERE email = $1",
      [email]
    );

    if (resetRecord.rows.length === 0) {
      return res.status(400).json({ error: "Invalid token" });
    }

    const { token: storedToken, expires_at } = resetRecord.rows[0];

    if (new Date() > new Date(expires_at)) {
      return res.status(400).json({ error: "Token expired" });
    }

    const isMatch = await argon2.verify(storedToken, token);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid token" });
    }

    const userResult = await pool.query(
      "SELECT password FROM users WHERE email = $1",
      [email]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const currentHashedPassword = userResult.rows[0].password;
    if (await argon2.verify(currentHashedPassword, newPassword)) {
      return res
        .status(400)
        .json({ error: "Please enter a different password" });
    }

    const hashedPassword = await argon2.hash(newPassword);
    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [
      hashedPassword,
      email,
    ]);
    await pool.query("DELETE FROM password_resets WHERE email = $1", [email]);

    return res.status(200).json({ message: "Password successfully reset" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
