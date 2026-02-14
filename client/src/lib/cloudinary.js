/**
 * Cloudinary unsigned upload for client-side photo/video uploads.
 * Free tier: 25 GB storage, 25 GB bandwidth/month.
 *
 * Setup: https://cloudinary.com → sign up → Dashboard: Cloud name + Settings → Upload → Add upload preset (Unsigned).
 * Add to .env: VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name, VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const UPLOAD_URL = (resourceType) =>
  `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

/**
 * Upload a blob to Cloudinary (image or video).
 * @param {Blob} blob - File blob (image or video)
 * @param {'image' | 'video'} resourceType - 'image' or 'video'
 * @param {string} [folder] - Optional folder (e.g. 'identity-verification')
 * @returns {Promise<string>} - Secure URL of the uploaded file
 */
export async function uploadToCloudinary(blob, resourceType = 'image', folder = 'identity-verification') {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Missing VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET in .env');
  }

  const formData = new FormData();
  formData.append('file', blob);
  formData.append('upload_preset', UPLOAD_PRESET);
  if (folder) formData.append('folder', folder);

  const res = await fetch(UPLOAD_URL(resourceType), {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Cloudinary upload failed: ${res.status}`);
  }

  const data = await res.json();
  return data.secure_url;
}
