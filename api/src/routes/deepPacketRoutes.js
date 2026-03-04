const express = require('express');
const router = express.Router();
const deepPacketController = require('../controllers/deepPacketController');

router.get('/recent', deepPacketController.getRecentPackets);
router.get('/protocol/:protocol', deepPacketController.getProtocolPackets);

module.exports = router;
