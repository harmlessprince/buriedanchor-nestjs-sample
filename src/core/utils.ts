import * as bcrypt from 'bcrypt';
import { ObjectId } from 'mongoose';

export interface TokenPayload {
  email: string;
  userId: ObjectId;
}

export interface BrowserObject {
  [key: string]: boolean | string;
}

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(
  enteredPassword: string,
  dbPassword: string,
) {
  return await bcrypt.compare(enteredPassword, dbPassword);
}

export const success = (
  data: any = null,
  message: string = 'Action successful',
) => {
  return {
    success: true,
    message,
    data: data,
    statusCode: 200,
  };
};


export function getRandomLetter(letters: string) {
  return letters.charAt(Math.floor(Math.random() * letters.length));
}

export function getRandomNumber(numbers: string) {
  return numbers.charAt(Math.floor(Math.random() * numbers.length));
}

export function shuffleString(str) {
  const chars = str.split('');
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

export function generateSlug(length: number = 6): string {
  if (length < 6) {
    throw new Error('Length must be at least 6');
  }

  const letters: string =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const numbers: string = '0123456789';

  let result = '';

  let isLetter = true; // Start with a letter

  for (let i = 0; i < length; i++) {
    if (isLetter) {
      const letter = getRandomLetter(letters);
      // Alternate between uppercase and lowercase
      result += i % 2 === 0 ? letter.toUpperCase() : letter.toLowerCase();
    } else {
      result += getRandomNumber(numbers);
    }
    isLetter = !isLetter; // Alternate between letter and number
  }
  return result;
}

export function isValidHttpUrl(url: string) {
  try {
    const newUrl: URL = new URL(url);
    return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
  } catch (err) {
    return false;
  }
}


export function slugify(slug: string) {
  return slug
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function retrieveReferrer(referrer: string): string | null {
  if (referrer == '') {
    return 'unknown';
  }
  referrer = referrer.toLocaleLowerCase();
  if (referrer.includes('facebook')) {
    return 'facebook';
  } else if (referrer.includes('youtube')) {
    return 'youtube';
  } else if (referrer.includes('instagram')) {
    return 'instagram';
  } else if (referrer.includes('tiktok')) {
    return 'tiktok';
  } else if (referrer.includes('snapchat')) {
    return 'snapchat';
  } else if (referrer.includes('twitter')) {
    return 'twitter';
  } else if (referrer.includes('whatsapp')) {
    return 'whatsapp';
  } else if (referrer.includes('telegram')) {
    return 'telegram';
  } else {
    return referrer;
  }
}

export function getTrueBrowser(browserObject: BrowserObject): string | null {
  const majorBrowsers = [
    'chrome',
    'firefox',
    'ie',
    'mobile_safari',
    'mozilla',
    'opera',
    'safari',
    'edge',
    'chromium',
    'brave',
    'vivaldi',
  ];

  for (const browser of majorBrowsers) {
    if (browserObject[browser] === true) {
      return browser;
    }
  }
  return 'Unknown'; // Return null if no major browser is true
}
