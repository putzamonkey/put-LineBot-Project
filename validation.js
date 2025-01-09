const fs = require('fs');
const mime = require('mime-types');
const annihilateFile = require('./fileAnnihilator.js');

/**
 * Validates the file type based on the file path.
 * @param {string} filePath - The path to the file to validate.
 * @returns {boolean|null} - Returns true for video, false for audio, and null for other types.
 */

function validateFile(filePath) {
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return null;
    }

    // Get the MIME type of the file
    const mimeType = mime.lookup(filePath);

    if (!mimeType) {
        console.error(`Unable to determine MIME type for file: ${filePath}`);
        return null;
    }

    // Check if the MIME type is video
    if (mimeType.startsWith('video/')) {
        return true;
    }

    // Check if the MIME type is audio
    if (mimeType.startsWith('audio/')) {
        return false;
    }

    // If not video or audio, remove that file, and return null
    annihilateFile(filePath); // Delete the invalid file
    return null;
}

module.exports = validateFile;
