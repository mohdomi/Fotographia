import multer from 'multer';

// memory storage is being used so we could directly flow the image from our pc 
// to cloudinary or s3 stoarge without storing them on our servers. this will reduce server load.
// by not copying images at multiple positions like diskStorage instead just transfer it directly to a bucket storage using buffer streams.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 100, // Maximum 100 files (current limitation because of memory constraints i guess we could scale this afterwards)
  },
  fileFilter: (req, file, cb) => {
    // Here we can basically define the image type (Exclusively for the ai model)
    const allowedMimes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only images are allowed.`));
    }
  }
});

export default upload;