

const express = require('express');
const router = express.Router();
const femaleController = require('../controllers/femaleController');
const {auth} = require('../middlewares/jwt');

router.post('/', auth, femaleController.addFemaleForm);
router.get('/', femaleController.getFemaleForms);
router.get('/:id', femaleController.getFemaleForm);
router.put('/:id', femaleController.editFemaleForm);
router.delete('/:id', femaleController.deleteFemaleForm);

module.exports = router;