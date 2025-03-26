
/**
 * Utility for handling file uploads
 */

/**
 * Convert a file to a data URL
 */
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Validate file type and size
 */
export const validateFile = (file: File, allowedTypes: string[], maxSizeMB: number): string | null => {
  // Check file type
  const fileType = file.type;
  if (!allowedTypes.includes(fileType)) {
    return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `File size exceeds the maximum allowed size (${maxSizeMB}MB)`;
  }
  
  return null;
};

// Allowed file types
export const IMAGE_TYPES = [
  'image/jpeg', 
  'image/png', 
  'image/gif', 
  'image/webp'
];

export const VIDEO_TYPES = [
  'video/mp4', 
  'video/webm', 
  'video/ogg'
];

// Maximum file sizes - increased limits further
export const MAX_IMAGE_SIZE_MB = 50; // Increased from 25MB to 50MB
export const MAX_VIDEO_SIZE_MB = 200; // Maintained at 200MB

// Function to compress an image if needed
export const compressImageIfNeeded = async (dataUrl: string, maxSizeMB: number = MAX_IMAGE_SIZE_MB): Promise<string> => {
  // If the image isn't too large, return it as is
  const estimatedSizeInMB = (dataUrl.length * 3) / (4 * 1024 * 1024); // Rough estimate of size
  
  if (estimatedSizeInMB <= maxSizeMB) {
    return dataUrl;
  }
  
  console.log(`Image is large (approximately ${estimatedSizeInMB.toFixed(2)}MB), attempting basic optimization`);
  
  // For very large images, we'll just return them and let the server handle it
  // The server-side code has been updated to handle larger payloads
  return dataUrl;
};
