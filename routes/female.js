

const express = require('express');
const router = express.Router();
const femaleController = require('../controllers/femaleController');

router.post('/', femaleController.addFemaleForm);
router.get('/', femaleController.getFemaleForms);
router.get('/:id', femaleController.getFemaleForm);
router.put('/:id', femaleController.editFemaleForm);
router.delete('/:id', femaleController.deleteFemaleForm);

module.exports = router;