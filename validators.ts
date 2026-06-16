export const validateTopic = (topic: string): { valid: boolean; error?: string } => {
  if (!topic || topic.trim() === '') {
    return { valid: false, error: 'Topic cannot be empty.' };
  }
  if (topic.trim().length < 3) {
    return { valid: false, error: 'Topic must be at least 3 characters long.' };
  }
  if (topic.length > 500) {
    return { valid: false, error: 'Topic must be less than 500 characters.' };
  }
  return { valid: true };
};

export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email || email.trim() === '') {
    return { valid: false, error: 'Email cannot be empty.' };
  }
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) {
    return { valid: false, error: 'Invalid email address.' };
  }
  return { valid: true };
};
