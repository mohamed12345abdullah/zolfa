const User = require("../models/user");
const Male = require("../models/male");
const Female = require("../models/female");
const Request = require("../models/request");
const Guest = require("../models/guest");


const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const auth = require("../middlewares/jwt");
const  sendEmail  = require("../utils/sendEmail");

const getStatistics=asyncHandler(async(req,res)=>{

const stats = await User.aggregate([
  {
    $facet: {
      totalUsers: [
        { $match: { role: 'user' } },
        { $count: 'count' }
      ],

      pendingUsers: [
        { $match: { role: 'user', status: 'pending' } },
        { $count: 'count' }
      ],

      approvedUsers: [
        { $match: { role: 'user', status: 'approved' } },
        { $count: 'count' }
      ],

      rejectedUsers: [
        { $match: { role: 'user', status: 'rejected' } },
        { $count: 'count' }
      ],

      admins: [
        { $match: { role: 'admin' } },
        { $count: 'count' }
      ],

      males: [
        { $match: { profileModel: 'Male' } },
        { $count: 'count' }
      ],

      females: [
        { $match: { profileModel: 'Female' } },
        { $count: 'count' }
      ]
    }
  }
]);

const requests = await Request.countDocuments();
const admins=await User.find({role:'admin'},{name:1,phone:1,email:1});
const result = {
  numberOfUsers: stats[0].totalUsers[0]?.count || 0,
  pendingUsers: stats[0].pendingUsers[0]?.count || 0,
  approvedUsers: stats[0].approvedUsers[0]?.count || 0,
  rejectedUsers: stats[0].rejectedUsers[0]?.count || 0,
  numberOfAdmins: stats[0].admins[0]?.count || 0,
  Males: stats[0].males[0]?.count || 0,
  Females: stats[0].females[0]?.count || 0,
  requests,
  admins
};
console.log(result);

    res.status(200).json({
        success: true,
        data:result
    }); 
    
})




module.exports={
  getStatistics
}