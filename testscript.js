// File validation examples

const validateFile = require('./validation.js'); // Import file validation module

// // Test cases (try with your own stuff)
const testCases = [
    './download/video/544193701166711011.mp4',
    './download/audio/544193725040164901.mp3',
    './download/image/544193714571182305.jpg',
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

// File annihilator usage examples (VERY DESTRUCTIVE, USE WITH CAUTION)

const annihilateFile = require('./fileAnnihilator.js');

// For single file

// const filePath = './download/test.txt';
// const result = annihilateFile(filePath);
// if (result) {
//     console.log(`${filePath} was successfully annihilated.`);
// } else {
//     console.log(`Failed to annihilate ${filePath}.`);
// }

// For batch removing files

// // Array of file paths to delete
// const filePaths = [
//     './file1.txt',
//     './file2.mp4',
//     './file3.mp3',
// ];

// // Use loop to delete each file
// filePaths.forEach((filePath) => {
//     const result = annihilateFile(filePath);
//     if (result) {
//         console.log(`${filePath} was successfully annihilated.`);
//     } else {
//         console.log(`Failed to annihilate ${filePath}.`);
//     }
// });

//-------------------------------------------------------------------------------------------------------