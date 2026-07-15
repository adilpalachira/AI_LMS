const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directory exists
const uploadDir = path.join(__dirname, '../uploads/profile');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File Filter (Images Only)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, JPG, PNG, WEBP) are allowed.'));
  }
};

// Multer Upload Instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

/**
 * Upload Middleware Wrapper to handle potential multer errors
 * and ease transition to cloud providers (e.g., Cloudinary)
 */
const uploadProfileImage = (req, res, next) => {
  const uploadSingle = upload.single('profileImage');

  uploadSingle(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    // For future Cloudinary integration, the middleware will upload to Cloudinary 
    // and assign the Cloudinary secure URL directly to req.file.path.
    // The controller remains unchanged, fetching the path from req.file.path.
    if (req.file) {
      // Normalize path to store relative file paths with forward slashes in DB
      const relativePath = `uploads/profile/${req.file.filename}`;
      req.file.path = relativePath;
    }
    
    next();
  });
};

module.exports = {
  uploadProfileImage
};
