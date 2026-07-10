const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export const validateImageFile = (file) => {
  if (!file) return "";

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Only JPG, JPEG, and PNG files are allowed.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "Uploaded file must be 5MB or smaller.";
  }

  return "";
};
