const express = require("express");
const AuthRouter = express.Router()

const {signupHandler, loginHandler, forgetPasswordHandler, resetPasswordHandler, logoutController} = require("../controllers/AuthController");

AuthRouter.post("/signup", signupHandler);
AuthRouter.post("/login", loginHandler);
AuthRouter.patch("/forgetPassword", forgetPasswordHandler);
AuthRouter.patch("/resetPassword", resetPasswordHandler);
AuthRouter.get("/logout", logoutController);

module.exports = AuthRouter;