
const Male = require('../models/male');
const User = require('../models/user');
const asyncHandler = require('../utils/asyncHandler');

const addMaleForm = asyncHandler(async (req, res) => {

    const maleData = req.body;
    const user = await User.findById(req.user.id).populate('profileRef');
    if( user.profileRef ){
        return res.status(400).json({
            success: false,
            message: "Male form already exists"
        });
    }
    const male = await Male.create(maleData);
    user.profileRef = male._id;
    user.profileModel = "Male";

    

    await user.save();

    res.status(201).json({
        user,
        success: true,
        message: "Male form created successfully"
    });
});
 
const editMaleForm = asyncHandler(async (req, res) => {
    const maleData = req.body;
    const male = await Male.findByIdAndUpdate(req.params.id, maleData);
    res.status(200).json(male);
});

const deleteMaleForm = asyncHandler(async (req, res) => {
    const male = await Male.findByIdAndUpdate(req.params.id, { deleted: true });
    res.status(200).json(male);
});

const getMaleForm = asyncHandler(async (req, res) => {
    const male = await Male.findById(req.params.id, { deleted: false });
    res.status(200).json(male);
});
const getMaleForms = asyncHandler(async (req, res) => {
    // TODO: Add pagination and filtering
    // add pagination
    const males = await Male.find();
    const users = await User.find().populate('profileRef');
    res.status(200).json({ males, success: true, message: "Male forms fetched successfully" });
});


module.exports = {
    addMaleForm,
    editMaleForm,
    deleteMaleForm,
    getMaleForm,
    getMaleForms
};