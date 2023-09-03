const express = require('express');
//const userModel = require('../models/user');
const jwt = require('jsonwebtoken');
const { default: axios } = require('axios');
const { rateLimit } = require('express-rate-limit')

const registerLimiter = rateLimit({
    max:2,
    windowMs: 24*60*60*1000,
    message:{success:false,message:"You can create up to 2 accounts per day."},
    requestWasSuccessful: (req, res) => res.statusCode < 400,
    skipFailedRequests:true
});

const router = express.Router();

router.post('/register',registerLimiter,async(req,res) => {
    try {
        const {email,username,password,token} = req.body;
        if(!email || !username || !password || !token) return res.status(400).json({success:false,message:"Body err!"});
        if(username.length < 4 || password.length < 4) return res.status(400).json({success:false,message:"Min. username/password length is 4!"});

        let captcha = await axios.post("https://www.google.com/recaptcha/api/siteverify",{
            secret:process.env.RECAPTCHA_KEY,
            response:token
        },{
            headers:{
                'Content-Type':'application/x-www-form-urlencoded'
            }
        });

        let data = captcha.data;

        if(!data.success) return res.status(400).json({success:false,message:"Invalid captcha!"});

        /*const user = await userModel.create({
            email,
            username,
            password
        });*/
        const user = await prisma.user.create({
            data:{
                email,
                username,
                password
            }
        })
    
        res.status(201).json({success:true,message:"Created!",user});
    } catch (error) {
        return res.status(500).json({success:false,message:error.message});
    }
});

router.post('/login',async(req,res) => {
    try {
        const {email,password} = req.body;
        if(!email || !password) return res.json({success:false,message:"Body err!"});
    
        /*const user = await userModel.findOne({
            email,
            password
        });*/
        const user = await prisma.user.findFirst({
            where:{
                email,
                password
            }
        });

        if(!user) return res.json({success:false,message:"Not found!"});

        let token = jwt.sign({
            expiresIn: Date.now()+(30*24*60*60*1000),
            user
        },process.env.SECRET);
    
        return res.json({success:true,message:"Logged!",user,token});
    } catch (error) {
        return res.json({success:false,message:error.message});
    }
});

router.get('/me',(req,res) => {
    let user = req.user;
    if(!user) return res.status(403).json({success:false,message:"Unauthorized!"});

    return res.json({success:true,message:"Find!",user});
});

module.exports = router;
