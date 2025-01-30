const dropboxAPI = require('./dropboxAPI');
const { processMedia } = require('./ffmpeg');
const path = require('path');

(async () => {
  // Example user input for media processing
  const userInput = {
    inputPath: "./download/video.mp4",    // Must exist
    videoOutput: true,                   // true for video output, false for audio output
    resolution: "0.1",                       // Can be left empty if videoOutput = false
    fps: "0",                              // FPS setting
    quality: "high",                      // 'low', 'standard', or 'high'
    outputFormat: ".mp4",                 // Output format
  };

  try {
    console.log('Starting media processing...');

    // Step 1: Process the media file using ffmpeg.js
    const result = await processMedia(userInput);

    if (result.success) {
      console.log('Media processed successfully. File path:', result.processedFilePath);

      // Extract filename and subfolder for Dropbox path
      const processedFileName = path.basename(result.processedFilePath); // Extracts just the filename
      const processedSubfolder = path.dirname(result.processedFilePath).split(path.sep).pop(); // Extracts subfolder name

      const DROPBOX_PATH = `/user_processed_file/${processedSubfolder}/${processedFileName}`;

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
