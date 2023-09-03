require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');
const morgan = require('morgan');
//const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
//const userModel = require('./models/user');
const {PrismaClient} = require('@prisma/client');

globalThis.prisma = new PrismaClient();

const app = express();

app.use(cors({
    origin:"*",
    credentials:false
}))

const authRouter = require('./routes/auth');
const videoRouter = require('./routes/video');
const userRouter = require('./routes/user');

app.use(morgan('dev'));

app.use(bodyparser.json());

app.use(async(req,res,next) => {
    let token = req.headers.authorization;
    if(!token) return next();

    try {
        let decode = jwt.verify(token,process.env.SECRET);
        if(!decode.expiresIn || !decode.user || !decode.user.id || !decode.user.password) return next();

        /*let find = await userModel.findOne({
            _id:decode.user._id,
            password:decode.user.password
        });*/
        let find = await prisma.user.findFirst({
            where:{
                id:decode.user.id,
                password:decode.user.password
            }
        });
        
        if(!find) return next();
        
        req.user = find;
        next();
    } catch (error) {
        next();
    }
});

app.use('/api/auth',authRouter);
app.use('/api/video',videoRouter);
app.use('/api/user',userRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT,() => console.log(`App listening on port ${PORT}`));
