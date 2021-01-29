if(process.env.NODE_ENV!=="production"){
    require('dotenv').config();
}


const {isLoggedIn,hasAlreadyJoined}=require('./middleware');
const express=require('express');
const mongoose=require('mongoose');
const ejsMate=require('ejs-mate');
const session=require("express-session");
const Joi=require('joi');
const {actionSchema,reviewSchema}=require('./schemas.js');
const catchAsync=require('./utils/catchAsync');
const flash=require('connect-flash');
const ExpressError=require('./utils/ExpressError');
const moment = require('moment');
const path=require('path');
const app=express();
const methodOverride=require('method-override');
const Action=require('./models/action');
const Review=require('./models/review');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user');
const Volunteer=require('./models/volunteer');
var cors = require('cors');
var maki = require('@mapbox/maki');




const userRoutes=require('./routes/users');
const actionRoutes=require('./routes/actions');
const reviewRoutes=require('./routes/reviews');
const volunteer = require('./models/volunteer.js');
const MongoDBstore=require("connect-mongo")(session);

const dbUrl=process.env.DB_URL || 'mongodb://localhost:27017/ethelo';
//mongodb://localhost:27017/ethelo
mongoose.connect(dbUrl,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify:false
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("database connected..");
});

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));
//app.use('/public', express.static('public'));
app.use(cors());


const secret=process.env.SECRET || 'thisshouldbeabettersecret!';
const store=new MongoDBstore({
    url:'mongodb://localhost:27017/ethelo',
    secret,
    touchAfter:24*60*60
});

store.on("error",function (e){
    console.log("Session store error",e)
});

const sessionConfig={
    store,
    name:'config',
    secret,
    resave:false,
    saveUninitialized:true,

    cookie:{
        httpOnly:true,
        //secure:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }

}

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next)=>{
    console.log(req.query);
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})


app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));


app.use('/',userRoutes);
app.use('/actions',actionRoutes);
app.use('/actions/:id/reviews',reviewRoutes);

app.get('/',(req,res) =>{
    res.render('home');

})

app.post('/actions/:id/attend',isLoggedIn,hasAlreadyJoined,async(req, res) => {
    const action=await Action.findById(req.params.id);
    const vol=new volunteer(req.body.vol);
    vol.volunteer=req.user._id;
    action.volunteers.push(vol);
    await vol.save();
    await action.save();
    req.flash('success',"You Joined in this action!!");
    res.redirect(`/actions/${action._id}`);

  })


app.all('*',(req,res,next)=>{
    next(new ExpressError('Page not Found',404));
})
app.use((err,req,res,next)=>{
    const {statusCode=500}=err;
    if(!err.message) err.message='Oh no,Something Went Wrong!'
    res.status(statusCode).render('error',{err});
})

const port=process.env.PORT || 3000;
app.listen(port,()=> {
    console.log(`Serving on port ${port}`);
})