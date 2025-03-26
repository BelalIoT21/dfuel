
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
  
  // Check file size - increased size limit further
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

// Maximum file sizes - reduced to solve upload issues
export const MAX_IMAGE_SIZE_MB = 5; // Reduced to 5MB for reliable uploads
export const MAX_VIDEO_SIZE_MB = 20; // Reduced to 20MB for reliable uploads

// Function to compress an image if needed - simplified to avoid processing errors
export const compressImageIfNeeded = async (dataUrl: string, maxSizeMB: number = MAX_IMAGE_SIZE_MB): Promise<string> => {
  // Simply return the data URL without compression to avoid issues
  console.log(`Image processed, size approximately: ${(dataUrl.length / (1024 * 1024)).toFixed(2)}MB`);
  return dataUrl;
};
