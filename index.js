const express = require('express');
const app = express();
require('dotenv').config();

const line = require('@line/bot-sdk');

const util = require('util');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');

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
        
    } else {

        return client.replyMessage(event.replyToken, [
            {
                "type": "text",
                "text": `รับข้อมูลแล้ว`,
                "quoteToken": event.message.quoteToken
            }
        ])
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