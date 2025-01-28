const dropboxAPI = require('./dropboxAPI');
const { processMedia } = require('./ffmpeg');

(async () => {
  // Example user input for media processing
  const userInput = {
    inputPath: "./download/video.mp4",    // Must exist
    videoOutput: false,                   // true for video ouput, false for audio output | if the the input format is audio, the value cannot be set to true
    resolution: "",                       // input "0" or "1" for default value | to use scale mode input a float value in 0-1 range, sth like "0.75" | to use set resolution mode input sth like "1920x1080" or "1920*1080" | can be left empty entirely if videoOutput = false
    fps: "",                              // left empty or input "0" for default value | fps cannot exceed 120
    quality: "high",                      // use 'low', 'standard', or 'high'
    outputFormat: ".mp3",                 // ".mp3", ".aiff", ".aac", ".wav" for audio | ".mp4", ".mov", ".avi", ".mkv", ".flv", ".wmv" for video
  };

  try {
    console.log('Starting media processing...');

    // Step 1: Process the media file using ffmpeg.js
    const result = await processMedia(userInput);

    if (result.success) {
      console.log('Media processed successfully. File path:', result.processedFilePath);

      // Step 2: Use the same file name from the processed file path for Dropbox
      const processedFileName = result.processedFilePath.split('/').pop();
      const DROPBOX_PATH = `/processed-media/${processedFileName}`;

      // Step 3: Upload the processed file to Dropbox
      console.log('Uploading to Dropbox...');
      const downloadLink = await dropboxAPI.uploadToDropbox(result.processedFilePath, DROPBOX_PATH);

      // Step 4: Output the download link
      console.log('testDropboxIntegrations download link:', downloadLink);
    } else {
      console.error('Media processing failed:', result.error);
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
})();
