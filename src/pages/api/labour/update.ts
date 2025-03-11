import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/config/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const {
      labour_id,
      full_name,
      guardian_name,
      date_of_birth,
      gender,
      role,
      contact_number,
      aadhar_card_number,
      address,

      // Government Data
      voter_id,
      ration_card,
      pan_card,
      driving_license,
      mnrega_job_card_number,

      // Bank Data
      bank_account_number,
      ifsc_code,
      bank_name,
      bank_branch,

      // Other Fields
      disability_status,
      epfo,
      esic,
      pm_kisan,
    } = req.body;

    // Validate required fields
    if (!labour_id) {
      return res.status(400).json({ error: "Missing labour_id" });
    }

    // Build the dynamic update query
    const updateFields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (full_name) {
      updateFields.push(`full_name = $${index++}`);
      values.push(full_name);
    }
    if (guardian_name) {
      updateFields.push(`guardian_name = $${index++}`);
      values.push(guardian_name);
    }
    if (date_of_birth) {
      const formattedDate = date_of_birth.split("/").reverse().join("-"); // Convert DD/MM/YYYY to YYYY-MM-DD
      updateFields.push(`date_of_birth = $${index++}`);
      values.push(formattedDate);
    }
    if (gender) {
      updateFields.push(`gender = $${index++}`);
      values.push(gender);
    }
    if (role) {
      updateFields.push(`role = $${index++}`);
      values.push(role);
    }
    if (contact_number) {
      updateFields.push(`contact_number = $${index++}`);
      values.push(contact_number);
    }
    if (aadhar_card_number) {
      updateFields.push(`aadhar_card_number = $${index++}`);
      values.push(aadhar_card_number);
    }
    if (address) {
      updateFields.push(`address = $${index++}`);
      values.push(address);
    }

    // Government Data
    if (voter_id) {
      updateFields.push(`voter_id = $${index++}`);
      values.push(voter_id);
    }
    if (ration_card) {
      updateFields.push(`ration_card = $${index++}`);
      values.push(ration_card);
    }
    if (pan_card) {
      updateFields.push(`pan_card = $${index++}`);
      values.push(pan_card);
    }
    if (driving_license) {
      updateFields.push(`driving_license = $${index++}`);
      values.push(driving_license);
    }
    if (mnrega_job_card_number) {
      updateFields.push(`mnrega_job_card_number = $${index++}`);
      values.push(mnrega_job_card_number);
    }

    // Bank Data
    if (bank_account_number) {
      updateFields.push(`bank_account_number = $${index++}`);
      values.push(bank_account_number);
    }
    if (ifsc_code) {
      updateFields.push(`ifsc_code = $${index++}`);
      values.push(ifsc_code);
    }
    if (bank_name) {
      updateFields.push(`bank_name = $${index++}`);
      values.push(bank_name);
    }
    if (bank_branch) {
      updateFields.push(`bank_branch = $${index++}`);
      values.push(bank_branch);
    }

    // Other Fields
    if (disability_status !== undefined) {
      updateFields.push(`disability_status = $${index++}`);
      values.push(disability_status);
    }
    if (epfo) {
      updateFields.push(`epfo = $${index++}`);
      values.push(epfo);
    }
    if (esic) {
      updateFields.push(`esic = $${index++}`);
      values.push(esic);
    }
    if (pm_kisan !== undefined) {
      updateFields.push(`pm_kisan = $${index++}`);
      values.push(pm_kisan);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    values.push(labour_id);
    const updateQuery = `UPDATE labours SET ${updateFields.join(
      ", "
    )} WHERE labour_id = $${index} RETURNING *;`;

    const { rows } = await pool.query(updateQuery, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Labour not found" });
    }

    return res
      .status(200)
      .json({ message: "Labour updated successfully", updatedLabour: rows[0] });
  } catch (error) {
    console.error("Error updating labour:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
