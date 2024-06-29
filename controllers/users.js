const User=require('../models/user');

module.exports.renderRegister=(req,res)=>{
    res.render('users/register');
}

module.exports.register=async (req,res,next)=>{
    try{
        const {email,username,password}=req.body;
        const newUser=await User({email,username});
        const registeredUser=await User.register(newUser,password);
        req.login(registeredUser,(err) =>{
            if(err){
                return next(err);
            }
            else{
                req.flash('success','Welcome to Yelp Camp!');
                res.redirect('/campgrounds');
            }
        })
       
    }
    catch(e){
        req.flash('error',e.message);
        res.redirect('/register');
    }
  
}

module.exports.renderLogin=(req,res)=>{
    res.render('users/login');
  }

module.exports.login=async (req,res)=>{
    req.flash('success','Welcome Back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);

}

module.exports.logout=(req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}