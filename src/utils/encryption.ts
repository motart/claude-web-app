import crypto from 'crypto';
import bcrypt from 'bcrypt';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For GCM, this is always 16
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;
const ITERATIONS = 100000; // PBKDF2 iterations

/**
 * Generates a cryptographically secure random key
 */
export function generateSecureKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Derives a key from password using PBKDF2
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, 32, 'sha512');
}

/**
 * Encrypts data using AES-256-GCM
 * Returns base64 encoded string containing: salt + iv + tag + encrypted_data
 */
export function encryptData(data: string, password?: string): string {
  const encryptionKey = password || process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('Encryption key not provided');
  }

  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(encryptionKey, salt);
  
  const cipher = crypto.createCipher('aes-256-cbc', encryptionKey);
  
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  return encrypted;
}

/**
 * Decrypts data encrypted with encryptData
 */
export function decryptData(encryptedData: string, password?: string): string {
  const encryptionKey = password || process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('Encryption key not provided');
  }

  const decipher = crypto.createDecipher('aes-256-cbc', encryptionKey);
  
  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Encrypts sensitive configuration values
 */
export function encryptConfig(config: Record<string, any>): Record<string, any> {
  const sensitiveKeys = [
    'password', 'secret', 'key', 'token', 'apiKey', 'accessKey', 
    'secretKey', 'clientSecret', 'privateKey', 'connectionString'
  ];
  
  const encrypted = { ...config };
  
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string' && sensitiveKeys.some(sensitive => 
      key.toLowerCase().includes(sensitive.toLowerCase())
    )) {
      encrypted[key] = encryptData(value);
    }
  }
  
  return encrypted;
}

/**
 * Decrypts sensitive configuration values
 */
export function decryptConfig(config: Record<string, any>): Record<string, any> {
  const sensitiveKeys = [
    'password', 'secret', 'key', 'token', 'apiKey', 'accessKey', 
    'secretKey', 'clientSecret', 'privateKey', 'connectionString'
  ];
  
  const decrypted = { ...config };
  
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string' && sensitiveKeys.some(sensitive => 
      key.toLowerCase().includes(sensitive.toLowerCase())
    )) {
      try {
        decrypted[key] = decryptData(value);
      } catch (error) {
        // If decryption fails, assume it's not encrypted
        decrypted[key] = value;
      }
    }
  }
  
  return decrypted;
}

/**
 * Hashes passwords using bcrypt with salt
 */
export async function hashPassword(password: string, saltRounds: number = 12): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verifies password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generates secure random tokens for sessions, API keys, etc.
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generates secure random passwords
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}

/**
 * Encrypts database connection strings
 */
export function encryptConnectionString(connectionString: string): string {
  return encryptData(connectionString);
}

/**
 * Decrypts database connection strings
 */
export function decryptConnectionString(encryptedConnectionString: string): string {
  return decryptData(encryptedConnectionString);
}

/**
 * Securely hash API keys for storage
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push('Password must be at least 8 characters long');
  
  if (password.length >= 12) score += 1;
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Password must contain lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Password must contain uppercase letters');
  
  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Password must contain numbers');
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('Password must contain special characters');
  
  // Common password check
  const commonPasswords = ['password', '123456', 'admin', 'user', 'test'];
  if (commonPasswords.includes(password.toLowerCase())) {
    score = 0;
    feedback.push('Password is too common');
  }
  
  return {
    isValid: score >= 4,
    score: Math.min(score, 6),
    feedback
  };
}

/**
 * Secure data masking for logs
 */
export function maskSensitiveData(data: any): any {
  if (typeof data === 'string') {
    // Mask email addresses
    data = data.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, 
      (match) => match.charAt(0) + '*'.repeat(Math.max(0, match.indexOf('@') - 1)) + match.substring(match.indexOf('@')));
    
    // Mask credit card numbers
    data = data.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, 
      (match: string) => match.substring(0, 4) + '*'.repeat(match.length - 8) + match.substring(match.length - 4));
    
    return data;
  }
  
  if (typeof data === 'object' && data !== null) {
    const masked = Array.isArray(data) ? [] : {};
    
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      
      // Mask sensitive fields
      if (['password', 'secret', 'token', 'key', 'ssn', 'creditcard', 'cvv'].some((sensitive: string) => 
        lowerKey.includes(sensitive))) {
        (masked as any)[key] = '*'.repeat(8);
      } else {
        (masked as any)[key] = maskSensitiveData(value);
      }
    }
    
    return masked;
  }
  
  return data;
}