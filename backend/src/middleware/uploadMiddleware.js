const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists in project root
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Local disk storage for temporary upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/jfif',
    'image/heic',
    'image/heif'
  ];
  
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const allowedExts = ['jpeg', 'jpg', 'png', 'webp', 'avif', 'jfif', 'heic', 'heif'];

  if (allowedMimeTypes.includes(file.mimetype.toLowerCase()) || allowedExts.includes(ext) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Supported image formats: JPG, JPEG, PNG, WEBP, and AVIF (up to 10MB).'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

module.exports = upload;
