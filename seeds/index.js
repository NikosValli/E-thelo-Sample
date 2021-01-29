const mongoose=require('mongoose');
const cities=require('./cities');
const {places,descriptors}=require('./seedHelpers');
const Action=require('../models/action');

mongoose.connect('mongodb://localhost:27017/ethelo',{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("database connected..");
});

const sample= array => array[Math.floor(Math.random() *array.length)];

const seedDB=async () => {
  await Action.deleteMany({});
  for (let i=0; i<200;i++){
    const random1000=Math.floor(Math.random()*1000);
   
   const act=new Action({
     author:'5ffc787afb1fa900a75b8fe7',
      place:`${cities[random1000].city},${cities[random1000].state}`,
      title:`${sample(descriptors)} ${sample(places)}`,
      description:'It is going to be great !!!',
      date:Date.now(),
      geometry:{
        type:"Point",
        coordinates:[
        cities[random1000].longitude,
        cities[random1000].latitude,
      ]
      },
      images: [ {
        url:
         'https://res.cloudinary.com/ddokcbnoj/image/upload/v1610726015/Ethelo/qxxghdm8vtcwwkpadkmf.jpg',
        filename: 'Ethelo/qxxghdm8vtcwwkpadkmf' },
      {
        url:
         'https://res.cloudinary.com/ddokcbnoj/image/upload/v1610726026/Ethelo/nl1fhscjmwoykrpzjxum.jpg',
        filename: 'Ethelo/nl1fhscjmwoykrpzjxum' } ]
    })

    await act.save();
  }
}

seedDB().then(() =>{
  mongoose.connection.close();
});



