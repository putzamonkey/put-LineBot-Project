const dropboxAPI = require('./dropboxAPI');
const { processMedia } = require('./ffmpeg');
const path = require('path');

(async () => {
  // Example user input for media processing
  const userInput = {
    inputPath: "./download/video.mp4",    // Must exist
    videoOutput: false,                   // true for video output, false for audio output
    resolution: "1",                    // Can be left empty if videoOutput = false
    fps: "30",                             // FPS setting
    quality: "low",                      // 'low', 'standard', or 'high'
    outputFormat: ".mp3",                 // Output format
  };

  try {
    console.log('Starting media processing...');

    // Step 1: Process the media file using ffmpeg.js
    const result = await processMedia(userInput);

    if (result.success) {
      console.log('Media processed successfully. File path:', result.processedFilePath);

      // Extract filename and subfolder for Dropbox path
      const processedFileName = path.basename(result.processedFilePath);
      const processedSubfolder = path.dirname(result.processedFilePath).split(path.sep).pop();

      const DROPBOX_PATH = `/user_processed_file/${processedSubfolder}/${processedFileName}`;

      // Step 3: Upload the processed file to Dropbox and get its metadata
      console.log('Uploading to Dropbox...');
      const { downloadLink, fileSize } = await dropboxAPI.uploadToDropbox(result.processedFilePath, DROPBOX_PATH);

      // Step 4: Log the download link and file size
      console.log('✅ File uploaded successfully!');
      console.log('🔗 Download link:', downloadLink);
      console.log(`📂 File size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);

    } else {
      console.error('❌ Media processing failed:', result.error);
    }
  } catch (error) {
    console.error('❌ An error occurred:', error);
  }
})();
