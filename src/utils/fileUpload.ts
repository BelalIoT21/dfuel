
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
export const MAX_IMAGE_SIZE_MB = 20;
export const MAX_VIDEO_SIZE_MB = 50;

/**
 * Compress an image to reduce file size if needed
 * @param dataUrl Original image data URL
 * @param targetSizeMB Target size in MB
 * @param quality Initial quality (0-1)
 * @returns Compressed image data URL
 */
export const compressImageIfNeeded = async (
  dataUrl: string, 
  targetSizeMB: number = 2,
  quality: number = 0.8
): Promise<string> => {
  // Get the current size of the data URL in MB
  const currentSizeMB = dataUrl.length / (1024 * 1024);
  console.log(`Image size before compression: ${currentSizeMB.toFixed(2)}MB`);
  
  // If the image is already smaller than target size, return it as is
  if (currentSizeMB <= targetSizeMB) {
    console.log(`Image size (${currentSizeMB.toFixed(2)}MB) is already below target (${targetSizeMB}MB). No compression needed.`);
    return dataUrl;
  }
  
  // Create an image element to load the data URL
  const img = new Image();
  
  // Wait for the image to load
  const imageLoaded = new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load image for compression'));
  });
  
  // Set the source to our data URL
  img.src = dataUrl;
  await imageLoaded;
  
  // Create a canvas to draw the image
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error('Failed to get canvas context for image compression');
    return dataUrl;
  }
  
  // Calculate dimensions - scale down if image is too large
  let width = img.width;
  let height = img.height;
  
  // Max dimensions for very large images
  const MAX_DIMENSION = 2048;
  
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    if (width > height) {
      height = Math.round(height * (MAX_DIMENSION / width));
      width = MAX_DIMENSION;
    } else {
      width = Math.round(width * (MAX_DIMENSION / height));
      height = MAX_DIMENSION;
    }
    console.log(`Scaling down image dimensions to ${width}x${height}`);
  }
  
  // Set canvas dimensions
  canvas.width = width;
  canvas.height = height;
  
  // Draw image on canvas
  ctx.drawImage(img, 0, 0, width, height);
  
  // Try to compress the image
  let compressedDataUrl = '';
  let currentQuality = quality;
  const minQuality = 0.3; // Don't compress below this quality
  
  // Try a few quality levels until we hit target size or minimum quality
  while (currentQuality >= minQuality) {
    // Convert to JPEG with quality setting
    compressedDataUrl = canvas.toDataURL('image/jpeg', currentQuality);
    
    // Calculate new size
    const newSizeMB = compressedDataUrl.length / (1024 * 1024);
    console.log(`Compressed to ${newSizeMB.toFixed(2)}MB (quality: ${currentQuality.toFixed(2)})`);
    
    // If we're under target size, we're done
    if (newSizeMB <= targetSizeMB) {
      console.log(`Compression successful. Final size: ${newSizeMB.toFixed(2)}MB`);
      return compressedDataUrl;
    }
    
    // Reduce quality for next attempt
    currentQuality -= 0.1;
  }
  
  // If we couldn't get it under target size, return the most compressed version
  console.log(`Could not compress image to target size. Final size: ${(compressedDataUrl.length / (1024 * 1024)).toFixed(2)}MB`);
  return compressedDataUrl || dataUrl;
};
