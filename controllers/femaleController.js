
const Female = require('../models/female');
const User = require('../models/user');
const asyncHandler = require('../utils/asyncHandler');

const addFemaleForm = asyncHandler(async (req, res) => {

    const femaleData = req.body;

    const user = await User.findById(req.user._id).populate('profileRef');
    if( user.profileRef ){
        return res.status(400).json({
            success: false,
            message: "Female form already exists"
        });
    }
    const female = await Female.create(femaleData);

    user.profileRef = female._id;
    user.profileModel = "Female";
    await user.save();
    
    res.status(201).json({
        user,
        success: true,
        message: "Female form created successfully"
    });
});
 
const editFemaleForm = asyncHandler(async (req, res) => {
    const femaleData = req.body;
    const female = await Female.findByIdAndUpdate(req.params.id, femaleData);
    res.status(200).json({
        success: true,
        message: "Female form updated successfully",
        female
    });
});

const deleteFemaleForm = asyncHandler(async (req, res) => {
    const female = await Female.findByIdAndUpdate(req.params.id, { deleted: true });
    res.status(200).json({
        success: true,
        message: "Female form deleted successfully",
        female
    });
});

const getFemaleForm = asyncHandler(async (req, res) => {
    const female = await Female.findById(req.params.id, { deleted: false });
    res.status(200).json({
        success: true,
        message: "Female form fetched successfully",
        female
    });
});
const getFemaleForms = asyncHandler(async (req, res) => {
    // TODO: Add pagination and filtering
    // add pagination
    const females = await Female.find();
    const users = await User.find().populate('profileRef');
    res.status(200).json({ 
        success: true, 
        message: "Female forms fetched successfully",
        females 
    });
});


module.exports = {
    addFemaleForm,
    editFemaleForm,
    deleteFemaleForm,
    getFemaleForm,
    getFemaleForms
};