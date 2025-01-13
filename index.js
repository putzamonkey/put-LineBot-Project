const express = require('express');
const app = express();
require('dotenv').config();

const line = require('@line/bot-sdk');

const util = require('util');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');

const testscript = require('./testscript');

let ffmpegConfig = {
    fps: null,
    resolution: null
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
        
        if (userMessage === "showData") {
            return client.replyMessage(event.replyToken, [
                {
                    "type": "text",
                    "text": `Current Configuration:\nFPS: ${ffmpegConfig.fps || 'Not set'}\nResolution: ${ffmpegConfig.resolution || 'Not set'}`
                }
            ]);
        }

        if (userMessage === "testScript") {
            //const testFile = './sample.mp4';
            const result = testscript.validateFile(testCases); // เรียกฟังก์ชัน validateExample

            return client.replyMessage(event.replyToken, [
                {
                    type: "text",
                    text: `Validation Result: ${result}`
                }
            ]);
        }

        if (userMessage === "setNull") {
            ffmpegConfig.fps = null;
            ffmpegConfig.resolution = null;
            return client.replyMessage(event.replyToken, [
                {
                    "type": "text",
                    "text": `Current Configuration:\nFPS: ${ffmpegConfig.fps || 'Not set'}\nResolution: ${ffmpegConfig.resolution || 'Not set'}`
                }
            ]);
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
                const dlpath = path.join(__dirname, 'download/images', `${event.message.id}.jpg`)

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
                const dlpath = path.join(__dirname, 'download/videos', `${event.message.id}.mp4`);

                await downloadcontent(event.message.id, dlpath);

                return client.replyMessage(event.replyToken, [
                    {
                        "type": "text",
                        "text": `Video download complete`,
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