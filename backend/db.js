const mongoose = require('mongoose');
const { Schema } = require('zod');

mongoose.connect("mongodb+srv://Kanye:GentlemenInParis@dbchan.gsvjr1c.mongodb.net/paytm");

const userSchema = mongoose.Schema({
    username: String,
    password: String, 
    firstName: String,
    lastName: String
});
const AccountSchema = mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'User'
    },
        balance: Number
})
const User = mongoose.model("User",userSchema);
const Account = mongoose.model("Account",AccountSchema)
module.exports={
    User, Account
};