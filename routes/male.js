

const express = require('express');
const router = express.Router();
const maleController = require('../controllers/maleController');

router.post('/addMaleForm', maleController.addMaleForm);
router.get('/getMaleForms', maleController.getMaleForms);

module.exports = router;