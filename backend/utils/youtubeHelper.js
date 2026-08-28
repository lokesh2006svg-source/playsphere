/**
 * Extracts the YouTube Video ID from various YouTube URL formats.
 * @param {string} url - YouTube URL
 * @returns {string|null} - Extracted 11-character video ID or null if invalid
 */
export const extractVideoId = (url) => {
  if (!url || typeof url !== "string") return null;

  const cleanUrl = url.trim();

  // Regex covering standard watch, short youtu.be, embed, live streams, and mobile URLs
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/)([^#&?]*).*/;
  const match = cleanUrl.match(regExp);

  if (match && match[2] && match[2].length === 11) {
    return match[2];
  }

  // Also check if the string itself is just an 11-character ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }

  return null;
};

/**
 * Validates whether a given URL is a valid YouTube video or stream link.
 * @param {string} url - URL to validate
 * @returns {boolean}
 */
export const isValidYoutubeUrl = (url) => {
  return extractVideoId(url) !== null;
};

export const extractYouTubeVideoId = extractVideoId;

export default {
  extractVideoId,
  extractYouTubeVideoId,
  isValidYoutubeUrl,
};
