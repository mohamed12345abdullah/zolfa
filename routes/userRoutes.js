
const express = require('express');
const router = express.Router();

const { upload } = require('../utils/fileUpload');
const uploadFileToGoogleDrive = require('../utils/googleDrive');

const controller = require('../controllers/userController');
const {auth} = require('../middlewares/jwt');
const checkRole = require('../middlewares/checkRole');


router.use(auth);
router.post('/view', controller.viewUser);
router.get('/views', controller.getViews);
router.get('/approved/:page', controller.getApprovedUsers);
router.get('/:status/:page', controller.showAllUsers);
router.delete('/:id', controller.deleteUser);
router.get('/:id', controller.getUserById);
router.put('/:id/paid',checkRole('manager','admin'), controller.updatePaid);
router.put('/:id/status',checkRole('manager','admin'), controller.updateStatus);
router.post('/assign-admin',checkRole('manager'), controller.assignAdmin);



// documets for apis : 
// paid update api : /api/users/:id/paid
// status update api : /api/users/:id/status
// get user by id api : /api/users/:id
// assign admin api : /api/users/assign-admin 
// get approved users api : /api/users/approved


const uploadFile = upload(['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']);
// router.post('/upload', uploadFile.single('file'), uploadFileToGoogleDrive,controller.uploadFileToGoogleDrive);
 
module.exports = router;
