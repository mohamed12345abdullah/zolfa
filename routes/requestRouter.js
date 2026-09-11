
const express = require('express');
const router = express.Router();

const { upload } = require('../utils/fileUpload');
const uploadFileToGoogleDrive = require('../utils/googleDrive');

const controller = require('../controllers/requestController');
const {auth} = require('../middlewares/jwt');
const checkRole = require('../middlewares/checkRole');


router.use(auth);

router.post('/send', controller.sendRequest);

// router.get('/sent', controller.getSentRequests);
// router.get('/received', controller.getReceivedRequests);
router.patch('/updateStatus', controller.updateStatus);
router.get('/', controller.getRequestsOfUser);
router.get('/:status/:page',checkRole('admin','manager'), controller.getRequestsByStatus);



// documets for apis : 
// send request api : /api/requests/send
    // body : { to: userId }
// update status request api : /api/requests/updateStatus
    // body : { requestId: requestId, status: status }
// get sent requests api : /api/requests/sent
// get received requests api : /api/requests/received
// accept request api : /api/requests/accept/:id
// reject request api : /api/requests/reject/:id


const uploadFile = upload(['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']);
// router.post('/upload', uploadFile.single('file'), uploadFileToGoogleDrive,controller.uploadFileToGoogleDrive);
 
module.exports = router;
