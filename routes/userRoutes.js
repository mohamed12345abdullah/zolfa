
const express = require('express');
const router = express.Router();

const { upload } = require('../utils/fileUpload');
const uploadFileToGoogleDrive = require('../utils/googleDrive');

const controller = require('../controllers/userController');
router.post('/view', controller.viewUser);
router.get('/views', controller.getViews);
router.get('/:status/:page', controller.showAllUsers);
router.delete('/:id', controller.deleteUser);
router.get('/:id', controller.getUserById);
router.put('/:id/paid', controller.updatePaid);
router.put('/:id/status', controller.updateStatus);


// documets for apis : 
// paid update api : /api/users/:id/paid
// status update api : /api/users/:id/status
// get user by id api : /api/users/:id


const uploadFile = upload(['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']);
// router.post('/upload', uploadFile.single('file'), uploadFileToGoogleDrive,controller.uploadFileToGoogleDrive);
 
module.exports = router;
