const express = require('express');
const router = express.Router();
const partidaRoutes = require('./partida');

router.use('/partida', partidaRoutes);

module.exports = router;