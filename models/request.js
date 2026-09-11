const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    from:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "From user is required"]
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "To user is required"]
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },


}
, { timestamps: true });



module.exports = mongoose.model('Request', requestSchema);