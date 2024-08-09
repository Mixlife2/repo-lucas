import multer from 'multer';
import __dirname from '../../utils.js';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let path = __dirname + '/src/public/documents';
    if (file.fieldname === 'profile') path = __dirname + '/src/public/profiles';
    if (file.fieldname === 'product') path = __dirname + '/src/public/products';
    cb(null, path);
  },
  filename: function (req, file, cb) {
    console.log(file)
    cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '')}`);
  }
});
const upload = multer({storage});
export default upload;