const DotEnv=require('dotenv');
DotEnv.config({
    path:".env"
 });
const { cloudinary } = require('../cloudinary');
const Campground = require('../models/campground');
const maptilerClient = require("@maptiler/client");


maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index=async (req,res)=>{
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}

module.exports.renderNewForm = async (req,res)=>{

    res.render('campgrounds/new');
}

module.exports.createCampground=async (req,res,next) => {
    
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
   
    const newCampground= new Campground(req.body.campground);
    newCampground.geometry=geoData.features[0].geometry;
    newCampground.images=req.files.map(f=>({url:f.path,filename:f.filename}))
    newCampground.author=req.user._id;
     await newCampground.save();
     console.log(newCampground);
     req.flash('success','Successfully made a new campground');
     res.redirect(`/campgrounds/${newCampground._id}`);
    
}

module.exports.showCampground=async (req,res)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');
    if(!campground){
        req.flash('error','Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{campground});
}

module.exports.renderEditForm=async (req,res)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id);
    if(!campground){
        req.flash('error','Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{campground});
}

module.exports.updateCampground=async (req,res)=>{
    const {id}=req.params;
    const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground},{new:true});
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    campground.geometry = geoData.features[0].geometry;
    const imgs=req.files.map(f=>({url:f.path,filename:f.filename}));
    campground.images.push(...imgs);
    await campground.save();
    
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
           await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages}}}})
    }

    req.flash('success','Successfully updated campground!');
    res.redirect(`/campgrounds/${id}`);
}

module.exports.deleteCampground=async (req,res)=>{
    const {id}=req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully deleted campground');
    res.redirect('/campgrounds');
}