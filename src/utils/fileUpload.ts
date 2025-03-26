
/**
 * Utility for handling file uploads
 */

/**
 * Convert a file to a data URL
 */
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const sizeInMB = (result.length / (1024 * 1024)).toFixed(2);
      console.log(`File successfully converted to data URL. Size: ${sizeInMB}MB`);
      resolve(result);
    };
    reader.onerror = (error) => {
      console.error('Error converting file to data URL:', error);
      reject(error);
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Validate file type and size
 */
export const validateFile = (file: File, allowedTypes: string[], maxSizeMB: number): string | null => {
  console.log(`Validating file: ${file.name}, size: ${(file.size / (1024 * 1024)).toFixed(2)}MB, type: ${file.type}`);
  
  // Check file type
  const fileType = file.type;
  if (!allowedTypes.includes(fileType)) {
    console.error(`Invalid file type: ${fileType}. Allowed types: ${allowedTypes.join(', ')}`);
    return `Invalid file type. Allowed types: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`;
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    console.error(`File size exceeds maximum: ${(file.size / (1024 * 1024)).toFixed(2)}MB > ${maxSizeMB}MB`);
    return `File size exceeds the maximum allowed size (${maxSizeMB}MB)`;
  }
  
  console.log(`File validation passed for ${file.name}`);
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

// Maximum file sizes - increased to 20MB for images
export const MAX_IMAGE_SIZE_MB = 20; // Increased from 15MB to 20MB
export const MAX_VIDEO_SIZE_MB = 50; // Increased from 30MB to 50MB

// No compression - just return the original data URL
export const compressImageIfNeeded = async (dataUrl: string): Promise<string> => {
  // Log the size but don't attempt compression
  const sizeInMB = (dataUrl.length / (1024 * 1024)).toFixed(2);
  console.log(`Image size: ${sizeInMB}MB - no compression applied`);
  return dataUrl;
};
