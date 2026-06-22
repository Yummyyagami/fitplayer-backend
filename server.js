const express = require('express');
const cors = require('cors');
const path = require('path');
const youtubedl = require('youtube-dl-exec');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(__dirname));

app.get('/api/extract', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) {
        return res.status(400).json({ error: 'Missing video ID' });
    }

    try {
        console.log(`Extracting stream for: ${videoId}`);
        const videoInfo = await youtubedl(`https://www.youtube.com/watch?v=${videoId}`, {
            dumpSingleJson: true,
            format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best', // Original quality video + audio
            jsRuntimes: 'node'
        });
        
        let videoUrl = '';
        let audioUrl = '';

        if (videoInfo.requested_formats && videoInfo.requested_formats.length > 0) {
            videoUrl = videoInfo.requested_formats[0].url; // HD Video stream
            audioUrl = videoInfo.requested_formats.length > 1 ? videoInfo.requested_formats[1].url : ''; // Audio stream
        } else {
            // Fallback to pre-merged format
            videoUrl = videoInfo.url;
            audioUrl = ''; 
        }
        
        res.json({ videoUrl, audioUrl, streamUrl: videoUrl }); // Returning all for safety
    } catch (error) {
        console.error('Extraction error:', error.message);
        res.status(500).json({ error: 'Failed to extract video stream' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser to test.`);
});
