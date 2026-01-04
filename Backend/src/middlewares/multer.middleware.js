import multer from "multer";
import path from "path";
import { ApiError } from "../utils/ApiError.js";

/* ---------- FILE TYPE VALIDATION ---------- */
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extName = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        "Only image files are allowed (jpeg, jpg, png, webp)"
      ),
      false
    );
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {

    // to add a suffix code in filename
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // cb(null, file.fieldname + '-' + uniqueSuffix)

    cb(null, file.originalname)
  }
})

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // ✅ 2MB limit
  }
  })