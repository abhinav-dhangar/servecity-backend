import { Request, Response } from "express";
import { supabase } from "@utils/supa.conn";
import { uploadFileToSupabase } from "@utils/uploadFilesToSupabse";
import { verificationSchema } from "@src/schema/worker.verification.zod";

export const submitVerificationController = async (
  req: Request,
  res: Response
) => {
  try {
    // =====================================================
    // AUTH CHECK
    // =====================================================
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = user.id;

    // =====================================================
    // VALIDATE BODY
    // =====================================================
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

      // address fields
      street,
      pinCode,
    } = parsed.data.body;

    // =====================================================
    // FILE UPLOADS
    // =====================================================
    let avatarUrl: string | null = null;
    let aadhaarUrl: string | null = null;

    if (req.files) {
      const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };

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

    // =====================================================
    // STEP 1: INSERT INTO WORKERS
    // =====================================================
    const { data: worker, error: workerError } = await supabase
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
          isVerified: false,
        },
      ])
      .select()
      .single();

    if (workerError) {
      return res.status(500).json({
        message: "Failed to submit verification",
        error: workerError,
      });
    }

    // =====================================================
    // STEP 2: UPDATE PROFILE (same as editProfileController)
    // =====================================================
    const profileUpdateData: any = {};
    if (fullName !== undefined) profileUpdateData.fullName = fullName;
    if (phone !== undefined) profileUpdateData.phone = phone;
    if (avatarUrl !== null) profileUpdateData.avatar = avatarUrl;
    profileUpdateData.role = "worker";

    const { error: profileError } = await supabase
      .from("profiles")
      .update(profileUpdateData)
      .eq("userId", userId);

    if (profileError) {
      return res.status(500).json({
        message: "Profile update failed",
        error: profileError,
      });
    }

    // =====================================================
    // STEP 3: CREATE ADDRESS (same logic as createAddressController)
    // =====================================================
    const { count, error: addressCheckError } = await supabase
      .from("addresses")
      .select("id", { count: "exact", head: true })
      .eq("userId", userId);

    if (addressCheckError) {
      return res.status(500).json({
        message: "Error checking address",
        error: addressCheckError,
      });
    }

    if ((count ?? 0) >= 3) {
      return res.status(400).json({
        message: "Maximum address limit reached",
      });
    }

    const { data: address, error: addressError } = await supabase
      .from("addresses")
      .insert({
        userId,
        roadStreet: street || houseDetails,
        city,
        state,
        pinCode,
        fullName,
        phone,
      })
      .select()
      .single();

    if (addressError) {
      return res.status(500).json({
        message: "Address creation failed",
        error: addressError,
      });
    }

    // =====================================================
    // SUCCESS RESPONSE
    // =====================================================
    return res.status(201).json({
      message: "Verification submitted successfully",
      worker,
      address,
    });
  } catch (err) {
    console.error("Submit Verification Error:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
