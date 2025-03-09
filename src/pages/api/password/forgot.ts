import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import argon2 from "argon2";
import pool from "@/config/database";
import nodemailer from "nodemailer";
import fs from "fs";
import mjml2html from "mjml";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateEmailHTML = (resetLink: string, firstName: string): string => {
  const mjmlTemplate = fs.readFileSync(
    "src/templates/resetPasswordEmail.mjml",
    "utf8"
  );
  const personalizedTemplate = mjmlTemplate
    .replace("{{firstName}}", firstName)
    .replace("{{resetLink}}", resetLink);
  const htmlOutput = mjml2html(personalizedTemplate);
  return htmlOutput.html;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await pool.query(
      "SELECT first_name FROM users WHERE email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const firstName = user.rows[0].first_name;
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await argon2.hash(resetToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO password_resets (email, token, expires_at) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (email) DO UPDATE SET token = $2, expires_at = $3`,
      [email, hashedToken, expiresAt]
    );

    const resetLink = `http://localhost:3000/reset_password?token=${resetToken}&email=${email}`;
    const emailHTML = generateEmailHTML(resetLink, firstName);

    await transporter.sendMail({
      to: email,
      subject: "Reset Your Graminate Password",
      html: emailHTML,
    });

    return res
      .status(200)
      .json({ message: "Password reset link sent to email." });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
