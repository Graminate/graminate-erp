import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import pool from "@/config/database";

export async function POST(req: NextRequest) {
  try {
    const {
      first_name,
      last_name,
      email,
      phone_number,
      business_name,
      date_of_birth,
      password,
    } = await req.json();

    if (!first_name || !last_name || !email || !phone_number || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if the user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR phone_number = $2",
      [email, phone_number]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: "Email or phone number already in use" },
        { status: 409 }
      );
    }

    // Hash password using argon2
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      hashLength: 16,
      timeCost: 2,
      memoryCost: 2 ** 16,
      parallelism: 1,
    });

    // Insert new user into the database
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, phone_number, business_name, date_of_birth, password) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING user_id, first_name, last_name, email, phone_number, business_name`,
      [
        first_name,
        last_name,
        email,
        phone_number,
        business_name,
        date_of_birth,
        hashedPassword,
      ]
    );

    return NextResponse.json(
      { message: "User registered successfully", user: result.rows[0] },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error registering user:", err);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
