

const express = require('express');
const router = express.Router();
const maleController = require('../controllers/maleController');
const {auth} = require('../middlewares/jwt');

router.post('/addMaleForm', auth, maleController.addMaleForm);
router.get('/getMaleForms', auth, maleController.getMaleForms);

module.exports = router;