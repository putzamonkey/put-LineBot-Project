const fs = require('fs');

/**
 * VERY DESTRUCTIVE, PLEASE USE WITH CAUTION.
 * Deletes a file from the filesystem.
 * @param {string} filePath - The path to the file to delete.
 * @returns {boolean} - Returns true if the file was successfully deleted, false otherwise.
 */

function annihilateFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return false;
    }

    try {
        fs.unlinkSync(filePath);
        console.log(`Annihilated file: ${filePath}`);
        return true;
    } catch (error) {
        console.error(`Failed to annihilate file: ${filePath}`, error);
        return false;
    }
}

module.exports = annihilateFile;
