
/**
 * Helper utility for handling video URLs in seed files
 */
import { getImageBaseUrl } from './imageUtils';

/**
 * Constructs a complete video URL from a video filename
 * @param videoName The video filename (e.g., 'example.mp4')
 * @returns The complete URL to the video
 */
export const getVideoUrl = (videoName: string): string => {
  // Use the same base URL logic as images but with videos path
  const baseUrl = getImageBaseUrl();
  const videosPath = process.env.VIDEOS_PATH || '/utils/videos/';
  
  return `${baseUrl}${videosPath}${videoName}`;
};
