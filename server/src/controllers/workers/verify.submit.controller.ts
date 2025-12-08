import { Request, Response } from "express";
import { supabase } from "@utils/supa.conn";
import { uploadFileToSupabase } from "@utils/uploadFilesToSupabse";
import { verificationSchema } from "@src/schema/worker.verification.zod";

export const submitVerificationController = async (
  req: Request,
  res: Response
) => {
  try {
    // -------------------------
    // Validate Request Body
    // -------------------------
    const parsed = verificationSchema.safeParse({ body: req.body });

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid verification data",
        errors: parsed.error.flatten(),
      });
    }

    const {
      fullName,
      phone,
      houseDetails,
      city,
      state,
      pincode,
      categoryId,
      subCategoryId,
    } = parsed.data.body;

    const userId = req.user.id; // 👈 REQUIRED

    // -------------------------
    // UPLOAD FILES
    // -------------------------

    let avatarUrl: string | null = null;
    let aadhaarUrl: string | null = null;

    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (files.avatar?.[0]) {
        avatarUrl = await uploadFileToSupabase(
          files.avatar[0],
          "workers/avatar"
        );
      }

      if (files.aadhaar?.[0]) {
        aadhaarUrl = await uploadFileToSupabase(
          files.aadhaar[0],
          "workers/aadhaar"
        );
      }
    }

    // -------------------------
    // Insert into Workers Table
    // -------------------------
    const { data, error } = await supabase
      .from("workers")
      .insert([
        {
          userId,
          fullName,
          phone,
          houseDetails,
          city,
          state,
          pincode,
          categoryId,
          subCategoryId,
          avatar: avatarUrl,
          adharPhoto: aadhaarUrl,
          isVerified: false, // NEW worker goes to pending status
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        message: "Failed to submit verification",
        error,
      });
    }

    return res.status(201).json({
      message: "Verification submitted successfully",
      data,
    });
  } catch (err) {
    console.error("Submit Verification Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
