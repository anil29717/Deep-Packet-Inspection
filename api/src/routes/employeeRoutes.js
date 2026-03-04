const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const upload = require('../middleware/uploadMiddleware'); // Added this

router.get('/', employeeController.getAllEmployees);
router.get('/:id/ips', employeeController.getEmployeeIps);
router.post('/upload', upload.single('file'), employeeController.uploadCSV); // Added this

module.exports = router;
