import multer from "multer";

const storage = multer.memoryStorage(); // recommended for uploading to cloud
export const upload = multer({ storage });
