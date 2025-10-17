// Access control configuration
const ALLOWED_EMAILS = [
  'ammonlarson@gmail.com',
];

export function isAuthorizedUser(user: any): boolean {
  if (!user?.email) {
    return false;
  }
  
  return ALLOWED_EMAILS.includes(user.email.toLowerCase());
}

export function getUnauthorizedMessage(user: any): string {
  return `Access denied. This application is restricted to the authorized users only. Contact your administrator if you believe this is an error.`;
}