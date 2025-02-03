const express = require('express');
const app = express();
require('dotenv').config();

const line = require('@line/bot-sdk');

const util = require('util');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');

const testscript = require('./testscript');
const validateFiles = require('./fileValidator');
const validateFile = require('./fileTypeValidation.js');
const { processMedia } = require('./ffmpeg.js');
const dropboxAPI = require('./dropboxAPI');

app.use('/processed_media', express.static(path.join(__dirname, 'processed_media')));


let ffmpegConfig = {
    fps: null,
    resolution: null,
    quality: null
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
    const richMenuId = "richmenu-3216d55fcc0fe9a9f4efc05531091c32"; // Replace with your Rich Menu ID
    const channelToken = process.env.token;

    await axios.post(`https://api.line.me/v2/bot/user/${userId}/richmenu/${richMenuId}`, null, {
        headers: {
            "Authorization": `Bearer ${channelToken}`
        }
    });
}

const client = new line.Client(config);

async function handleEvents(event) {
    if (event.type === 'message' && event.message.type === 'text') {

        const userMessage = event.message.text;

        if (userMessage.startsWith("fps:")) {
            const fpsValue = userMessage.split(":")[1];
            ffmpegConfig.fps = parseInt(fpsValue);
            return client.replyMessage(event.replyToken, [
                {
                    "type": "text",
                    "text": `FPS set to ${ffmpegConfig.fps}`
                }
            ]);
        }
    

        if (userMessage.startsWith("resolution:")) {
            const resolutionValue = userMessage.split(":")[1];
            ffmpegConfig.resolution = resolutionValue;
            return client.replyMessage(event.replyToken, [
                {
                    "type": "text",
                    "text": `Resolution set to ${ffmpegConfig.resolution}`
                }
            ]);
        }

        if (userMessage.startsWith("quality:")) {
            const qualityValue = userMessage.split(":")[1];
            ffmpegConfig.quality= qualityValue;
            return client.replyMessage(event.replyToken, [
                {
                    "type": "text",
                    "text": `Quality set to ${ffmpegConfig.quality}`
                }
            ]);
        }
        
        if (userMessage === "showData") {
            return showData(event);
        }

        if (userMessage === "Video set 1") {
            ffmpegConfig.fps = 30;
            ffmpegConfig.resolution = "1280x720";
            ffmpegConfig.quality = "low";
            return showData(event);
        }

        if (userMessage === "Video set 2") {
            ffmpegConfig.fps = 60;
            ffmpegConfig.resolution = "1980x1080";
            ffmpegConfig.quality = "standard";
            return showData(event);
        }

        if (userMessage === "Video set 3") {
            ffmpegConfig.fps = 60;
            ffmpegConfig.resolution = "2560x1440";
            ffmpegConfig.quality = "standard";
            return showData(event);
        }

        if (userMessage === "Instructions") {
            ffmpegConfig.fps = 60;
            ffmpegConfig.resolution = "2560x1440";
            ffmpegConfig.quality = "high";
            return showData(event);
        }




        if (userMessage === 'fileTests') {
            try {
                const testCases = [
                    './download/videogit/544193701166711011.mp4',
                    './download/audio/544193725040164901.mp3',
                    './download/image/544193714571182305.jpg',
                ];

                // เรียกใช้ validateFiles (ใน fileValidator)
                const results = validateFiles(testCases);

                return client.replyMessage(event.replyToken, [
                    {
                        type: 'text',
                        text: results.join('\n') 
                    }
                ]);
            } catch (error) {
                console.error('Error running tests:', error);
                return client.replyMessage(event.replyToken, [
                    {
                        type: 'text',
                        text: 'An error occurred while running the tests.'
                    }
                ]);
            }
        }

        if (userMessage === 'deleteTests') {
            try {
                const testCases = [ 
                    './download/videogit/544193701166711011.mp4',
                    './download/audio/544193725040164901.mp3',
                    './download/image/544193714571182305.jpg',
                ];

                const results = testCases.map((filePath, index) => {
                    const result = validateFile(filePath);
                    return `Test Case ${index + 1}: ${filePath} => ${result === true ? 'Video' : result === false ? 'Audio' : 'Invalid'}`;
                });

                return client.replyMessage(event.replyToken, [
                    {
                        type: 'text',
                        text: results.join('\n')
                    }
                ]);
            } catch (error) {
                console.error('Error running tests:', error);
                return client.replyMessage(event.replyToken, [
                    {
                        type: 'text',
                        text: 'An error occurred while running the tests.'
                    }
                ]);
            }
        }

        if (userMessage === "setNull") {
            ffmpegConfig.fps = null;
            ffmpegConfig.resolution = null;
            ffmpegConfig.quality = null;
            return showData(event);
        }

    return client.replyMessage(event.replyToken, [
        {
            "type": "text",
            "text": "Invalid input. Use 'fps:<value>' or 'resolution:<value>' to set FFmpeg configuration."
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

            if(event.message.contentProvider.type === 'line'){
                const dlpath = path.join(__dirname, 'download/image', `${event.message.id}.jpg`)

                await downloadcontent(event.message.id, dlpath)

                return client.replyMessage(event.replyToken, [
                    {
                        "type": "text",
                        "text": `Image Download complete`,
                        "quoteToken": event.message.quoteToken
                    }
                ])
            }
        
        } else if (event.message.type === 'video') {

            if (event.message.contentProvider.type === 'line') {
                const dlpath = path.join(__dirname, 'download/video', `${event.message.id}.mp4`);
                await downloadcontent(event.message.id, dlpath);
        
                try {
                    const userConfig = {
                        inputPath: dlpath,
                        videoOutput: true,
                        resolution: ffmpegConfig.resolution || "1280x720",
                        fps: ffmpegConfig.fps || 30,
                        quality: ffmpegConfig.quality || "standard",
                        outputFormat: ".mp4"
                    };
        
                    const result = await processMedia(userConfig);
        
                    if (result.success) {
                        const processedFilePath = result.processedFilePath;
        
                        // // สร้าง URL ของวิดีโอที่ประมวลผลแล้ว
                        // const fileUrl = `${process.env.SERVER_URL}/processed_media/video/${path.basename(processedFilePath)}`;
        
                        // return client.replyMessage(event.replyToken, [
                        //     {
                        //         "type": "text",
                        //         "text": `Video processing complete! You can watch/download it here:\n${fileUrl}`
                        //     },
                        //     {
                        //         "type": "video",
                        //         "originalContentUrl": fileUrl,
                        //         "previewImageUrl": "https://via.placeholder.com/240x135.png?text=Video"
                        //     }
                        // ]);

                        console.log('Media processed successfully. File path:', processedFilePath);

                        // Extract filename and subfolder for Dropbox path
                        const processedFileName = path.basename(processedFilePath); // Extracts just the filename
                        const processedSubfolder = path.dirname(processedFilePath).split(path.sep).pop(); // Extracts subfolder name

                        const DROPBOX_PATH = `/user_processed_file/${processedSubfolder}/${processedFileName}`;

                        // Step 3: Upload the processed file to Dropbox
                        console.log('Uploading to Dropbox...');

                        const downloadLink = await dropboxAPI.uploadToDropbox(processedFilePath, DROPBOX_PATH);

                        return client.replyMessage(event.replyToken, [
                            {
                                "type": "text",
                                "text": `Video processing complete! You can watch/download it here:\n${downloadLink}`
                            }
                        ]);
                        
                    } else {
                        return client.replyMessage(event.replyToken, [
                            {
                                "type": "text",
                                "text": `❌ Error processing video: ${result.error}`
                            }
                        ]);
                    }
                } catch (error) {
                    console.error("FFmpeg processing error:", error);
                    return client.replyMessage(event.replyToken, [
                        {
                            "type": "text",
                            "text": "⚠️ An error occurred while processing the video."
                        }
                    ]);
                }
            }

        } else if (event.message.type === 'audio') {
            if (event.message.contentProvider.type === 'line') {
                const dlpath = path.join(__dirname, 'download/audio', `${event.message.id}.mp3`);
                await downloadcontent(event.message.id, dlpath);
                return client.replyMessage(event.replyToken, [
                    {
                        "type": "text",
                        "text": `Audio download complete`,
                        "quoteToken": event.message.quoteToken
                    }
                ]);
            }
        } else {

            return client.replyMessage(event.replyToken, [
                {
                    "type": "text",
                    "text": `Invalid input. Here are some options to get started:`,
                    "quickReply": {
                        "items": [
                            {
                                "type": "action",
                                "action": {
                                    "type": "postback",
                                    "label": "Set FPS to 30",
                                    "data": "fps:30"
                                }
                            },
                            {
                                "type": "action",
                                "action": {
                                    "type": "postback",
                                    "label": "Set Resolution to 1080p",
                                    "data": "resolution:1080p"
                                }
                            },
                            {
                                "type": "action",
                                "action": {
                                    "type": "postback",
                                    "label": "Show Current Settings",
                                    "data": "showData"
                                }
                            },
                            {
                                "type": "action",
                                "action": {
                                    "type": "postback",
                                    "label": "Reset Configuration",
                                    "data": "setNull"
                                }
                            }
                        ]
                    }
                }
            ])
        }
    }
}

function showData(event) {
    return client.replyMessage(event.replyToken, [
        {
            "type": "text",
            "text": `Current Configuration:\nFPS: ${ffmpegConfig.fps || 'Not set'}\nResolution: ${ffmpegConfig.resolution || 'Not set'}\nQuality: ${ffmpegConfig.quality || 'Not set'}`
        }
    ]);
}

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