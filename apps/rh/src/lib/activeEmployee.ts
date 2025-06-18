import { NextApiRequest } from 'next';

/**
 * Retrieves the active employee number from request headers or cookies.
 * Header `x-selected-employee-id` takes precedence over the cookie value.
 * Returns `null` when no identifier is found.
 */
export function getActiveEmployeeNumber(req: NextApiRequest): string | null {
  const headerValue = req.headers['x-selected-employee-id'];
  const fromHeader = Array.isArray(headerValue) ? headerValue[0] : headerValue;

  if (typeof fromHeader === 'string' && fromHeader.trim()) {
    return fromHeader;
  }

  const cookieValue = (req as any).cookies?.employeeNumber;
  if (typeof cookieValue === 'string' && cookieValue.trim()) {
    return cookieValue;
  }

  console.warn('Active employee number not found in headers or cookies');
  return null;
}
