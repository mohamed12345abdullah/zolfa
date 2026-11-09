
const express = require('express');
const router = express.Router();

const { upload } = require('../utils/fileUpload');
const uploadFileToGoogleDrive = require('../utils/googleDrive');

const controller = require('../controllers/statController');
const {auth} = require('../middlewares/jwt');
const checkRole = require('../middlewares/checkRole');


// router.use(auth);

router.get('/',controller.getStatistics);

// documets for apis : 
// paid update api : /api/users/:id/paid
// status update api : /api/users/:id/status
// get user by id api : /api/users/:id
// assign admin api : /api/users/assign-admin 
// get approved users api : /api/users/approved


// const uploadFile = upload(['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']);
// router.post('/upload', uploadFile.single('file'), uploadFileToGoogleDrive,controller.uploadFileToGoogleDrive);
 
module.exports = router;
