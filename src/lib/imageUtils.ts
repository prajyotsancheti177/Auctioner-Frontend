import placeholderImg from "@/assets/player-placeholder.jpg";

/**
 * Converts common Google Drive share URLs to high-resolution image format
 * @param url - The Google Drive URL to convert
 * @param size - Optional size parameter (default 1000px for high quality)
 * @returns High-resolution image URL or placeholder image
 */
export const getDriveThumbnail = (url?: string, size: number = 1000): string => {
  if (!url) return placeholderImg;

  try {
    // Match file ID from /d/ format
    const driveFileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (driveFileIdMatch && driveFileIdMatch[1]) {
      // Use sz parameter for high resolution (sz=w1000 means width of 1000px)
      return `https://drive.google.com/thumbnail?id=${driveFileIdMatch[1]}&sz=w${size}`;
    }

    // Match file ID from ?id= format
    const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${idParamMatch[1]}&sz=w${size}`;
    }

    // If it's already a direct image or thumbnail URL, return as-is
    return url;
  } catch (e) {
    return placeholderImg;
  }
};
