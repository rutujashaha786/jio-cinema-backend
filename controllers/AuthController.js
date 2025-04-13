const UserModel = require("../Model/UserModel");
const emailSender = require("../utility/DynamicMailSender");
const jwt = require("jsonwebtoken");
const promisify = require("util").promisify;
const promisifiedJWTSign = promisify(jwt.sign);
const promisifiedJWTVerify = promisify(jwt.verify);
const bcrypt = require("bcrypt");

async function signupHandler(req, res){
    try{
        const userObject = req.body;

        if(!userObject.email || !userObject.password){
            return res.status(400).json({
                message: "Required data is missing",
                status: "failure"
            })
        }

        const user = await UserModel.findOne({email : userObject.email});

        if(user){
            return res.status(400).json({
                message: "User already exists",
                status: "failure"
            })
        }

        const newUser = await UserModel.create(userObject);

        const authtoken = await promisifiedJWTSign({id : newUser["_id"]}, process.env.JWT_SECRET_KEY);
        res.cookie("jwt", authtoken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            path: "/",
            sameSite: "Lax",   //allows browser to store cookies for cross origin 
            secure: true,
            domain: ".streamscene.stream",
        })

        return res.status(201).json({
            message: "user signup successfully",
            user: newUser,
            status: "success"
        })
    }
    catch(err){
        return res.status(500).json({
            message: err.message,
            status: "failure"
        })
    }
}
    
async function loginHandler(req, res){
    try{
        const {email, password} = req.body;

        const user = await UserModel.findOne({email});

        if(!user){
            return res.status(404).json({
                message: "user or password is invalid",
                status: "failure"
            })
        }

        const isEqual = await bcrypt.compare(password, user.password);
        if(!isEqual){
            return res.status(404).json({
                message: "user or password is invalid",
                status: "failure"
            })
        }

        //token creation
        const authtoken = await promisifiedJWTSign({id : user["_id"]}, process.env.JWT_SECRET_KEY);
        res.cookie("jwt", authtoken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            path: "/",
            sameSite: "Lax",   //allows browser to store cookies for cross origin 
            secure: true,
            domain: ".streamscene.stream",
        })

        res.status(200).json({
            message: "User logged in successfully",
            status: "success",
            user
        })

    }
    catch(err){
        res.status(500).json({
            message: err.message,
            status: "failure"
        })
    }
}

async function protectedRouteMiddleware(req, res, next){
    try{
        //token verification
        const token = req.cookies.jwt;
        if(!token){
            return res.status(401).json({
                message: "Unauthorized access",
                status: "failure"
            })
        }

        let decodedPayload = await promisifiedJWTVerify(token, process.env.JWT_SECRET_KEY);
        if (decodedPayload) {
            req.userId = decodedPayload.id; //Req object modified by middleware, which can be accessed by next function
            next();
        }
    }
    catch(err){
        res.status(500).json({
            message: "internal server error",
            status: "failure"
        })
    }
}

function otpGenerator(){
    return Math.floor(100000 + Math.random() * 900000);
}

async function forgetPasswordHandler(req, res){
    try{
        if (!req.body.email) {
            return res.status(400).json({
                status: "failure",
                message: "Please enter the email for forget Password"
            })
        }
        
        const user = await UserModel.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({
                status: "failure",
                message: "user not found for this email"
            })
        }
        
        const otp = otpGenerator();
        user.otp = otp;
        user.otpExpiry = Date.now() + 1000 * 60 * 10;

        await user.save({ validateBeforeSave: false });

        const templateData = { name: user.name, otp: user.otp }
        await emailSender("./templates/otp.html", user.email, templateData);

        res.status(200).json({
            message: "otp send successfully to your email",
            status: "success",
            otp: otp
        })

    } catch (err) {
        res.status(500).json({
            message: err.message,
            status: "failure"
        })
    }
}

async function resetPasswordHandler(req, res){
    try{
        const resetDetails = req.body;

        if(!resetDetails.password || !resetDetails.confirmPassword || !resetDetails.otp || resetDetails.password != resetDetails.confirmPassword){
            return res.status(400).json({
                message: "Invalid request",
                status: "failure"
            })
        }

        const user = await UserModel.findOne({ email: req.body.email });
        if(!user){
            return res.status(404).json({
                message: "User not found",
                status: "failure"
            })
        }

        if (!user.otp) {
            return res.status(401).json({
                status: "failure",
                message: "unauthorized access to reset Password"
            })
        }

        // if otp is expired
        if (Date.now() > user.otpExpiry) {
            return res.status(401).json({
                status: "failure",
                message: "otp expired"
            })
        }

        if (user.otp != resetDetails.otp) {
            return res.status(401).json({
                status: "failure",
                message: "otp is incorrect"
            })
        }

        user.password = resetDetails.password;
        user.confirmPassword = resetDetails.confirmPassword;

        // remove the otp from the user
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();
        res.status(200).json({
            status: "success",
            message: "password reset successfully"
        })
    }
    catch(err){
        res.status(500).json({
            message: err.message,
            status: "failure"
        })
    }
}


async function logoutController(req, res) {  
    try{
        res.clearCookie("jwt", {
            httpOnly: true,
            path: "/",
            sameSite: "Lax",   //allows browser to store cookies for cross origin 
            secure: true,
            domain: ".streamscene.stream",
        });
    
        res.status(200).json({
            status: "success",
            message: "user logged out successfully",
        });
    }catch(err){
        res.status(500).json({
            message : err.message,
            status: "failure"
        })
    }
};


module.exports = {signupHandler, loginHandler, forgetPasswordHandler, resetPasswordHandler, logoutController, protectedRouteMiddleware}