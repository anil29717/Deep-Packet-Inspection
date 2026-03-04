const express = require('express');
const router = express.Router();
const flowController = require('../controllers/flowController');

router.get('/latest', flowController.getLatestFlows);
router.get('/search', flowController.searchFlows);

module.exports = router;
