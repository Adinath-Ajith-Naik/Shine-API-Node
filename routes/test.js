const GoogleDriveManager = require('./google-drive-manager');

const driveManager = new GoogleDriveManager('./credentials.json');
await driveManager.authenticate();

// Upload an image
const result = await driveManager.uploadImage('E:\Free Lance Projects\Shine Latest\Shine-API-Node\Images\Category\c6e7eb05-4a70-4a66-bd09-708756130a94.jpg', 'vacation-photo.jpg');

// List all images
const images = await driveManager.listImages();

// Download an image
await driveManager.downloadImage(result.id, './downloads/photo.jpg');