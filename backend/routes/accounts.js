const express= require('express');
const mongoose=require('mongoose');
const {authMiddleware} = require('../middleware');
const {Account}=require('../db');

const router = express.Router();

router.get('/balance',authMiddleware,async (req,res)=>{
    const account= await Account.findOne({
        userId:req.userId
    });

    res.json({
        msg:`Your balance is: ${account.balance}`
    });
});

router.post('/transfer',authMiddleware,async(req,res)=>{
    const session = await mongoose.startSession();

    session.startTransaction();

    const {amount,to} = req.body;
    const account= await Account.findOne({
        userId:req.userId
    })
    if(!account || account.balance<amount){
        await session.abortTransaction();       //rollback
        res.status(400).json({
            msg:"Insufficient Balance"
        });
    };
    const toAccount = await Account.findOne({
        userId:to   
    });

    if(!toAccount){
        await session.abortTransaction();
        res.status(400).json({
            msg:"User doesn't exist!"
        });
    };

    await Account.updateOne({
        userId: req.userId
    }, {
        $inc: {
            balance: -amount
        }
    });

    await Account.updateOne({
        userId: to
    }, {
        $inc: {
            balance: amount
        }
    });

    session.commitTransaction();        //transcation was successfully committed

    res.status(200).json({
        msg:"Transfer is successful!"
    });
});


module.exports= router;