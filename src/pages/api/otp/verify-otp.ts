import { NextApiRequest, NextApiResponse } from "next";
import { otpStore } from "@/stores/stores";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method Not Allowed" });
  }

  console.log("Received request body:", req.body);

  const { email, otp } = req.body;

  if (!email || !otp) {
    console.error("Error: Email or OTP missing");
    return res
      .status(400)
      .json({ success: false, message: "Email and OTP are required" });
  }

  console.log("Stored OTP for email:", otpStore[email]);

  if (otpStore[email] && otpStore[email] === otp) {
    delete otpStore[email];
    return res
      .status(200)
      .json({ success: true, message: "OTP verified successfully" });
  } else {
    console.error("Error: Invalid OTP");
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }
}
