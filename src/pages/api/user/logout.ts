import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/config/database";
import { serialize } from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const sessionId = req.cookies.sid;

  if (!sessionId) {
    return res.status(400).json({ error: "No active session found." });
  }

  try {
    await pool.query("DELETE FROM session WHERE sid = $1", [sessionId]);

    res.setHeader(
      "Set-Cookie",
      serialize("sid", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        path: "/",
      })
    );

    return res.status(200).json({ message: "Logout successful." });
  } catch (err) {
    console.error("Error during logout:", err);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
}
