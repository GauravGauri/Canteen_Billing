/**
 * Validates email format.
 */
export const validateEmail = (email) => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Validates phone number format.
 * Allows optional leading '+', followed by 7 to 15 digits (spaces and hyphens allowed).
 */
export const validatePhone = (phone) => {
  if (!phone) return false;
  const stripped = phone.replace(/[\s\-]/g, '');
  const re = /^\+?[0-9]{7,15}$/;
  return re.test(stripped);
};

/**
 * Validates string minimum length.
 */
export const validateMinLength = (str, min) => {
  if (!str) return false;
  return str.trim().length >= min;
};

/**
 * Validates if value is a valid positive number (> 0).
 */
export const validatePositiveNumber = (num) => {
  const val = Number(num);
  return !isNaN(val) && val > 0;
};

/**
 * Validates if value is a valid non-negative number (>= 0).
 */
export const validateNonNegativeNumber = (num) => {
  const val = Number(num);
  return !isNaN(val) && val >= 0;
};
