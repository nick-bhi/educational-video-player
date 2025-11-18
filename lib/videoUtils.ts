/**
 * Detect video URL type and convert to appropriate format
 */

export type VideoType = 'youtube' | 'vimeo' | 'direct' | 'local';

export interface VideoUrlInfo {
  type: VideoType;
  embedUrl?: string;
  originalUrl: string;
}

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/.*[?&]v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extract Vimeo video ID from Vimeo URL
 */
function extractVimeoId(url: string): string | null {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /vimeo\.com\/.*\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Check if URL is a local file (starts with /videos/ or /video)
 */
function isLocalFile(url: string): boolean {
  return url.startsWith('/videos/') || url.startsWith('/video');
}

/**
 * Analyze video URL and return type and embed URL information
 */
export function analyzeVideoUrl(url: string): VideoUrlInfo {
  if (!url) {
    return { type: 'direct', originalUrl: url };
  }

  // Check for local files
  if (isLocalFile(url)) {
    return { type: 'local', originalUrl: url };
  }

  // Check for YouTube
  const youtubeId = extractYouTubeId(url);
  if (youtubeId) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
      originalUrl: url,
    };
  }

  // Check for Vimeo
  const vimeoId = extractVimeoId(url);
  if (vimeoId) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
      originalUrl: url,
    };
  }

  // Default to direct video file
  return { type: 'direct', originalUrl: url };
}

/**
 * Get thumbnail URL for video
 */
export function getVideoThumbnail(videoUrl: string): string | null {
  if (!videoUrl) return null;

  // Generate YouTube thumbnail
  const youtubeId = extractYouTubeId(videoUrl);
  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  }

  // Vimeo thumbnails require API call. Return null to use placeholder
  const vimeoId = extractVimeoId(videoUrl);
  if (vimeoId) {
    return null;
  }

  // Direct video files require loading video to generate thumbnail. Return null to use placeholder
  return null;
}

