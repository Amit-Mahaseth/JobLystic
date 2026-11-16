import multer from "multer";

/**
 * Multer middleware instance configured with in-memory buffer storage
 * and a 3 MB file size limit for resume PDF uploads.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 3 * 1024 * 1024
  }
})

export default upload