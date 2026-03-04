const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

router.get('/top-apps', statsController.getTopApps);
router.get('/top-talkers', statsController.getTopTalkers);

module.exports = router;
