export const isValidObjectId = (value) => {
    const candidate = typeof value === 'string' ? value : value?.toString();
    return Boolean(candidate && /^[a-f\d]{24}$/i.test(candidate));
};

export const normalizeString = (value, { max = 200, required = false } = {}) => {
    if (typeof value !== 'string') return required ? null : '';

    const normalized = value.trim();
    if (required && !normalized) return null;
    if (normalized.length > max) return null;

    return normalized;
};

export const normalizeEmail = (value) => {
    const email = normalizeString(value, { max: 254, required: true });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
    return email.toLowerCase();
};

export const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const isSafeUploadFilename = (value) =>
    typeof value === 'string' &&
    /^(?:\d{10,}-)?[a-f\d-]{16,}\.(?:jpg|jpeg|png)$/i.test(value);
