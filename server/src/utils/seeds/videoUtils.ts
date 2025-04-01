
/**
 * Helper utility for handling video URLs in seed files
 */
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

/**
 * Gets the base URL for video assets based on environment variables
 * @returns The base URL for videos
 */
export const getVideoBaseUrl = (): string => {
  // Get the API URL from environment variable
  const apiUrl = process.env.API_URL || '';
  
  // Extract the base URL (remove '/api' if present)
  const baseUrl = apiUrl.endsWith('/api') 
    ? apiUrl.substring(0, apiUrl.length - 4) 
    : apiUrl;
    
  return baseUrl;
};

/**
 * Constructs a complete video URL from a video filename
 * @param videoName The video filename (e.g., 'tutorial.mp4')
 * @returns The complete URL to the video
 */
export const getVideoUrl = (videoName: string): string => {
  // Use environment variables to construct the URL
  const baseUrl = getVideoBaseUrl();
  const videosPath = process.env.VIDEOS_PATH || '/utils/videos/';
  
  return `${baseUrl}${videosPath}${videoName}`;
};
