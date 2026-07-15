const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Target directory paths
const baseUploadDir = path.join(__dirname, '../uploads');
const dirs = {
  pdf: path.join(baseUploadDir, 'pdfs'),
  video: path.join(baseUploadDir, 'videos'),
  image: path.join(baseUploadDir, 'images'),
  document: path.join(baseUploadDir, 'documents'),
  thumbnail: path.join(baseUploadDir, 'thumbnails')
};

// Ensure directories exist
Object.values(dirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Determine subfolder based on file extension / mime type
 */
const getFileCategory = (file) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (ext === '.pdf' || mime === 'application/pdf') {
    return 'pdf';
  }
  if (['.mp4', '.webm', '.mkv', '.avi', '.mov'].includes(ext) || mime.startsWith('video/')) {
    return 'video';
  }
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) || mime.startsWith('image/')) {
    return 'image';
  }
  if (['.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.zip', '.rar'].includes(ext) || 
      mime.includes('word') || mime.includes('presentation') || mime.includes('excel') || mime.includes('zip')) {
    return 'document';
  }
  return 'document';
};

// Storage engine configuration with dynamic destination folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = getFileCategory(file);
    cb(null, dirs[category] || dirs.document);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const sanitizedBase = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase();
    cb(null, `${sanitizedBase}-${uniqueSuffix}${ext}`);
  }
});

// File filter validation
const fileFilter = (req, file, cb) => {
  const allowedExts = /jpeg|jpg|png|webp|gif|pdf|ppt|pptx|doc|docx|mp4|webm|mkv|avi|mov|zip|rar/;
  const extname = allowedExts.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Supported types: PDF, PPT, DOCX, Images, Videos, ZIP.'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max limit to support video uploads
  fileFilter: fileFilter
});

/**
 * Middleware wrapper for handling material file uploads
 */
const uploadMaterialFile = (req, res, next) => {
  const uploadSingle = upload.single('file');

  uploadSingle(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (req.file) {
      const category = getFileCategory(req.file);
      // Format relative path with forward slashes for storage in DB
      const relativePath = `uploads/${category}s/${req.file.filename}`;
      req.file.relativePath = relativePath;
      req.file.category = category;
    }

    next();
  });
};

module.exports = {
  uploadMaterialFile,
  getFileCategory
};
