const mongoose=require('mongoose');
const Review = require('./review');
const Schema=mongoose.Schema;


function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

const ImageSchema=new Schema({

        url:String,
        filename:String
    
})

ImageSchema.virtual('thumbnail').get(function(){
   return this.url.replace('/upload','/upload/h_250,w_400,q_100');
})

ImageSchema.virtual('thumbnailforshow').get(function(){
    return this.url.replace('/upload','/upload');
 })

 ImageSchema.virtual('thumbnailforallactions').get(function(){
    return this.url.replace('/upload','/upload/h_250,w_400,q_100');
 })

const opts={toJSON:{virtuals:true} };

const ActionSchema=new Schema({
    title:String,
    place:String,
    images:[ImageSchema],
    description:String,
    date:Date,
    geometry: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews: [
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ],
    volunteers: [
        {
            type:Schema.Types.ObjectId,
            ref:'Volunteer'
        }
    ]
    
    
},opts);

ActionSchema.virtual('properties.popUpMarkUp').get(function(){
    return `
    <p>Action:<a href="/actions/${this._id}">${this.title}</a><p>
    <p>Date:${this.date.toDateString()}</p>
    <p>Volunteers until now:${this.volunteers.length}</p>
    `
 })

ActionSchema.post('findOneAndDelete',async function(doc){
    if(doc){
        await Review.deleteMany({
            _id:{
                $in:doc.reviews
            }
        })
    }
})


module.exports=mongoose.model('Action',ActionSchema);