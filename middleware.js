const { actionSchema,reviewSchema } = require("./schemas");
const ExpressError=require('./utils/ExpressError');
const Action=require('./models/action');
const Review = require('./models/review');
const Volunteer = require('./models/volunteer');


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateAction=(req,res,next) =>
{
 
    const { error } = actionSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400);
    }
    else{
        next();
    }

    
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const action = await Action.findById(id);
    if (!action.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/actions/${id}`);
    }
    next();
}


module.exports.isReviewAuthor = async (req, res, next) => {
    const { id,reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/actions/${id}`);
    }
    next();
}

module.exports.hasAlreadyJoined=async (req,res,next) =>{
    const {id,volunteerId} = req.params;
    const volunteer=await Volunteer.findById(volunteerId);
    const action = await Action.findById(id).populate('volunteers').populate({
        path:'volunteers',
        populate:{
            path:'volunteer'
        }
    }).populate('volunteer');
    let joined=false;

  for (let volunteer of action.volunteers) {
    if (req.user._id.equals(volunteer.volunteer._id)){
          joined=true;
  console.log(volunteer.volunteer._id,req.user._id);
      }
    }
   if (joined===true){
      req.flash('error', 'You have already joined..!');
     return res.redirect(`/actions/${id}`);
  }
  else{
       next();
    }
    
}

module.exports.validateReview=(req,res,next) =>
{
 
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400);
    }
    else{
        next();
    }

    
}