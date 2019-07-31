// file upload middleware with multer

const multer = require('multer');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

// configure disk storage for multer
const storage = multer.diskStorage({
  // cb is the callback with error = null and the storage path (that is relative to the server.js file)
  destination: (req, file, cb) => {
    // check & validate file type
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid MIME type');
    // if isValid != null or undefined
    if (isValid) {
      error = null;
    }
    cb(error, "images");
  },
  filename: (req, file, cb) => {
    // split by spaces then rejoin with -
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype]; // to pick the right extension from the map object
    cb(null, name + '-' + Date.now() + '.' + ext); // to create the file name in the callback result
  }
});

// use the regular syntax to call this as a middleware
module.exports = multer({storage: storage}).single('image');
