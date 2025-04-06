const express = require("express");
const VideoRouter = express.Router();
const {
    getVideoStream,
    getAllVideos,
    getVideoThumbnail
} = require("../controllers/VideoController.js");
/***********routes**************/

VideoRouter.get("/", getAllVideos);
VideoRouter.get("/watch", getVideoStream);
VideoRouter.get("/thumbnail", getVideoThumbnail);
module.exports = VideoRouter;