const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

// CSV filter
const csvFilter = (req, file, cb) => {
    if (file.mimetype.includes('csv') || file.mimetype.includes('excel') || file.originalname.endsWith('.csv') || file.mimetype === 'application/vnd.ms-excel') {
        cb(null, true);
    } else {
        cb(new Error('Please upload only csv file. Received ' + file.mimetype), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: csvFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB limit
});

module.exports = upload;
