const express = require('express');
const router = express.Router();
const brandLogoController = require('../controller/brandcontroller.js');
// POST /logos
router.post('/', brandLogoController.createLogo);

// GET /logos
router.get('/', brandLogoController.getAllLogos);

// GET /logos/:level
router.get('/:level', brandLogoController.getLogosByLevel);

module.exports = router;