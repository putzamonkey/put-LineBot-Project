const express = require('express');
const app = express();
require('dotenv').config();

const line = require('@line/bot-sdk');

const util = require('util');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');

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
                const dlpath = path.join(__dirname, 'download', `${event.message.id}.jpg`)

                await downloadcontent(event.message.id, dlpath)

                return client.replyMessage(event.replyToken, [
                    {
                        "type": "text",
                        "text": `Download complete`,
                        "quoteToken": event.message.quoteToken
                    }
                ])
            }
            
        } 
        else {

            return client.replyMessage(event.replyToken, [
                {
                    "type": "text",
                    "text": `รับข้อมูลแล้ว`,
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
                            // {
                            //     "type": "action",
                            //     "action": {
                            //         "type": "uri",
                            //         "label": "Go google",
                            //         "uri": "https://www.google.com"
                            //     }
                            // },
                            // {
                            //     "type": "action",
                            //     "action": {
                            //         "type": "postback",
                            //         "data": "NWORD007",
                            //         "label": "Detail",
                            //         "text" : "CLICK NWORD007"
                            //     }
                            // },
                            // {
                            //     "type": "action",
                            //     "action": {
                            //         "type": "postback",
                            //         "data": "NWORD007",
                            //         "label": "Detail",
                            //         "text" : "CLICK NWORD007"
                            //     }
                            // },
                            // {
                            //     "type": "action",
                            //     "action": {
                            //         "type": "camera",
                            //         "label": "open camera",
                            //     }
                            // }
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