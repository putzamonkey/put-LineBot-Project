const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const WebSocket = require('ws');

const app = express();
app.use(express.json());
app.use(cors()); // Allow frontend to access API

const LOG_FILE = path.join(__dirname, 'logs', 'log.log');
const NGROK_COMMAND = `"ngrok.exe" http --url=bonefish-alive-hopefully.ngrok-free.app 8080`;

// ✅ Start the bot using PM2
app.post('/bot/start', (req, res) => {
    console.log("Starting bot...");
    exec('pm2 start index.js --name linebot', (err, stdout, stderr) => {
        if (err) {
            console.error("Error starting bot:", stderr);
            return res.status(500).send(`Error starting bot: ${stderr}`);
        }
        console.log("Bot started:", stdout);
        res.send('Bot started');
    });
});

// ✅ Stop the bot
app.post('/bot/stop', (req, res) => {
    console.log("Stopping bot...");
    exec('pm2 stop linebot', (err, stdout, stderr) => {
        if (err) {
            console.error("Error stopping bot:", stderr);
            return res.status(500).send(`Error stopping bot: ${stderr}`);
        }
        console.log("Bot stopped:", stdout);
        res.send('Bot stopped');
    });
});

// ✅ Start ngrok
let ngrokProcess = null;
app.post('/ngrok/start', (req, res) => {
    if (ngrokProcess) return res.send('Ngrok already running');

    console.log("Ngrok started.");
    ngrokProcess = exec(NGROK_COMMAND);
    res.send('Ngrok started');
});

// ✅ Stop ngrok
app.post('/ngrok/stop', (req, res) => {
    if (!ngrokProcess) return res.send('Ngrok is not running');

    console.log("Ngrok stopped.");
    exec('taskkill /IM ngrok.exe /F');
    ngrokProcess = null;
    res.send('Ngrok stopped');
});

// ✅ Fetch logs from log file
app.get('/logs', (req, res) => {
    fs.access(LOG_FILE, fs.constants.F_OK, (err) => {
        if (err) {
            console.error("Log file not found:", err);
            return res.status(404).send("Log file not found.");
        }

        fs.readFile(LOG_FILE, 'utf8', (err, data) => {
            if (err) {
                console.error("Error reading log file:", err);
                return res.status(500).send("Error reading log file.");
            }
            res.send(data);
        });
    });
});

// ✅ WebSocket setup for PM2 logs
const wssOutput = new WebSocket.Server({ port: 3002 });
let logStream = null;

function startPM2LogStream() {
    if (logStream) return; // Prevent multiple instances

    logStream = exec('pm2 logs linebot --lines 20');

    logStream.stdout.on('data', (data) => {
        wssOutput.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });

    logStream.stderr.on('data', (data) => {
        console.error("Error streaming PM2 logs:", data);
    });

    logStream.on('close', () => {
        logStream = null; // Reset logStream when it stops
    });
}

wssOutput.on('connection', (ws) => {
    console.log("New WebSocket connection for PM2 logs");
    startPM2LogStream(); // Ensure only one stream is running

    ws.on('close', () => {
        console.log("WebSocket client disconnected");
    });
});

// ✅ Check if the bot is running
app.get('/bot/status', (req, res) => {
    exec('pm2 list', (err, stdout, stderr) => {
        if (err) return res.status(500).send('Error checking bot status');

        const isRunning = stdout.includes('linebot') && stdout.includes('online');
        res.json({ running: isRunning });
    });
});

// ✅ Check if ngrok is running
app.get('/ngrok/status', (req, res) => {
    exec('tasklist', (err, stdout, stderr) => {
        if (err) return res.status(500).send('Error checking ngrok status');

        const isRunning = stdout.toLowerCase().includes('ngrok.exe');
        res.json({ running: isRunning });
    });
});

// ✅ Clear PM2 logs
app.post('/terminal/clear', (req, res) => {
    exec('pm2 flush', (err, stdout, stderr) => {
        if (err) {
            console.error("Error clearing terminal logs:", stderr);
            return res.status(500).send("Failed to clear terminal logs.");
        }
        res.send("Terminal logs cleared successfully.");
    });
});

// ✅ Clear log file
app.post('/logs/clear', (req, res) => {
    fs.writeFile(LOG_FILE, '', (err) => {
        if (err) {
            console.error("Error clearing log file:", err);
            return res.status(500).send("Failed to clear log file.");
        }
        res.send("Log file cleared successfully.");
    });
});

// ✅ Start the Express server on port 3001
app.listen(3001, () => console.log('Admin API running on port 3001'));
