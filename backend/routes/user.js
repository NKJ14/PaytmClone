const express= require('express');
const zod = require('zod');

const router = express.Router();

const {User, Account}=require('../db');

const jwt = require('jsonwebtoken');
const {jwt_secret} = require('../config');
const  { authMiddleware } = require("../middleware");


// other auth routes

const updateBody = zod.object({
	password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})

router.put("/", authMiddleware, async (req, res) => {
    const { success } = updateBody.safeParse(req.body)
    if (!success) {
        res.status(411).json({
            message: "Error while updating information"
        })
    }

    await User.updateOne(req.body, {
        _id: req.userId
    })

    res.json({
        message: "Updated successfully"
    })
})
const signupSchema = zod.object({
    username:zod.string().email(),
    password:zod.string(),
    firstName:zod.string(),
    lastName:zod.string()
});
router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})
router.post('/signup',async (req,res)=>{
    const body = req.body;  //pick up the body
    const {success} = signupSchema.safeParse(body); //parse it, input validation

    if(!success){   //not successful means invalid stuff
        return res.status(411).json({
            msg:"incorrect input"
        })
    }
    //now we check if user still exists
    const user = await User.findOne({
        username:body.username
    })

    if(user._id){
        return res.status(411).json({
            msg:"email taken"
        })
    }   //return if exists
    //once confirmed user doesnt exist, we create the db entry
    const dbUser = await User.create({
        username:req.body.username,
        password:req.body.password,
        firstName:req.body.firstName,
        lastName:req.body.lastName
    }); //making a user in db
    const userId = user._id;
    //giving the said user his account

    await Account.create({
        userId,
        balance: 1+ Math.random()*10000
    })
    //no storing in variable cuz db is there

    const token = jwt.sign({
        userId:userId
    }, jwt_secret);
    //send out the jwt signed token
    res.json({
        msg:"DONE!User created successfully",
        token: token
    })  //give a short and sweet response
})


const signinBody = zod.object({
    username: zod.string().email(),
	password: zod.string()
})

router.post("/signin", async (req, res) => {
    const { success } = signinBody.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password
    });

    if (user) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);
  
        res.json({
            token: token
        })
        return;
    }

    
    res.status(411).json({
        message: "Error while logging in"
    })
})
module.exports=router;