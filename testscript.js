//file validation examples

const validateFile = require('./validation.js'); // Import file validation module

// Test cases
const testCases = [
    './download/542870227965182166.mp4',
    './download/aaa.mp3',
    './download/nonbot.png',
    './download/missing_file.xxx' // file doesn't exist
];

// Run each test case
testCases.forEach((filePath, index) => {
    console.log(`Test Case ${index + 1}: ${filePath}`);
    const result = validateFile(filePath);

    if (result === true) {
        console.log(`${filePath} is a video file.`);
    } else if (result === false) {
        console.log(`${filePath} is an audio file.`);
    } else if (result === null) {
        console.log(`${filePath} is neither a video nor an audio file, or it doesn't exist.`);
    }
    console.log('--------------------------------------');
});

//-------------------------------------------------------------------------------------------------------