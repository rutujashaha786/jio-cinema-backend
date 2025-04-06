const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const wishlistItemSchema = new mongoose.Schema({
    poster_path: { type: String, required: true },
    name: { type: String, required: true },
    id: { type: String, required: true },
    media_type: { type: String, required: true },
});

const schemaRules = {
    name : {
        type: String,
        required : [true, "name is required"]
    },
    email : {
        type : String,
        required : true,
        unique : [true, "email should be unique"]
    },
    password : {
        type : String,
        required : [true, "password is required"],
        minLength : [6, "password should be atleast of 6 length"]
    },
    confirmPassword : {
        type : String,
        required : true,
        validate : [function () {
            return this.password == this.confirmPassword
        }, "confirm password should be equal to password"]
    },
    createdAt : {
        type : Date,
        default : Date.now()
    },
    role : {
        type : String,
        default : "user"
    },
    otp : {
        type : String
    },
    otpExpiry : {
        type : Date
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    wishlist: [wishlistItemSchema],
}

const userSchema = new mongoose.Schema(schemaRules);

userSchema.pre("save", async function(next) {
    this.confirmPassword = undefined;

    if (!this.isModified("password")) return next(); 

    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.post("save", function(){
    this.__v = undefined;
    this.password = undefined;
})

//final touchpoint for crud
const UserModel = mongoose.model("users", userSchema);

module.exports = UserModel;
