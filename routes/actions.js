const express=require('express');
const router=express.Router();
const catchAsync=require('../utils/catchAsync');
const {actionSchema,reviewSchema}=require('../schemas.js');
const Action=require('../models/action');
const actions=require('../controllers/actions');
const {isLoggedIn,validateAction,isAuthor}=require('../middleware');
const multer=require('multer');
const {storage}=require('../cloudinary');
const upload=multer({storage});
const { array } = require('joi');
router.route('/')
.get(catchAsync(actions.index))
.post(isLoggedIn,upload.array('image'),validateAction,catchAsync(actions.createNewForm));


router.get("/new",isLoggedIn,actions.renderNewForm);


router.route('/:id')
.get(catchAsync(actions.showAction))
.put(isLoggedIn,isAuthor,upload.array('image'),validateAction,catchAsync(actions.updateAction))
.delete(isLoggedIn,isAuthor,catchAsync(actions.deleteAction));


router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(actions.getActionForm));




module.exports=router;