const urlInput = document.getElementById('youtube-url-input');
const loadVideoBtn = document.getElementById('load-video-btn');

// Initialize video.js player
let player;
let audioPlayer;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Standard Video.js setup without any YouTube plugin
    player = videojs('yt-video-player');
    audioPlayer = document.getElementById('yt-audio-player');

    // Sync audio with video
    player.on('play', () => { if (audioPlayer.src) audioPlayer.play(); });
    player.on('pause', () => { if (audioPlayer.src) audioPlayer.pause(); });
    player.on('waiting', () => { if (audioPlayer.src) audioPlayer.pause(); });
    player.on('playing', () => { if (audioPlayer.src) audioPlayer.play(); });
    player.on('seeking', () => {
        if (audioPlayer.src) audioPlayer.currentTime = player.currentTime();
    });
    player.on('timeupdate', () => {
        if (audioPlayer.src && Math.abs(audioPlayer.currentTime - player.currentTime()) > 0.5) {
            audioPlayer.currentTime = player.currentTime();
        }
    });
});

// Extract YouTube ID from various URL formats
function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Load Video Event
loadVideoBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) return;

    const newVideoId = extractYouTubeId(url) || (url.length === 11 ? url : null);

    if (newVideoId && newVideoId.length === 11) {

        loadVideoBtn.textContent = 'Extracting...';
        loadVideoBtn.disabled = true;

        try {
            // Detect if we are running locally or on a live server like Netlify
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

            // NOTE: You must deploy your server.js to a backend host (like Render.com) 
            // and paste its live URL below. Netlify only hosts the frontend!
            const backendUrl = isLocal
                ? 'http://localhost:3000'
                : 'https://fitplayer-backend-production.up.railway.app';

            // Call the appropriate API endpoint
            const response = await fetch(`${backendUrl}/api/extract?id=${newVideoId}`);
            const data = await response.json();

            if (!response.ok || !data.videoUrl) {
                throw new Error(data.error || 'Failed to extract stream');
            }

            // Update Video.js source with the RAW HD video stream
            player.src({
                type: 'video/mp4',
                src: data.videoUrl
            });

            // Update audio source with the RAW audio stream
            if (data.audioUrl) {
                audioPlayer.src = data.audioUrl;
            } else {
                audioPlayer.removeAttribute('src');
            }

            player.play();

        } catch (error) {
            console.error(error);
            alert('Extraction failed. Make sure your local Node.js server (server.js) is running on port 3000.');
        } finally {
            loadVideoBtn.textContent = 'Load Video';
            loadVideoBtn.disabled = false;
        }

    } else {
        alert('Invalid YouTube URL or ID. Please check the link and try again.');
    }
});
