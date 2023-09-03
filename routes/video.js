const express = require('express');
//const videoModel = require('../models/video');
const { checkVideo, getVideoThumbnail } = require('../youtube');
const { rateLimit } = require('express-rate-limit');

const router = express.Router();

const createLimiter = rateLimit({
    max:8,
    windowMs: 24*60*60*1000,
    message:{success:false,message:"You can create up to 8 videos per day."},
    requestWasSuccessful: (req, res) => res.statusCode < 400,
    skipFailedRequests:true
});

router.get('/',async(req,res) => {
    let {page} = req.query;
    if(!page) page = 0;

    page = Number(page);

    //let find = await videoModel.find().skip(20*page).limit(20).populate("author","-password -createdAt -updatedAt -email").sort("-createdAt");
    let find = await prisma.video.findMany({
        take:20,
        skip:20*page,
        include:{
            author:{
                select:{
                    username:true,
                    id:true
                }
            }
        }
    });

    find = find.sort((a,b) => b.views.length-a.views.length);

    return res.json({success:true,find});
});

router.get('/news',async(req,res) => {
    let {page} = req.query;
    if(!page) page = 0;

    page = Number(page);

    //let find = await videoModel.find().skip(20*page).limit(20).populate("author","-password -createdAt -updatedAt -email").sort("-createdAt");
    let find = await prisma.video.findMany({
        take:20,
        skip:20*page,
        include:{
            author:{
                select:{
                    username:true,
                    id:true
                }
            }
        }
    });

    find = find.sort((a,b) => b.createdAt-a.createdAt);

    return res.json({success:true,find});
});

router.post('/create',createLimiter,async(req,res) => {
    try {
        if(!req.user) return res.status(403).json({success:false,message:"Unauthorized!"});

        const {id,title} = req.body;
        if(!id || !title) return res.status(400).json({success:false,message:"Body err!"});

        let videoIsExist = await checkVideo(id);
        if(!videoIsExist) return res.status(400).json({success:false,message:"Video not found in youtube!"});
        
        let thumbnail = await getVideoThumbnail(id);

        /*let video = await videoModel.create({
            id,
            author:req.user._id,
            thumbnail
        });*/

        let video = await prisma.video.create({
            data:{
                videoId:id,
                authorId:req.user.id,
                thumbnail,
                views:[]
            }
        });
    
        res.json({success:true,message:"Created!",video});
    } catch (error) {
        res.status(500).json({success:false,message:error.message});
    }
});

router.get('/:id',async(req,res) => {
    const {id} = req.params;

    /*let find = await videoModel.findOne({
        id
    }).populate("author","-password -email -createdAt -updatedAt");*/
    let find = await prisma.video.findFirst({
        where:{
            id
        }
    })

    if(!find) return res.json({success:false,message:"Not found!"});

    if(req.user && !find.views.find((e) => e == req.user.id)) {
        find.views.push(req.user.id);
        find = await prisma.video.update({
            where:{
                id
            },
            data:{
                views:find.views
            }
        });
    };

    res.json({success:true,message:"Find!",find});
});

module.exports = router;
