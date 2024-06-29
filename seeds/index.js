const cities=require('./cities');
const India=require('./India');
const mongoose=require('mongoose');
const Campground=require('../models/campground');
const {places,descriptors}=require('./seedHelpers');
const axios=require('axios');
const DotEnv=require('dotenv');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error"));
db.once("open",()=>{
    console.log("Database connected");
});

DotEnv.config({
    path:".env"
 });

 
const sample=array => array[Math.floor(Math.random()*array.length)];

const getRandomImage= async () => {
    try{
        const config={ headers: {Authorization: `Client-ID ${process.env.ACCESS_KEY}`} };
        const ImgData = await axios.get('https://api.unsplash.com/photos/random',config);
        return {img: `${ImgData.data.urls.raw}`,description: `${ImgData.data.alt_description}`}
                
    }
    catch(e){
        console.log(e);
    }
}

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i=0;i<20;i++){
        const random1000=Math.floor(Math.random()*1000);
        const randomNum=Math.floor(Math.random()*India.length)
        const price=Math.floor(Math.random()*20)+10;
        const Link=await getRandomImage();
       const camp= new Campground({
              author: '6677c2684d5f3f5da00c4a2b',
              location:`${India[randomNum].City},${India[randomNum].State}`,
              title: `${sample(descriptors)} ${sample(places)}`,
              images:[{
                url: 'https://res.cloudinary.com/dnjsh2l2m/image/upload/v1719397177/YelpCamp/cjbwnhcjn5lbxthhq2sx.jpg',
                filename: 'YelpCamp/cjbwnhcjn5lbxthhq2sx'    
              }],
              description:`${Link.description}`,
              price,
              geometry:{
                type: 'Point',
                coordinates: [ India[randomNum].Longitude,India[randomNum].Latitude ]
              }
                
              
        })
        await camp.save();
    }
}

seedDB().then(()=>{
   db.close();
});

