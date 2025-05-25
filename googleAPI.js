const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class GoogleDriveManager {
  constructor(credentialsPath, tokenPath) {
    this.credentialsPath = credentialsPath;
    this.tokenPath = tokenPath;
    this.auth = null;
    this.drive = null;
  }

  // Initialize authentication
  async authenticate() {
    try {
      // Load client secrets from a local file
      const credentials = JSON.parse(fs.readFileSync(this.credentialsPath));
      const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

      const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

      await this.getAccessToken(oAuth2Client);

      this.auth = oAuth2Client;
      this.drive = google.drive({ version: 'v3', auth: oAuth2Client });
      console.log('Authentication successful!');
    } catch (error) {
      console.error('Error during authentication:', error.message);
      throw error;
    }
  }

  // Get and store new token
  async getAccessToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive.file'],
    });

    console.log('Authorize this app by visiting this url:', authUrl);
    console.log('Enter the code from that page here: ');

    // In a real application, you'd handle this differently
    // For demo purposes, you'll need to manually get the code
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve, reject) => {
      rl.question('Enter authorization code: ', (code) => {
        rl.close();
        oAuth2Client.getAccessToken(code, (err, token) => {
          if (err) {
            console.error('Error retrieving access token', err);
            reject(err);
            return;
          }
          oAuth2Client.setCredentials(token);

          // Store the token to disk for later program executions
          fs.writeFileSync(this.tokenPath, JSON.stringify(token));
          console.log('Token stored to', this.tokenPath);
          resolve(token);
        });
      });
    });
  }

  // Upload an image to Google Drive
  async uploadImage(imagePath, fileName = null, folderId = '1_cTGjYwp2FPZlYM5YFI_EG_kdp7VLoj3') {
    try {
      if (!this.drive) {
        throw new Error('Not authenticated. Call authenticate() first.');
      }

      if (!fs.existsSync(imagePath)) {
        throw new Error(`File not found: ${imagePath}`);
      }

      const finalFileName = fileName || path.basename(imagePath);

      const fileMetadata = {
        name: finalFileName,
        parents: folderId ? [folderId] : undefined,
      };

      const media = {
        mimeType: this.getMimeType(imagePath),
        body: fs.createReadStream(imagePath),
      };

      console.log(`Uploading ${finalFileName}...`);

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, mimeType, size, createdTime',
      });

      console.log(`Upload successful! File ID: ${response.data.id}`);
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error.message);
      throw error;
    }
  }

  // Retrieve/Download an image from Google Drive
  async downloadImage(fileId, downloadPath) {
    try {
      if (!this.drive) {
        throw new Error('Not authenticated. Call authenticate() first.');
      }

      // Get file metadata first
      const fileMetadata = await this.drive.files.get({
        fileId: fileId,
        fields: 'name, mimeType',
      });

      console.log(`Downloading ${fileMetadata.data.name}...`);

      // Download the file
      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media',
      }, { responseType: 'stream' });

      // Ensure download directory exists
      const downloadDir = path.dirname(downloadPath);
      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
      }

      // Save the file
      const dest = fs.createWriteStream(downloadPath);
      response.data.pipe(dest);

      return new Promise((resolve, reject) => {
        dest.on('finish', () => {
          console.log(`Download complete: ${downloadPath}`);
          resolve({
            fileName: fileMetadata.data.name,
            mimeType: fileMetadata.data.mimeType,
            downloadPath: downloadPath
          });
        });
        dest.on('error', reject);
      });
    } catch (error) {
      console.error('Error downloading file:', error.message);
      throw error;
    }
  }

  // List images in Google Drive
  async listImages(folderId = null, pageSize = 10) {
    try {
      if (!this.drive) {
        throw new Error('Not authenticated. Call authenticate() first.');
      }

      let query = "mimeType contains 'image/'";
      if (folderId) {
        query += ` and '${folderId}' in parents`;
      }

      const response = await this.drive.files.list({
        q: query,
        pageSize: pageSize,
        fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime)',
        orderBy: 'createdTime desc',
      });

      const files = response.data.files;
      if (files.length) {
        console.log('Images found:');
        files.forEach((file) => {
          console.log(`- ${file.name} (${file.id}) - ${this.formatFileSize(file.size)}`);
        });
      } else {
        console.log('No images found.');
      }

      return files;
    } catch (error) {
      console.error('Error listing files:', error.message);
      throw error;
    }
  }

  // Get file information
  async getFileInfo(fileId) {
    try {
      if (!this.drive) {
        throw new Error('Not authenticated. Call authenticate() first.');
      }

      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, size, createdTime, modifiedTime, parents, webViewLink',
      });

      return response.data;
    } catch (error) {
      console.error('Error getting file info:', error.message);
      throw error;
    }
  }

  // Delete an image
  async deleteImage(fileId) {
    try {
      if (!this.drive) {
        throw new Error('Not authenticated. Call authenticate() first.');
      }

      await this.drive.files.delete({
        fileId: fileId,
      });

      console.log(`File ${fileId} deleted successfully.`);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error.message);
      throw error;
    }
  }

  // Helper method to get MIME type
  getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  // Helper method to format file size
  formatFileSize(bytes) {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Example usage
async function main() {
  // Initialize the Google Drive manager
  const driveManager = new GoogleDriveManager(
    './credentials.json',  // Path to your credentials file
    './token.json'         // Path to store the token
  );

  try {
    // Authenticate
    await driveManager.authenticate();

    // Example: Upload an image
    // const uploadResult = await driveManager.uploadImage('./path/to/your/image.jpg', 'my-uploaded-image.jpg');
    // console.log('Uploaded file:', uploadResult);

    // Example: List images
    // const images = await driveManager.listImages();

    // Example: Download an image
    // await driveManager.downloadImage('your-file-id-here', './downloads/downloaded-image.jpg');

    // Example: Get file information
    // const fileInfo = await driveManager.getFileInfo('your-file-id-here');
    // console.log('File info:', fileInfo);

  } catch (error) {
    console.error('Main execution error:', error.message);
  }
}

// Uncomment to run the example
// main();

module.exports = GoogleDriveManager;