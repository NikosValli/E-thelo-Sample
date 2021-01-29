const Review=require('../models/review');
const Action=require('../models/action');


module.exports.postReview=async (req,res)=>{
    const action=await Action.findById(req.params.id);
    const review=new Review(req.body.review);
    review.author=req.user._id;
    action.reviews.push(review);
    await review.save();
    await action.save();
    req.flash('success',"You created a new Review!");
    res.redirect(`/actions/${action._id}`);
}

module.exports.deleteReview=async (req,res)=>{
    const {id,reviewId}=req.params;
    await Action.findByIdAndUpdate(id, {$pull: {reviews:reviewId}}); 
    await Review.findByIdAndDelete(reviewId);
    req.flash('success',"You successfully Deleted Review!");

    res.redirect(`/actions/${id}`);
}