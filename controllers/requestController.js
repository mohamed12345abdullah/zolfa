const Request = require("../models/request");
const User = require("../models/user");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const sendEmail = require("../utils/sendEmail");


const sendRequest = asyncHandler(async (req, res) => {
    
    console.log(" send request ");
    const fromUser = req.user;
    if(!fromUser) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }
    if(fromUser.profileModal == "Female") {
        return res.status(403).json({
            success: false,
            message: "Your cant send request"
        });
    } 
    const {toUserId} = req.body;
    const existingRequest = await Request.findOne({
        $or: [
            { from: fromUser._id },
            { to: fromUser._id },
            { from: toUserId },
            { to: toUserId }
        ],
        status: { $ne: "rejected" }
    });
    if(existingRequest) {
        return res.status(400).json({
            success: false,
            message: "cant send request to this user"
        });
    }
    
    
    const request =await Request.create({
        from: fromUser._id,
        to: toUserId
    });

    // console.log("request", request);
    
    const fromUserUpdated = await User.findByIdAndUpdate(fromUser._id, {
        $push: { requestsSent: request._id }
    }, { new: true });
    // console.log("fromUserUpdated", fromUserUpdated);
    
    // check if the request is pushed to the from user
    if(!fromUserUpdated) {
        return res.status(500).json({
            success: false,
            message: "Failed to update from user"
        });
    }
    
    const toUserUpdated = await User.findByIdAndUpdate(toUserId, {
        $push: { requestsReceived: request._id }
    }, { new: true });
    // console.log("toUserUpdated",toUserUpdated);
    
    // check if the request is pushed to the to user
    if(!toUserUpdated) {
        return res.status(500).json({
            success: false,
            message: "Failed to update to user"
        });
    }
    
    res.status(201).json({
        success: true,
        message: "Request sent successfully",
        data: request
    });
    
});


const updateStatus = asyncHandler(async (req, res) => {
    const { requestId, status } = req.body;
    
    const request = await Request.findById(requestId);


    
    if(!request) {
        return res.status(404).json({
            success: false,
            message: "Request not found"
        });
    }

    const userData = req.user;
    if(! request.to.equals(userData._id)) {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to update this request"
        });
    }
    
    request.status = status;
    await request.save();
    
    res.status(200).json({
        success: true,
        message: "Request status updated successfully",
        data: request
    });
});


const getRequestsOfUser = asyncHandler(async (req, res) => {
    const userData = req.user._id;
    const requests = await Request.find({
        $or: [
            { from: userData },
            { to: userData }
        ]
    }).populate({
        path: 'from',
        select: {profileModel:1,profileRef:1},
        populate: {
            path: 'profileRef',
            select: {'basicInfo.name':0,'contactInfo.whatsapp':0,'contactInfo.telegram':0,'contactInfo.facebook':0}

        }
    }).populate({
        path: 'to',
        select: {profileModel:1,profileRef:1},
        populate: {
            path: 'profileRef',
            select: {'basicInfo.name':0,'contactInfo.whatsapp':0,'contactInfo.telegram':0,'contactInfo.facebook':0}

        }
    });

    const data = requests.map(request => {
    const requestObj = request.toObject();

    if (request.from._id.toString() === userData.toString()) {
        // المستخدم الحالي هو from
        requestObj.from = undefined;
    } else {
        // المستخدم الحالي هو to
        requestObj.to = undefined;
    }

    return requestObj;
});
    
    // let requests=await Request.find({});
    // console.log(requests);
    
    res.status(200).json({
        success: true,
        data: data
    });
});

const showAllUsers = asyncHandler(async (req, res) => {
    const { status, page } = req.params;
    const limit=10;
    let users;
    let numOfUsers = 0;
    if(status=='all'){
        users = await User.find({role:'user'},{'password':0,'authToken':0}).populate('profileRef')
        .limit(limit)
        .skip((page-1)*limit)
        numOfUsers = await User.countDocuments({role:'user'});
    }else{
        users = await User.find({status,role:'user'},{'password':0,'authToken':0}).populate('profileRef')
        .limit(limit)
        .skip((page-1)*limit)
        numOfUsers = await User.countDocuments({status,role:'user'});
    }
    // .populate('profi')
    res.status(200).json({
        success: true,
        users,
        numberOfUsers: numOfUsers
    });
});


const getRequestsByStatus = asyncHandler(async (req, res) => {
    const {status,page} = req.params;
    const limit=10;
    const requests = await Request.find({ status })
    .populate({
        path: 'from',
        select: {_id:1,name:1,email:1,phone:1,profileModel:1,profileRef:1},
        populate: {
            path: 'profileRef',
            select: {'contactInfo':1,'basicInfo':1},
        }
    }).populate({
        path: 'to',
        select: {_id:1,name:1,email:1,phone:1,profileModel:1,profileRef:1},
        populate: {
            path: 'profileRef',
            select: {'contactInfo':1,'basicInfo':1},
        }
    })
    .limit(limit)
    .skip((page-1)*limit);
    

    res.status(200).json({
        success: true,
        data: requests,
        message: 'Requests retrieved successfully'
    });
  
});
    



module.exports = {
    sendRequest,
    updateStatus,
    getRequestsOfUser,
    getRequestsByStatus,
};
