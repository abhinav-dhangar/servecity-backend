import { randomUUID } from "crypto";
import { supabase } from "./supa.conn";
import { Express } from "express";
export async function uploadFileToSupabase(
  file: Express.Multer.File,
  folder: string
) {
  const ext = file.originalname.split(".").pop();
  const fileName = `${folder}/${randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("rough")
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from("rough")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}
