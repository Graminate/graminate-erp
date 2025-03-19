import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/config/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PUT" || req.method === "POST") {
    const {
      invoice_id,
      user_id,
      title,
      bill_to,
      ship_to,
      payment_terms,
      due_date,
      po_number,
      notes,
      terms,
      amount_paid,
      amount_due,
      status,
      tax,
      discount,
      shipping,
      items,
    } = req.body;

    if (!invoice_id) {
      return res.status(400).json({ error: "Receipt ID is required" });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const invoiceUpdateQuery = `
        UPDATE invoices 
        SET user_id = $1,
            title = $2,
            bill_to = $3,
            ship_to = $4,
            payment_terms = $5,
            due_date = $6,
            po_number = $7,
            notes = $8,
            terms = $9,
            amount_paid = $10,
            amount_due = $11,
            status = $12,
            tax = $13,
            discount = $14,
            shipping = $15
        WHERE invoice_id = $16
        RETURNING *;
      `;

      const invoiceUpdateValues = [
        user_id,
        title,
        bill_to,
        ship_to,
        payment_terms,
        due_date,
        po_number,
        notes,
        terms,
        amount_paid,
        amount_due,
        status,
        tax,
        discount,
        shipping,
        invoice_id,
      ];

      const invoiceResult = await client.query(
        invoiceUpdateQuery,
        invoiceUpdateValues
      );

      if (invoiceResult.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Receipt not found" });
      }

      if (Array.isArray(items) && items.length > 0) {
        await client.query("DELETE FROM invoice_items WHERE invoice_id = $1", [
          invoice_id,
        ]);

        const itemInsertQuery = `
          INSERT INTO invoice_items (invoice_id, description, quantity, rate) 
          VALUES ($1, $2, $3, $4);
        `;

        for (const item of items) {
          await client.query(itemInsertQuery, [
            invoice_id,
            item.description,
            item.quantity,
            item.rate,
          ]);
        }
      }

      await client.query("COMMIT"); // Commit transaction
      res.status(200).json({ success: true, invoice: invoiceResult.rows[0] });
    } catch (error) {
      await client.query("ROLLBACK"); // Rollback transaction on error
      console.error("Error updating receipt:", error);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      client.release();
    }
  } else {
    res.setHeader("Allow", ["PUT", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
