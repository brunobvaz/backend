const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/var/www/menument/uploads');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB por ficheiro
  }
});

const recipeUpload = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'extraImages', maxCount: 5 }
]);

module.exports = { recipeUpload };
