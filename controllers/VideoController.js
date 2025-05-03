const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");

ffmpeg.setFfmpegPath(ffmpegInstaller.path); 

const getAllVideos = async (req, res) => {
    try {
        const videoDirectory = path.join(__dirname, "..", "videos");
        const files = fs.readdirSync(videoDirectory);

        const mp4Files = files.filter(
            (file) => path.extname(file).toLowerCase() === ".mp4"
        );

        const videoList = mp4Files.map((file) => ({
            id: path.parse(file).name,
            name: file,
        }));

        res.status(200).json({
            status: "success",
            data: videoList,
        });
    } catch (err) {
        console.error("Error fetching video list:", err);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch video list",
        });
    }
};


const getVideoStream = async (req, res) => {
    try {
        let id = req.query.id;
        
        //"bytes=0-"
        const range = req.headers.range;
        if (!range) {
            res.status(400).send("Missing range header");
        }

        const videoPath = path.join(__dirname, "..", "videos", `${id}.mp4`);

        if (!fs.existsSync(videoPath)) {
            return res.status(404).send("Video not found");
        }

        const videoSize = fs.statSync(videoPath).size; 

        // Parse Range
        const CHUNK_SIZE = 0.5 * 1024 * 1024; // Half megabyte
        let start = Number(range.replace(/\D/g, ""));
        let end = Math.min(start + CHUNK_SIZE, videoSize - 1);

        // Create headers
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": end - start + 1,
            "Content-Type": "video/mp4",
            "Cross-Origin-Resource-Policy": "cross-origin",
        };

        // HTTP Status 206 for Partial Content
        res.writeHead(206, headers);

        // create video read stream for this particular chunk
        const videoStream = fs.createReadStream(videoPath, { start, end });

        // Stream the video chunk directly to the client
        videoStream.pipe(res);
    } catch (err) {
        console.log(err);
        res.status(500).send("Server error");
    }
};

const getVideoThumbnail = async (req, res) => {
    const { videoId } = req.query;

    if (!videoId) {
        return res.status(400).json({
            status: "error",
            message: "Missing videoId parameter"
        });
    }

    const videoPath = path.join(__dirname, "..", "videos", `${videoId}.mp4`);
    const thumbnailPath = path.join(__dirname, "..", "thumbnails", `${videoId}.jpg`);

    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    // Generate thumbnail if it doesn't exist
    if (!fs.existsSync(thumbnailPath)) {
        ffmpeg(videoPath)
            .on("end", () => res.sendFile(thumbnailPath))
            .on("error", (err) => {
                console.error(`Error creating thumbnail for ${videoId}:`, err);
                res.status(500).json({
                    status: "error",
                    message: "Failed to generate thumbnail"
                });
            })
            .screenshots({
                timestamps: ["00:00:05"],  // Capture at 5 seconds mark
                filename: `${videoId}.jpg`,
                folder: path.join(__dirname, "..", "thumbnails"),
                size: "320x240"
            });
    } else {
        res.sendFile(thumbnailPath);
    }
}

module.exports = {
    getAllVideos,
    getVideoStream,
    getVideoThumbnail
};