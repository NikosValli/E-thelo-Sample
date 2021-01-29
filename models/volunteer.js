const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const volunteerSchema=new Schema({
    
    volunteer:{
        type:Schema.Types.ObjectId,
        ref:'User'
    }
});

module.exports=mongoose.model("Volunteer",volunteerSchema);