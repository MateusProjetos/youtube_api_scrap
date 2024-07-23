// routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController')();

router.post('/videos', videoController.scrapeVideos);

module.exports = router;
