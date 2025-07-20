import path from "path";

export const getUploadDir = () => {
  return process.env.NODE_ENV === "production"
    ? process.env.UPLOAD_DIR || "/var/www/uploads"
    : path.join(process.cwd(), "public/uploads");
};
