const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Upload dizinlerini oluştur
const uploadDirs = ['uploads', 'uploads/products', 'uploads/banners', 'uploads/categories', 'uploads/pages'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Multer storage ayarları
const storage = multer.memoryStorage();

// Dosya filtresi
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Sadece JPEG, PNG, WebP ve GIF formatları desteklenir'), false);
  }
};

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  }
});

// Resim işleme ve kaydetme
const processImage = async (file, folder, options = {}) => {
  const {
    width = 800,
    height = 800,
    quality = 80,
    fit = 'inside',
    format = 'webp'
  } = options;

  const filename = `${uuidv4()}.${format}`;
  const filepath = path.join(process.cwd(), 'uploads', folder, filename);

  let sharpInstance = sharp(file.buffer);

  // Resize
  if (width || height) {
    sharpInstance = sharpInstance.resize(width, height, {
      fit,
      withoutEnlargement: true
    });
  }

  // Format ve kalite
  if (format === 'webp') {
    sharpInstance = sharpInstance.webp({ quality });
  } else if (format === 'jpeg' || format === 'jpg') {
    sharpInstance = sharpInstance.jpeg({ quality });
  } else if (format === 'png') {
    sharpInstance = sharpInstance.png({ quality });
  }

  await sharpInstance.toFile(filepath);

  return `/uploads/${folder}/${filename}`;
};

// Thumbnail oluşturma
const createThumbnail = async (file, folder) => {
  return processImage(file, folder, {
    width: 300,
    height: 300,
    quality: 70,
    fit: 'cover'
  });
};

// Çoklu resim işleme
const processMultipleImages = async (files, folder, options = {}) => {
  const results = [];
  
  for (const file of files) {
    const url = await processImage(file, folder, options);
    results.push(url);
  }
  
  return results;
};

// Resim silme
const deleteImage = (imagePath) => {
  if (!imagePath) return;
  
  const fullPath = path.join(process.cwd(), imagePath);
  
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

// Çoklu resim silme
const deleteMultipleImages = (imagePaths) => {
  if (!Array.isArray(imagePaths)) return;
  
  imagePaths.forEach(imagePath => deleteImage(imagePath));
};

// Upload middleware'leri
const uploadSingle = (fieldName) => upload.single(fieldName);
const uploadMultiple = (fieldName, maxCount = 10) => upload.array(fieldName, maxCount);
const uploadFields = (fields) => upload.fields(fields);

// Resim işleme middleware
const processImageMiddleware = (folder, options = {}) => {
  return async (req, res, next) => {
    try {
      if (req.file) {
        req.processedImage = await processImage(req.file, folder, options);
      }
      
      if (req.files) {
        if (Array.isArray(req.files)) {
          req.processedImages = await processMultipleImages(req.files, folder, options);
        } else {
          req.processedImages = {};
          for (const fieldName in req.files) {
            req.processedImages[fieldName] = await processMultipleImages(
              req.files[fieldName],
              folder,
              options
            );
          }
        }
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  processImage,
  createThumbnail,
  processMultipleImages,
  deleteImage,
  deleteMultipleImages,
  processImageMiddleware
};
