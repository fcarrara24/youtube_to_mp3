// req packages
const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

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
        res.status(500).send('Error downloading file');
    }
});

app.post("/convert-mp3", async (req, res) => {
    const videoId = req.body.videoId;
    const desName = req.body.desName ? req.body.desName.trim() : '';  // Trim any extra whitespace
    const quality = req.body.quality && req.body.quality !== 'default' ? req.body.quality : '320';

    if (!videoId) {
        return res.render("index", { success: false, message: "Please enter a video ID" });
    } else {
        const apiUrl = `https://youtube-mp3-downloader2.p.rapidapi.com/ytmp3/ytmp3/custom/?url=${videoId}&quality=${quality}&name=${desName}`;
        console.log(`Fetching: ${apiUrl}`);

        try {
            const fetchAPI = await fetch(apiUrl, {
                "method": "GET",
                "headers": {
                    'x-rapidapi-key': process.env.API_KEY,
                    'x-rapidapi-host': process.env.API_HOST
                }
            });

            const fetchResponse = await fetchAPI.json();
            console.log('fetchResponse:', fetchResponse);

            if (fetchResponse.status === "finished") {
                const finalDesName = desName || fetchResponse.uniqueid;  // Use desName or fallback to uniqueid
                const sanitizedDesName = finalDesName.replace(/[^a-z0-9_\-]/gi, '_'); // Sanitize the name

                // Pass the dlink and desired filename to the download route
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
            return res.render('index', { success: false, message: "An error occurred while processing your request." });
        }
    }
});




//start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})