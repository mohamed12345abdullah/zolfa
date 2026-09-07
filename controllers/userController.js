const User = require("../models/user");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const auth = require("../middlewares/jwt");
const Guest = require("../models/guest");
const  sendEmail  = require("../utils/sendEmail");



const viewUser = asyncHandler(async (req, res) => {
    const {ip,page}= req.body;

    const guest = await Guest.findOne({ip})
    if (!guest) {
        const newGuest = await Guest.create({ip,views:[{page,count:1}]})
        return res.status(200).json({
            success: true,
            message: 'تم إضافة المستخدم بنجاح'
        });
    }
    
    const view = guest.views.find((view) => view.page === page);
    if (view) {
        view.count++;
    } else {
        guest.views.push({ page, count: 1 });
    }
    await guest.save();
    res.status(200).json({
        success: true,
        message: 'تم تحديث بيانات المستخدم بنجاح'
    });
});


const getViews = asyncHandler(async (req, res) => {
    // get the sum of views for all pages
    const allViews = await Guest.aggregate([
        {
            $unwind: "$views"
        },
        {
            $group: {
                _id: "$views.page",
                count: { $sum: "$views.count" }
            }
        }
    ]);
    const views = allViews.map((view) => ({
        page: view._id,
        count: view.count
    }));
    console.log(views); 
   
    const gests = await Guest.find({});
    console.log(gests.length);


    res.status(200).json({
        success: true,
        views,
        noOfGuests:gests.length,
        guests:gests
    });
});


const showAllUsers = asyncHandler(async (req, res) => {
    const { status, page } = req.params;
    const limit=2;
    let users;
    let numOfUsers = 0;
    if(status=='all'){
        users = await User.find({},{'password':0,'authToken':0}).populate('profileRef')
        .limit(limit)
        .skip((page-1)*limit)
        numOfUsers = await User.countDocuments({});
    }else{
        users = await User.find({status},{'password':0,'authToken':0}).populate('profileRef')
        .limit(limit)
        .skip((page-1)*limit)
        numOfUsers = await User.countDocuments({status});
    }
    // .populate('profi')
    res.status(200).json({
        success: true,
        users,
        numberOfUsers: numOfUsers
    });
});

// const uploadFileToGoogleDrive = asyncHandler(async (req, res) => {
//     const { file } = req;
//     const {fileId,fileUrl}=req;
//     const {name}=req.body;
//     if (!file) {
//         return res.status(400).json({
//             success: false,
//             message: 'No file uploaded'
//         });
//     }
//     res.status(200).json({
//         success: true,
//         fileUrl,
//         fileId,
//         name
//     });
// });



const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;


    await User.findByIdAndDelete(id);
    res.status(200).json({
        success: true,
        message: 'user deleted successfully'
    });
})

const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).populate('profileRef');
    res.status(200).json({
        success: true,
        user
    });
})

const updatePaid = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { paid } = req.body;
    const user = await User.findByIdAndUpdate(id, {paid});
    res.status(200).json({
        success: true,
        user
    });
})

const updateStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(id, {status});
    res.status(200).json({
        success: true,
        user
    });
})


module.exports = {
    viewUser,
    getViews,
    showAllUsers,
    // uploadFileToGoogleDrive
    deleteUser,
    getUserById,
    updatePaid,
    updateStatus
}
