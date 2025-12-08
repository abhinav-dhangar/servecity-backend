// controllers/profile/editProfile.controller.ts
import { Request, Response } from "express";
import { supabase } from "@utils/supa.conn";

export const editProfileController = async (req: Request, res: Response) => {
  try {
    const user = req.user; // auth middleware already added it

    if (!user || !user.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Body will come from FormData
    const { userName, phone } = req.body;

    // File from multer or busboy:
    const avatarFile = req.file; // if you're using upload.single("avatar")

    let avatar_url = undefined;

    // 🔹 Upload avatar if provided
    if (avatarFile) {
      const fileName = `avatars/${
        user.id
      }-${Date.now()}.${avatarFile.originalname.split(".").pop()}`;

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("rough")
        .upload(fileName, avatarFile.buffer, {
          contentType: avatarFile.mimetype,
          upsert: true,
        });

      if (uploadErr) {
        console.error(uploadErr);
        return res.status(400).json({ error: "Avatar upload failed" });
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("rough")
        .getPublicUrl(uploadData.path);

      avatar_url = publicUrlData.publicUrl || "";
    }

    // 🔹 Prepare update object
    const updateData: any = {};
    if (userName !== undefined) updateData.fullName = userName;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar_url !== undefined) updateData.avatar = avatar_url;

    // Nothing to update?
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    // 🔹 Update profile in DB
    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("userId", user.id)
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Update failed" });
    }

    return res.json({
      message: "Profile updated successfully",
      profile: data,
    });
  } catch (err) {
    console.error("Edit Profile Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
