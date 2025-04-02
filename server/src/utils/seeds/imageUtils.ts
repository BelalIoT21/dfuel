
/**
 * Helper utility for handling image URLs in seed files
 */
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

/**
 * Gets the base URL for image assets based on environment variables
 * @returns The base URL for images
 */
export const getImageBaseUrl = (): string => {
  // Get the API URL from environment variable or use default
  const apiUrl = process.env.API_URL || 'http://localhost:4000/api';
  
  // Extract the base URL (remove '/api' if present)
  const baseUrl = apiUrl.endsWith('/api') 
    ? apiUrl.substring(0, apiUrl.length - 4) 
    : apiUrl;
    
  return baseUrl;
};

/**
 * Constructs a complete image URL from an image filename
 * @param imageName The image filename (e.g., 'IMG_7814.jpg')
 * @returns The complete URL to the image
 */
export const getImageUrl = (imageName: string): string => {
  const baseUrl = getImageBaseUrl();
  return `${baseUrl}/utils/images/${imageName}`;
};
