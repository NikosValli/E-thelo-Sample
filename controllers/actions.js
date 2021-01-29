const Action=require('../models/action');
const mbxGeocoding=require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken=process.env.MAPBOX_TOKEN;
const geocoder=mbxGeocoding({accessToken:mapBoxToken});
const {cloudinary}=require('../cloudinary');


module.exports.index=async (req,res) =>{
    const actions=await Action.find({});
    res.render('actions/index',{actions});

}

module.exports.renderNewForm=(req,res)=>{
    
    res.render('actions/new');
    }

module.exports.createNewForm=async (req,res,next)=>{
    //if(!req.body.action) throw new ExpressError('Invalid Action Data',400);
  const geoData=await geocoder.forwardGeocode({
       query:req.body.action.place,
       limit:1
   }).send()
  const action=new Action(req.body.action);
  action.geometry=geoData.body.features[0].geometry;
  action.images=req.files.map(f => ({url: f.path,filename:f.filename}));
  if (action.images.length===0){
      console.log("trueee");
    action.images=({url:"https://res.cloudinary.com/ddokcbnoj/image/upload/v1611503999/Ethelo/dosomethinggreat_x75zvw.jpg",filename:"Ethelo/nl1fhscjmwoykrpzjxum"});
  } 
  action.author=req.user._id;
  await action.save();
  console.log(action);
  req.flash('success','Successfully made a new Action!');
  res.redirect(`/actions/${action._id}`);
    
}

module.exports.showAction=async(req,res)=>{
    const action=await Action.findById(req.params.id).populate('reviews').populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author').populate('volunteers').populate({
        path:'volunteers',
        populate:{
            path:'volunteer'
        }
    }).populate('volunteer');
    if(!action){
        req.flash('error',"We cannot find this action!");
        return res.redirect('/actions');
    }
res.render('actions/show',{action});

}
module.exports.getActionForm=async(req,res)=>{
    const {id}=req.params;
    const action=await Action.findById(id);
    if(!action){
        req.flash('error',"We cannot find this action!");
        return res.redirect('/actions');
    }
    res.render('actions/edit',{action});

}

module.exports.updateAction= async (req, res) => {
    const { id } = req.params;
    const action = await Action.findByIdAndUpdate(id, { ...req.body.action });
    const imgs=req.files.map(f => ({url: f.path,filename:f.filename}));
    action.images.push(...imgs); 
    await action.save();
    if (req.body.deleteImages){
        for (let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);

        }
       await action.updateOne({$pull: {images:{filename:{ $in:req.body.deleteImages}}}});
       console.log(action);
    }
    req.flash('success', 'Successfully updated Action!');
    res.redirect(`/actions/${action._id}`)
}

module.exports.deleteAction=async (req,res) =>{
    const {id}=req.params;
    await Action.findByIdAndDelete(id);
    req.flash('success',"You successfully Deleted an Action!");

    res.redirect('/actions');
}