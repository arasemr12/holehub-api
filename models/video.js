const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
    id:{
        type: String,
        required:true,
        unique:true
    },
    author:{
        type: mongoose.Types.ObjectId,
        ref:"user"
    },
    thumbnail:{
        type:String
    },
    views:[{
        type: mongoose.Types.ObjectId,
        ref:"user"
    }]
},{versionKey:false,timestamps:true});

const videoModel = mongoose.model('video',videoSchema);

module.exports = videoModel;
