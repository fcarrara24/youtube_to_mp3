
// req packages

const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();
const { searchToUrl } = require("./utils/searchToUrl");
const { convertYouTubeURL } = require("./utils/convertYouTubeURL");

// create express server
const app = express();

// server port number setting
const PORT = process.env.PORT || 3000;

//set template engine
app.set("view engine", "ejs");

app.use(express.static("public"))

//need to parse html datya for request
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json());

// routes
app.get("/", (req, res) => {
    res.render('index')
})



app.get('/download', async (req, res) => {
    const fileUrl = req.query.url; // External download link
    const filename = req.query.filename || 'downloaded.mp3'; // Default filename if none provided

    try {
        const response = await fetch(fileUrl);

        if (!response.ok) throw new Error('Failed to fetch file from external server');

        // Set the correct headers
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'audio/mpeg');

        // Pipe the response from the external server to the client
        response.body.pipe(res);
    } catch (error) {
        console.error('Error during file download:', error);
    }
});

app.post("/convert-mp3", async (req, res) => {
    // no data found
    if (!req.body.desName) {
        return res.render("index", { success: false, message: "CIANFRY, insert a valid name" });
    }

    let videoLink = req.body.videoId;

    if (req.body.desName && !videoLink) {
        videoLink = await searchToUrl(req.body.desName);
        if (!videoLink) {
            return res.render("index", { success: false, message: "No video found with that name." });
        }

    }

    let videoId = convertYouTubeURL(videoLink);

    if (!videoId) {
        return res.render("index", { success: false, message: "Please enter a video ID or search term." });
    }


    const quality = req.body.quality && req.body.quality !== 'default' ? req.body.quality : '320';
    const apiUrl = `https://youtube-mp3-downloader2.p.rapidapi.com/ytmp3/ytmp3/custom/?url=${videoId}&quality=${quality}&name=${req.body.desName ? req.body.desName.trim() : ''}`;

    try {
        const fetchAPI = await fetch(apiUrl, {
            "method": "GET",
            "headers": {
                'x-rapidapi-key': process.env.API_DOWNLOAD_KEY,
                'x-rapidapi-host': process.env.API_DOWNLOAD_HOST
            }
        });

        const fetchResponse = await fetchAPI.json();
        console.log(fetchResponse);
        if (fetchResponse.status === "finished") {
            const finalDesName = (req.body.desName ? req.body.desName.trim() : '') || fetchResponse.uniqueid;
            const sanitizedDesName = finalDesName.replace(/[^a-z0-9_\-]/gi, '_');

            return res.render('index', {
                success: true,
                uniqueid: finalDesName,
                song_link: `/download?url=${encodeURIComponent(fetchResponse.dlink)}&filename=${encodeURIComponent(sanitizedDesName)}.mp3`
            });
        } else {
            return res.render('index', {
                success: false,
                message: fetchResponse.msg
            });
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        return res.render('index', { success: false, message: "CIANFRY, HAI SBAGLIATO L'URL CAZZO" });
    }
});




//start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})