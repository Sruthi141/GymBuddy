/**
 * Client-side validation helpers
 */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
    if (password.length < 8) return { valid: false, message: 'At least 8 characters' };
    if (!/[A-Z]/.test(password)) return { valid: false, message: 'One uppercase letter' };
    if (!/[a-z]/.test(password)) return { valid: false, message: 'One lowercase letter' };
    if (!/\d/.test(password)) return { valid: false, message: 'One number' };
    if (!/[@$!%*?&]/.test(password)) return { valid: false, message: 'One special character (@$!%*?&)' };
    return { valid: true };
};

export const getPasswordStrength = (password: string): number => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;
    return Math.min(score, 5);
};

export const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateName = (name: string): { valid: boolean; message?: string } => {
    const trimmed = name?.trim() || '';
    if (trimmed.length < 2) return { valid: false, message: 'At least 2 characters' };
    if (trimmed.length > 50) return { valid: false, message: 'Max 50 characters' };
    return { valid: true };
};

export const PHOTO_ACCEPT = 'image/jpeg,image/jpg,image/png,image/webp';
export const PHOTO_MAX_SIZE = 2 * 1024 * 1024; // 2MB

export const validatePhoto = (file: File): { valid: boolean; message?: string } => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) return { valid: false, message: 'Use JPG, PNG or WebP' };
    if (file.size > PHOTO_MAX_SIZE) return { valid: false, message: 'Max 2MB' };
    return { valid: true };
};
