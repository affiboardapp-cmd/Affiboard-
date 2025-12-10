/**
 * Password Strength Validation
 * Requirements:
 * - Minimum 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character
 */

export interface PasswordStrength {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
  isValid: boolean;
  score: 0 | 1 | 2 | 3 | 4 | 5;
}

export function validatePassword(password: string): PasswordStrength {
  const checks = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[\W_]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length as 0 | 1 | 2 | 3 | 4 | 5;
  
  return {
    ...checks,
    isValid: Object.values(checks).every(Boolean),
    score,
  };
}

export function getPasswordStrengthText(strength: PasswordStrength): string {
  if (!strength.isValid) return "Fraca";
  if (strength.score === 5) return "Muito Forte";
  if (strength.score === 4) return "Forte";
  return "Média";
}

export function getPasswordStrengthColor(strength: PasswordStrength): string {
  if (!strength.isValid) return "text-red-500";
  if (strength.score === 5) return "text-green-500";
  if (strength.score === 4) return "text-emerald-500";
  return "text-yellow-500";
}

export function getPasswordRequirementsList(password: string): Array<{
  text: string;
  met: boolean;
}> {
  const strength = validatePassword(password);
  return [
    { text: "Mínimo 12 caracteres", met: strength.length },
    { text: "Uma letra MAIÚSCULA", met: strength.uppercase },
    { text: "Uma letra minúscula", met: strength.lowercase },
    { text: "Um número (0-9)", met: strength.number },
    { text: "Um caractere especial (!@#$%^&*)", met: strength.special },
  ];
}
