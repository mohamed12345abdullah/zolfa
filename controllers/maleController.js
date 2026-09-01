
const Male = require('../models/male');
const User = require('../models/user');
const asyncHandler = require('../utils/asyncHandler');

const addMaleForm = asyncHandler(async (req, res) => {

    const maleData = req.body;
    const male = await Male.create(maleData);
    res.status(201).json(male);
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