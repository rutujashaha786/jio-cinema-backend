const express = require("express")
const {
    getNowPlaying,
    getTrending,
    getUpcoming,
    getTopRated
} = require("../controllers/DiscoverController")

const DiscoverRouter = express.Router()
DiscoverRouter.get("/now-playing", getNowPlaying)
DiscoverRouter.get("/trending", getTrending)
DiscoverRouter.get("/upcoming", getUpcoming)
DiscoverRouter.get("/top-rated", getTopRated)

module.exports = DiscoverRouter;