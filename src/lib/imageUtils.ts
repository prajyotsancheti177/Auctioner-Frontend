import placeholderImg from "@/assets/player-placeholder.jpg";

/**
 * Converts common Google Drive share URLs to thumbnail format
 * @param url - The Google Drive URL to convert
 * @returns Thumbnail URL or placeholder image
 */
export const getDriveThumbnail = (url?: string): string => {
  if (!url) return placeholderImg;
  
  try {
    // Match file ID from /d/ format
    const driveFileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (driveFileIdMatch && driveFileIdMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${driveFileIdMatch[1]}`;
    }
    
    // Match file ID from ?id= format
    const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${idParamMatch[1]}`;
    }
    
    // If it's already a direct image or thumbnail URL, return as-is
    return url;
  } catch (e) {
    return placeholderImg;
  }
};
