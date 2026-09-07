export interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
}

export function validatePassword(password: string): PasswordValidation {
  return {
    minLength: password.length >= 6,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };
}

export function isPasswordValid(password: string): boolean {
  const v = validatePassword(password);
  return v.minLength && v.hasUppercase && v.hasLowercase && v.hasNumber && v.hasSymbol;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
}
