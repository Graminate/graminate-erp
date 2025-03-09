import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/config/database";
import argon2 from "argon2";
import { v4 as uuidv4 } from "uuid";
import { serialize } from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = result.rows[0];

    // Verify password with Argon2
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Create a session ID
    const sessionId = uuidv4();
    const sessionData = {
      userId: user.user_id,
      createdAt: new Date().toISOString(),
    };
    const expireDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days

    // Store session in database
    await pool.query(
      "INSERT INTO session (sid, sess, expire) VALUES ($1, $2, $3)",
      [sessionId, JSON.stringify(sessionData), expireDate]
    );

    // Set session cookie manually
    res.setHeader(
      "Set-Cookie",
      serialize("sid", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3 * 24 * 60 * 60, // 3 days
        path: "/",
      })
    );

    return res.status(200).json({
      message: "Login successful",
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        business_name: user.business_name,
      },
    });
  } catch (err) {
    console.error(
      "Error during login:",
      err instanceof Error ? err.message : err
    );
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
}
