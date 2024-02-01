const express=require('express');

const accountRouter = require('./accounts');
const userRouter = require('./user');

const router = express.Router();

router.use('/user',userRouter);

router.use('/account', accountRouter);

module.exports=router;
//all requests start from api/v1/(whatever you put in router.use stuff)