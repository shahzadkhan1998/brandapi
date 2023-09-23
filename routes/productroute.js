const express = require('express');
const router = express.Router();
const paracticeController = require('../controller/productcontroller.js');

// add lgo and description for paractice
router.post('/add',paracticeController.createProduct );
router.get('/get',paracticeController.getProduct);
module.exports = router;
