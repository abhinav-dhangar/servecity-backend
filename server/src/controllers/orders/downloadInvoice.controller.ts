import { Request, Response } from "express";
import puppeteer from "puppeteer";
import { supabase } from "@utils/supa.conn";
import { invoiceTemplate } from "@utils/invoiceTemplate";

export const downloadInvoiceController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user.id;
    const orderId = Number(req.params.orderId);

    // 1️⃣ Fetch order (ownership check)
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("userId", userId)
      .single();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 2️⃣ Fetch order items + services
    const { data: items } = await supabase
      .from("orderItems")
      .select("price, services(title)")
      .eq("orderId", orderId);

    // 3️⃣ Fetch address
    const { data: address } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", order.addressId)
      .single();

    // 4️⃣ Generate PDF
    const browser = await puppeteer.launch({
      headless: "new",
    });
    const page = await browser.newPage();

    const html = invoiceTemplate({
      order,
      items,
      address,
      invoiceNo: order?.id,
    });

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4" });

    await browser.close();

    // 5️⃣ Upload to Supabase Storage
    const filePath = `invoice/order-${orderId}.pdf`;

    const { error: uploadErr } = await supabase.storage
      .from("rough")
      .upload(filePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadErr) {
      return res.status(500).json({ message: "Upload failed" });
    }

    // 6️⃣ Generate signed URL
    const { data: signedUrl } = await supabase.storage
      .from("rough")
      .createSignedUrl(filePath, 60 * 5); // 5 min

    return res.json({
      downloadUrl: signedUrl?.signedUrl,
    });
  } catch (err) {
    console.error("Invoice Error:", err);
    return res.status(500).json({ message: "Failed to generate invoice" });
  }
};
