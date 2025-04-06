const mongoose = require("mongoose");
const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
dotenv.config();


//******** Middleware ********/
app.use(express.json()); //req.body
app.use(cookieParser()); //req.cookies
const corsConfig = {
    origin: true,   //allows cross origin requests
    credentials: true, 
};
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));
app.use(helmet());

//****************** DB Connection ******************/

const dbLink = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.guedx.mongodb.net?retryWrites=true&w=majority`

mongoose.connect(dbLink)
    .then(function () {
        console.log("connected to db")
    }).catch(err => console.log(err))

//router imports
const AuthRouter = require("./Routers/AuthRouter");
const MovieRouter = require("./Routers/MovieRouter");
const DiscoverRouter = require('./Routers/DiscoverRouter');
const TvShowsRouter = require("./Routers/TvRouter");
const UserRouter = require("./Routers/UserRouter");
const VideoRouter = require("./Routers/VideoRouter");
const PaymentRouter = require("./Routers/PaymentRouter");

//router middleware
app.use("/api/auth", AuthRouter);
app.use("/api/movies", MovieRouter);
app.use("/api/discover", DiscoverRouter);
app.use("/api/tv", TvShowsRouter);
app.use("/api/user", UserRouter);
app.use("/api/video", VideoRouter);
app.use("/api/payment", PaymentRouter);

app.listen(3005, function() {
    console.log("Server is running on port 3005");
})
