const Dropbox = require('dropbox').Dropbox;
const fetch = require('node-fetch'); // Ensure fetch is available
require('dotenv').config(); // Load environment variables

const dropboxAPI = {
  async uploadToDropbox(filePath, dropboxPath) {
    const dropboxToken = process.env.DROPBOX_ACCESS_TOKEN;

    if (!dropboxToken) {
      throw new Error("[DropboxAPI] Dropbox access token is missing. Please set it in the .env file.");
    }

    const dbx = new Dropbox({ accessToken: dropboxToken, fetch });

    try {
      // Clean up old files
      const folderPath = dropboxPath.substring(0, dropboxPath.lastIndexOf('/')) || '/'; // Get the folder path
      console.log(`[DropboxAPI] Checking for old files in folder: ${folderPath}`);

      const listResponse = await dbx.filesListFolder({ path: folderPath });
      const now = new Date();

      for (const entry of listResponse.result.entries) {
        if (entry['.tag'] === 'file') {
          const fileModifiedTime = new Date(entry.client_modified);
          const timeDifference = (now - fileModifiedTime) / (1000 * 60 * 60); // Difference in hours

          if (timeDifference > 4) {
            console.log(`[DropboxAPI] Deleting old file: ${entry.name} (Last modified: ${entry.client_modified})`);
            await dbx.filesDeleteV2({ path: entry.path_lower });
          }
        }
      }

      // Read the file content
      const fs = require('fs');
      const fileContent = fs.readFileSync(filePath);

      console.log(`[DropboxAPI] Uploading file: ${filePath} to Dropbox at ${dropboxPath}`);

      // Upload the file
      const uploadResponse = await dbx.filesUpload({
        path: dropboxPath,
        contents: fileContent,
        mode: 'overwrite',
      });

      console.log("[DropboxAPI] File uploaded successfully:", uploadResponse);

      // Get a temporary download link
      const linkResponse = await dbx.filesGetTemporaryLink({
        path: dropboxPath,
      });

      console.log("[DropboxAPI] Temporary link response:", linkResponse);

      const temporaryDownloadLink = linkResponse.result?.link;
      if (!temporaryDownloadLink) {
        throw new Error("No temporary link returned in response.");
      }

      console.log("[DropboxAPI] Temporary download link:", temporaryDownloadLink);

      return temporaryDownloadLink;
    } catch (error) {
      console.error("[DropboxAPI] Error uploading to Dropbox or generating download link:", error);
      throw error;
    }
  },
};

module.exports = dropboxAPI;
