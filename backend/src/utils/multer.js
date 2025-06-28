// utils/multer.ts
import multer from 'multer';




const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); // Temporary local folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

export default upload;