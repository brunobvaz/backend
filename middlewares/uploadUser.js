const multer = require('multer');
const path   = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/var/www/menument/uploads'),
  filename:    (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_')),
});

module.exports = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
}).single('photo');
