const validateFile = require('./validation.js'); 

/**
 * 
 * @param {string[]} testCases
 * @returns {string[]} 
 */
function validateFiles(testCases) {
    return testCases.map((filePath, index) => {
        const result = validateFile(filePath);
        if (result === true) {
            return `Test Case ${index + 1}: ${filePath} => Video`;
        } else if (result === false) {
            return `Test Case ${index + 1}: ${filePath} => Audio`;
        } else {
            return `Test Case ${index + 1}: ${filePath} => Invalid (File not found or unsupported type)`;
        }
    });
}

module.exports = validateFiles;