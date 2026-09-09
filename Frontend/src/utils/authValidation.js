import { validateImageFile } from './fileValidation.js';

export const validateLogin = ({ email, password }) => {
  if (!email?.trim() || email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return 'Enter a valid email address, such as name@example.com.';
  }
  if (!password) return 'Enter your password to log in.';
  if (password.length > 128) return 'Your password must be 128 characters or fewer.';
  return '';
};

export const validateRegistration = (form) => {
  if (!form.name.trim() || form.name.trim().length > 120) return 'Enter your name (1 to 120 characters).';
  const loginError = validateLogin(form);
  if (loginError) return loginError;
  if (form.password.length < 8) return 'Your password must contain 8 to 128 characters.';
  if (!form.university.trim() || form.university.trim().length > 160) return 'Enter your university (1 to 160 characters).';
  if (!form.nim.trim() || form.nim.trim().length > 50) return 'Enter your NIM (1 to 50 characters).';
  if (!form.ktm) return 'Upload your KTM (student ID) as a JPG, JPEG, or PNG image up to 5 MB.';
  return validateImageFile(form.ktm);
};
