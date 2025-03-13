const express = require('express');
const app = express();
require('dotenv').config();

const line = require('@line/bot-sdk');

const util = require('util');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');

const { processMedia } = require('./ffmpeg.js');
const dropboxAPI = require('./dropboxAPI.js');
const annihilateFile = require('./fileAnnihilator.js');

app.use('/processed_media', express.static(path.join(__dirname, 'processed_media')));


let ffmpegConfig = {
    fps: null,
    resolution: null,
    quality: null,
    outputFormat: null,
    videoOutput: null
};

const config = {
    channelAccessToken: process.env.token,
    channelSecret: process.env.secretcode
}

app.post('/webhook', line.middleware(config), (req, res) => {
    Promise
        .all([
            req.body.events.map(handleEvents)
        ])    
        .then((result) => res.json(result))
});

// Link Rich Menu to a User
async function linkRichMenu(userId) {
    const richMenuId = process.env.RICH_MENU_ID; 
    const channelToken = process.env.token;

    await axios.post(
        `https://api.line.me/v2/bot/user/${userId}/richmenu/${richMenuId}`,
        null,
        {
            headers: {
                "Authorization": `Bearer ${channelToken}`
            }
        }
    );
}

const client = new line.Client(config);

async function handleEvents(event) {
    if (event.type === 'message' && event.message.type === 'text') {

        const userMessage = event.message.text;

        if (userMessage.startsWith("fps:")) {
            let fpsValue = userMessage.split(":")[1]?.trim(); // Remove whitespace
            let parsedFps = parseInt(fpsValue, 10);
        
            if (!isNaN(parsedFps) && parsedFps >= 0 && parsedFps <= 120) {
                ffmpegConfig.fps = parsedFps;
                return client.replyMessage(event.replyToken, [
                    {
                        "type": "text",
                        "text": `✅ FPS set to ${ffmpegConfig.fps}`
                    }
                ]);
            } else {
                return client.replyMessage(event.replyToken, [
                    {
                        "type": "text",
                        "text": "⚠️ Invalid FPS value! Please enter a number between 0 and 120."
                    }
                ]);
            }
        }
        
        if (userMessage.startsWith("resolution:")) {
            let resolutionValue = userMessage.split(":")[1];
            
            if (typeof resolutionValue !== "string") {
                return client.replyMessage(event.replyToken, [
                    { "type": "text", "text": "⚠️ Invalid resolution input!" }
                ]);
            }
        
            resolutionValue = resolutionValue.trim(); // Ensure it is a string before trimming
        
            // Check if it's a floating number between 0.1 and 1
            let floatResolution = parseFloat(resolutionValue);
            let isValidFloat = !isNaN(floatResolution) && floatResolution >= 0.1 && floatResolution <= 1;
        
            // Check if it's a valid resolution format (e.g., 1920x1080 or 1920*1080)
            let resolutionPattern = /^(\d+)[x*](\d+)$/;
            let match = resolutionValue.match(resolutionPattern);
            let isValidResolutionFormat = match !== null;
        
            if (isValidFloat || isValidResolutionFormat) {
                ffmpegConfig.resolution = isValidFloat ? floatResolution : `${match[1]}x${match[2]}`; // Convert * to x
                return client.replyMessage(event.replyToken, [
                    { "type": "text", "text": `✅ Resolution set to ${ffmpegConfig.resolution}` }
                ]);
            } else {
                return client.replyMessage(event.replyToken, [
                    { "type": "text", "text": "⚠️ Invalid resolution! Use a value between 0.1 and 1, or a format like 1920x1080 or 1920*1080." }
                ]);
            }
        }
        
        
        if (userMessage.startsWith("quality:")) {
            let qualityValue = userMessage.split(":")[1]?.trim().toLowerCase(); // Remove whitespace & ignore case
        
            if (["low", "standard", "high"].includes(qualityValue)) {
                ffmpegConfig.quality = qualityValue;
                return client.replyMessage(event.replyToken, [
                    {
                        "type": "text",
                        "text": `✅ Quality set to ${ffmpegConfig.quality}`
                    }
                ]);
            } else {
                return client.replyMessage(event.replyToken, [
                    {
                        "type": "text",
                        "text": "⚠️ Invalid quality! Choose 'low', 'standard', or 'high'."
                    }
                ]);
            }
        }
        
        if (userMessage.startsWith("videoOutput:")) {
            let videoOutputValue = userMessage.split(":")[1]?.trim().toLowerCase(); // Remove whitespace & ignore case
            
            if (["true", "1"].includes(videoOutputValue)) {
                ffmpegConfig.videoOutput = true;
            } else if (["false", "0"].includes(videoOutputValue)) {
                ffmpegConfig.videoOutput = false;
            } else {
                return client.replyMessage(event.replyToken, [
                    {
                        "type": "text",
                        "text": "⚠️ Invalid videoOutput! Use 'true' or 'false' (or '1'/'0')."
                    }
                ]);
            }
        
            return client.replyMessage(event.replyToken, [
                {
                    "type": "text",
                    "text": `✅ videoOutput set to ${ffmpegConfig.videoOutput}`
                }
            ]);
        }
        
        if (userMessage.startsWith("outputFormat:")) {
            let formatValue = userMessage.split(":")[1]?.trim().toLowerCase(); // Remove whitespace & ignore case
        
            const validAudioFormats = [".mp3", ".aiff", ".aac", ".wav"];
            const validVideoFormats = [".mp4", ".mov", ".avi", ".mkv", ".flv", ".wmv"];
        
            // Ensure format starts with "." (e.g., "mp3" -> ".mp3")
            if (!formatValue.startsWith(".")) {
                formatValue = "." + formatValue;
            }
        
            if (![...validAudioFormats, ...validVideoFormats].includes(formatValue)) {
                return client.replyMessage(event.replyToken, [
                    {
                        "type": "text",
                        "text": `⚠️ Invalid outputFormat! Please use a valid format:\n`
                            + `🎵 Audio Formats: ${validAudioFormats.join(", ")}\n`
                            + `🎥 Video Formats: ${validVideoFormats.join(", ")}`
                    }
                ]);
            }
        
            ffmpegConfig.outputFormat = formatValue;
        
            return client.replyMessage(event.replyToken, [
                {
                    "type": "text",
                    "text": `✅ outputFormat set to ${ffmpegConfig.outputFormat}`
                }
            ]);
        }
        
        if (userMessage === "showData") {
            return showData(event);
        }

        if (userMessage === "HQvideo") {
            ffmpegConfig.fps = 60;
            ffmpegConfig.resolution = "1";
            ffmpegConfig.quality = "high";
            ffmpegConfig.videoOutput = true;
            ffmpegConfig.outputFormat = ".mp4";
            return showData(event);
        }

        if (userMessage === "SDvideo") {
            ffmpegConfig.fps = 30;
            ffmpegConfig.resolution = "1";
            ffmpegConfig.quality = "standard";
            ffmpegConfig.videoOutput = true;
            ffmpegConfig.outputFormat = ".mp4";
            return showData(event);
        }

        if (userMessage === "LQvideo") {
            ffmpegConfig.fps = 30;
            ffmpegConfig.resolution = "0.5";
            ffmpegConfig.quality = "low";
            ffmpegConfig.videoOutput = true;
            ffmpegConfig.outputFormat = ".mp4";
            return showData(event);
        }

        if (userMessage === "HQaudio") {
            ffmpegConfig.fps = null;
            ffmpegConfig.resolution = null;
            ffmpegConfig.quality = "high";
            ffmpegConfig.videoOutput = false;
            ffmpegConfig.outputFormat = ".mp3";
            return showData(event);
        }

        if (userMessage === "SDaudio") {
            ffmpegConfig.fps = null;
            ffmpegConfig.resolution = null;
            ffmpegConfig.quality = "standard";
            ffmpegConfig.videoOutput = false;
            ffmpegConfig.outputFormat = ".mp3";
            return showData(event);
        }

        if (userMessage === "LQaudio") {
            ffmpegConfig.fps = null;
            ffmpegConfig.resolution = null;
            ffmpegConfig.quality = "low";
            ffmpegConfig.videoOutput = false;
            ffmpegConfig.outputFormat = ".mp3";
            return showData(event);
        }

        if (userMessage === "setNull") {
            ffmpegConfig.fps = null;
            ffmpegConfig.resolution = null;
            ffmpegConfig.quality = null;
            ffmpegConfig.outputFormat = null;
            ffmpegConfig.videoOutput = null;
            return showData(event);
        }

        if (
            userMessage.toLowerCase().startsWith("help") ||
            userMessage.toLowerCase().startsWith("h")
        ) {
            // Customize this text however you like
            const helpText = 
        `Here’s how to use our Bot:
        
        1. Set FFmpeg parameters before uploading media:
           - fps:<value> (0 - 120)
           - resolution:<0.1 - 1 or WxH>
           - quality:<low/standard/high>
           - videoOutput:<true/false or 1/0>
           - outputFormat:<.mp3, .mp4, .wav, etc.>
        
        2. Check your current settings:
           - Type "showData" to see the current FFmpeg configuration.
        
        3. Clear your current settings:
           - Type "setNull" to reset all parameters (FPS, Resolution, Quality, etc.) to "Not set".
        
        4. Upload your media:
           - If it’s a VIDEO, you can choose videoOutput=true (video out) or false (audio out).
           - If it’s AUDIO, set videoOutput=false.
           - Output format must match your selected output type.
        
        5. Example Commands:
           - fps:60
           - resolution:1920x1080
           - quality:standard
           - videoOutput:true
           - outputFormat:mp4
        
        After setting everything, just upload your file and the bot will process it!`;
        
            return client.replyMessage(event.replyToken, [
                {
                    type: "text",
                    text: helpText
                }
            ]);
        }
        

    return client.replyMessage(event.replyToken, [
        {
            "type": "text",
            "text": "Invalid input, please type \"help\" or \"h\" in the chat for more information."
        }
    ]);

    } else if (event.type === 'postback'){
        const data = event.postback.data;
       
        if (data.startsWith("fps:")) {
            const fpsValue = data.split(":")[1];
            ffmpegConfig.fps = parseInt(fpsValue);
            return client.replyMessage(event.replyToken, [
                {
                    "type": "text",
                    "text": `FPS set to ${ffmpegConfig.fps}`
                }
            ]);
        }

        if (data.startsWith("resolution:")) {
            const resolutionValue = data.split(":")[1];
            ffmpegConfig.resolution = resolutionValue;
            return client.replyMessage(event.replyToken, [
                {
                    "type": "text",
                    "text": `Resolution set to ${ffmpegConfig.resolution}`
                }
            ]);
        }

        if (data.startsWith("showData")) {
            
            return client.replyMessage(event.replyToken, [
                {
                    "type": "text",
                    "text": `FPS: ${ffmpegConfig.fps}, Resolution: ${ffmpegConfig.resolution}`
                }
            ]);
        }

        return client.replyMessage(event.replyToken, [
            {
                "type": "text",
                "text": "Invalid data. Please use 'fps:<value>' or 'resolution:<value>'"
            }
        ]);


    } else {

        if (event.message.type == 'image') {

            return client.replyMessage(event.replyToken, [
                {
                    "type": "text",
                    "text": `Invalid file type, please upload the correct file type`,
                    "quoteToken": event.message.quoteToken
                }
            ]) 

        } else if (event.message.type === 'video') {
            const userId = event.source.userId;
            if (event.message.contentProvider.type === 'line') {
                const dlpath = path.join(__dirname, 'download/video', `${event.message.id}.mp4`);
                await downloadcontent(event.message.id, dlpath);
        
                try {
                    // 1) Check for user-defined or default
                    const videoOutput = (ffmpegConfig.videoOutput !== undefined && ffmpegConfig.videoOutput !== null)
                        ? ffmpegConfig.videoOutput
                        : null;
        
                    // 2) If videoOutput is null => user must explicitly set
                    if (videoOutput === null) {
                        return client.replyMessage(event.replyToken, [
                            {
                                "type": "text",
                                "text": "⚠️ videoOutput is not set! Please set it to 'true' or 'false' before uploading."
                            }
                        ]);
                    }
        
                    const validAudioFormats = [".mp3", ".aiff", ".aac", ".wav"];
                    const validVideoFormats = [".mp4", ".mov", ".avi", ".mkv", ".flv", ".wmv"];
        
                    // 3) Check outputFormat consistency
                    const outputFormat = ffmpegConfig.outputFormat || (videoOutput ? ".mp4" : ".mp3");
        
                    if (videoOutput === true && !validVideoFormats.includes(outputFormat)) {
                        return client.replyMessage(event.replyToken, [
                            {
                                "type": "text",
                                "text": `⚠️ Inconsistent settings! videoOutput=true requires a video format (${validVideoFormats.join(", ")}).`
                            }
                        ]);
                    }
        
                    if (videoOutput === false && !validAudioFormats.includes(outputFormat)) {
                        return client.replyMessage(event.replyToken, [
                            {
                                "type": "text",
                                "text": `⚠️ Inconsistent settings! videoOutput=false requires an audio format (${validAudioFormats.join(", ")}).`
                            }
                        ]);
                    }
        
                    // All good -> proceed
                    const userConfig = {
                        inputPath: dlpath,
                        videoOutput: videoOutput,
                        resolution: ffmpegConfig.resolution || "1",
                        fps: ffmpegConfig.fps || 30,
                        quality: ffmpegConfig.quality || "standard",
                        outputFormat: outputFormat
                    };
        
                    const result = await processMedia(userConfig);
        
                    if (result.success) {
                        const processedFilePath = result.processedFilePath;
                        console.log('Media processed successfully. File path:', processedFilePath);
        
                        const processedFileName = path.basename(processedFilePath);
                        const processedSubfolder = path.dirname(processedFilePath).split(path.sep).pop();
                        const DROPBOX_PATH = `/user_processed_file/${processedSubfolder}/${processedFileName}`;
        
                        console.log('Uploading to Dropbox...');
                        const downloadLink = await dropboxAPI.uploadToDropbox(processedFilePath, DROPBOX_PATH);
        
                        await logUserActivity(userId, ffmpegConfig, "Video Sent");
        
                        return client.replyMessage(event.replyToken, [
                            {
                                "type": "text",
                                "text": `✅ Media processing complete! You can watch/download it here:\n${downloadLink}`
                            }
                        ]);
                    } else {
                        return client.replyMessage(event.replyToken, [
                            {
                                "type": "text",
                                "text": `❌ Error processing media: ${result.error}`
                            }
                        ]);
                    }
        
                } catch (error) {
                    console.error("FFmpeg processing error:", error);
                    return client.replyMessage(event.replyToken, [
                        {
                            "type": "text",
                            "text": "⚠️ An error occurred while processing the media."
                        }
                    ]);
                } finally {
                    // Always remove the original file from /download
                    annihilateFile(dlpath);
                }
            }
        
        } else if (event.message.type === 'audio') {
            if (event.message.contentProvider.type === 'line') {
                const userId = event.source.userId;
                const dlpath = path.join(__dirname, 'download/audio', `${event.message.id}.mp3`);
                await downloadcontent(event.message.id, dlpath);
        
                try {
                    // 1) Check for user-defined or default
                    const videoOutput = (ffmpegConfig.videoOutput !== undefined && ffmpegConfig.videoOutput !== null)
                        ? ffmpegConfig.videoOutput
                        : null;
        
                    // 2) Must be false for audio
                    if (videoOutput === null) {
                        return client.replyMessage(event.replyToken, [
                            {
                                "type": "text",
                                "text": "⚠️ videoOutput is not set! Please set it to 'false' before uploading an audio file."
                            }
                        ]);
                    }
                    if (videoOutput === true) {
                        return client.replyMessage(event.replyToken, [
                            {
                                "type": "text",
                                "text": "⚠️ Inconsistent settings! You cannot convert audio with videoOutput=true.\nplease set the videoOutput=false."
                            }
                        ]);
                    }
        
                    // So videoOutput is definitely false here
                    const validAudioFormats = [".mp3", ".aiff", ".aac", ".wav"];
                    const outputFormat = ffmpegConfig.outputFormat || ".mp3";
                    if (!validAudioFormats.includes(outputFormat)) {
                        return client.replyMessage(event.replyToken, [
                            {
                                "type": "text",
                                "text": `⚠️ Inconsistent settings! For audio input (videoOutput=false), outputFormat must be one of ${validAudioFormats.join(", ")}`
                            }
                        ]);
                    }
        
                    // All good -> proceed
                    const userConfig = {
                        inputPath: dlpath,
                        videoOutput: false,
                        resolution: ffmpegConfig.resolution,
                        fps: ffmpegConfig.fps,
                        quality: ffmpegConfig.quality || "standard",
                        outputFormat: outputFormat
                    };
        
                    const result = await processMedia(userConfig);
        
                    if (result.success) {
                        const processedFilePath = result.processedFilePath;
                        console.log('Media processed successfully. File path:', processedFilePath);
        
                        const processedFileName = path.basename(processedFilePath);
                        const processedSubfolder = path.dirname(processedFilePath).split(path.sep).pop();
                        const DROPBOX_PATH = `/user_processed_file/${processedSubfolder}/${processedFileName}`;
        
                        console.log('Uploading to Dropbox...');
                        const downloadLink = await dropboxAPI.uploadToDropbox(processedFilePath, DROPBOX_PATH);
        
                        await logUserActivity(userId, ffmpegConfig, "Audio Sent");
        
                        return client.replyMessage(event.replyToken, [
                            {
                                "type": "text",
                                "text": `✅ Media processing complete! You can listen/download it here:\n${downloadLink}`
                            }
                        ]);
                    } else {
                        return client.replyMessage(event.replyToken, [
                            {
                                "type": "text",
                                "text": `❌ Error processing media: ${result.error}`
                            }
                        ]);
                    }
        
                } catch (error) {
                    console.error("FFmpeg processing error:", error);
                    return client.replyMessage(event.replyToken, [
                        {
                            "type": "text",
                            "text": "⚠️ An error occurred while processing the media."
                        }
                    ]);
                } finally {
                    // Always remove the original file from /download
                    annihilateFile(dlpath);
                }
            }
        }
    }
}        
function showData(event) {
    return client.replyMessage(event.replyToken, [
        {
            "type": "text",
            "text": `🔧 **Current Configuration:**\n`
                + `🎥 videoOutput: ${ffmpegConfig.videoOutput !== undefined ? ffmpegConfig.videoOutput : 'Not set'}\n`
                + `📁 outputFormat: ${ffmpegConfig.outputFormat || 'Not set'}\n`
                + `🎞️ fps: ${ffmpegConfig.fps !== null ? ffmpegConfig.fps : 'Not set'}\n`
                + `📺 resolution: ${ffmpegConfig.resolution || 'Not set'}\n`
                + `📊 quality: ${ffmpegConfig.quality || 'Not set'}`
        }
    ]);
}


app.use('/webhook', express.raw({ type: 'application/json' }));

// Directory to store logs
const LOG_FILE = path.join(__dirname, 'logs', 'log.log');
if (!fs.existsSync(path.dirname(LOG_FILE))) {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
}

// Function to log user activity
async function logUserActivity(userId, ffmpegConfig, eventType) {
    try {
        const profile = await client.getProfile(userId);
        const username = profile.displayName || userId;

        const logEntry = `${new Date().toISOString()} - Event: ${eventType}, Username: ${username}, FPS: ${ffmpegConfig.fps || 'Not set'}, Resolution: ${ffmpegConfig.resolution || 'Not set'}, Quality: ${ffmpegConfig.quality || 'Not set'}\n`;
    
        fs.appendFile(LOG_FILE, logEntry, (err) => {
            if (err) {
                console.error('Failed to save log:', err);
            }
        });
    
        console.log(`Log saved for ${username}`);
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
}

// Save log via API
app.post('/logs', (req, res) => {
    const { userId, ffmpegConfig } = req.body;
    if (!userId || !ffmpegConfig) {
        return res.status(400).json({ error: 'Missing userId or ffmpegConfig' });
    }
    
    logUserActivity(userId, ffmpegConfig, 'Manual Log Entry');
    res.json({ success: true, message: 'Log saved' });
});

// Get logs for a specific user
// app.get('/logs/:userId', (req, res) => {
//     const { userId } = req.params;
//     const logFile = path.join(LOGS_DIR, `${userId}.log`);
    
//     if (!fs.existsSync(logFile)) {
//         return res.status(404).json({ error: 'No logs found' });
//     }
    
//     fs.readFile(logFile, 'utf8', (err, data) => {
//         if (err) {
//             return res.status(500).json({ error: 'Failed to read log file' });
//         }
//         res.json({ userId, logs: data.split('\n').filter(line => line) });
//     });
// });

// if (require.main === module) {
//     const userId = "putzamonkey"; // 🔹 ใส่ UserID จริงของคุณที่ใช้ทดสอบ
//     const ffmpegConfig = {
//         fps: 30,
//         resolution: "1920x1080",
//         quality: "high"
//     };

//     logUserActivity(userId, ffmpegConfig, "Manual Test").then(() => {
//         console.log("✅ Log test completed!");
//     }).catch(err => {
//         console.error("❌ Log test failed:", err);
//     });
// }



async function downloadcontent(mid, downloadpath) {
    const stream = await client.getMessageContent(mid);
    const piplineSync = util.promisify(pipeline);
    const folder_download = fs.createWriteStream(downloadpath);
    await piplineSync(stream, folder_download);
}

app.get('/', (req, res) => {
    res.send('ok');
})

app.listen(8080, () => console.log('start server in port 8080'));
console.log("Token:", process.env.token);
console.log("Secret:", process.env.secretcode);