const express = require('express');
//const userModel = require('../models/user');

const router = express.Router();

router.get('/',async(req,res) => {
    //let find = await userModel.find();
    let {page} = req.query;
    if(!page) page = 0;
    page = Number(page);

    let find = await prisma.user.findMany({
        skip:page*20,
        take:20,
        select:{
            id:true,
            username:true,
            videos:true
        },
    });

    for (const user of find) {
        user.viewers = user.videos.map((e) => e.views.length).reduce((a,b) => a+b,0);
        delete user.videos;
    };

    find.sort((a,b) => b.viewers-a.viewers);

    res.json({success:true,message:"Find!",find})
});

router.get('/:id',async(req,res) => {
    const {id} = req.params;

    let find = await prisma.user.findFirst({
        where:{
            id
        },
        select:{
            id:true,
            username:true,
            videos:true
        }
    });

    find.viewers = find.videos.map((e) => e.views.length).reduce((a,b) => a+b,0);
    delete find.videos;

    if(!find) return res.json({success:false,message:"Not found!"});

    res.json({success:true,message:"Find!",find});
});

router.get('/:id/videos',async(req,res) => {
    const {id} = req.params;

    let {page} = req.query;
    if(!page) page = 0;
    page = Number(page);

    let find = await prisma.video.findMany({
        where:{
            authorId:id
        },
        include:{
            author:{
                select:{
                    id:true,
                    username:true
                }
            }
        },
        take:20,
        skip:20*page
    });

    if(!find) return res.json({success:false,message:"Not found!"});

    res.json({success:true,message:"Find!",find});
});

module.exports = router;
