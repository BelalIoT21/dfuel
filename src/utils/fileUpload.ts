
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

// Maximum file sizes
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_VIDEO_SIZE_MB = 50;
