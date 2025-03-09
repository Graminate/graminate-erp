import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import mjml2html from "mjml";
import { otpStore } from "@/stores/stores";

dotenv.config();

const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOtpEmailHTML = (otp: string): string => {
  try {
    const templatePath = path.resolve("src/templates/verifyEmail.mjml");

    if (!fs.existsSync(templatePath)) {
      console.error("Template file not found:", templatePath);
      return `<p>Your OTP is: <strong>${otp}</strong></p>`;
    }

    const mjmlTemplate = fs.readFileSync(templatePath, "utf8");

    const otpFormatted = otp
      .split("")
      .map((digit) => `<span class="otp-digit">${digit}</span>`)
      .join("");

    const personalizedTemplate = mjmlTemplate.replace(
      "{{otpDigits}}",
      otpFormatted
    );

    const htmlOutput = mjml2html(personalizedTemplate);

    return htmlOutput.html;
  } catch (error) {
    console.error("Error generating OTP email template:", error);
    return `<p>Your OTP is: <strong>${otp}</strong></p>`;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { email } = req.body;

    console.log("Received request body:", req.body);
    console.log("Extracted email:", email);

    if (!email || typeof email !== "string") {
      console.error("Error: Invalid or missing email");
      return res.status(400).json({ error: "Valid email is required" });
    }

    const otp = generateOtp();
    otpStore[email] = otp;

    const emailHTML = generateOtpEmailHTML(otp);

    await transporter.sendMail({
      from: `"Graminate" <no-reply@graminate.com>`,
      to: email,
      subject: "Verify your Email",
      html: emailHTML,
      text: `OTP for Email Verification: ${otp}`,
    });

    console.log("OTP sent to:", email);

    return res.status(200).json({ message: "OTP sent successfully." });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
