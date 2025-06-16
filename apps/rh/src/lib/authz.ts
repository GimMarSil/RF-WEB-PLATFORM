import { pool } from '../../../../lib/db/pool';

/**
 * Check if the authenticated user has HR or Admin rights to manage evaluation criteria.
 * This checks the user's roles directly and, if acting on behalf of an employee,
 * also checks the roles associated with that employee.
 */
export async function userHasAdminRightsToManageCriteria(
  selectedEmployeeId: string | null,
  systemUserId: string
): Promise<boolean> {
  const client = await pool.connect();
  try {
    // First check the roles of the logged in user
    const userRole = await client.query(
      `SELECT 1 FROM user_roles WHERE user_id = $1 AND role IN ('admin', 'hr') LIMIT 1`,
      [systemUserId]
    );
    if (userRole.rows.length > 0) return true;

    // If an acting employee is specified, check that employee's roles
    if (selectedEmployeeId) {
      const employeeRole = await client.query(
        `SELECT 1
         FROM employees e
         JOIN user_roles ur ON e.user_id = ur.user_id
         WHERE e.employee_number = $1
         AND ur.role IN ('admin', 'hr')
         LIMIT 1`,
        [selectedEmployeeId]
      );
      if (employeeRole.rows.length > 0) return true;
    }

    return false;
  } catch (error) {
    console.error('Error verifying admin rights for criteria management:', error);
    return false;
  } finally {
    client.release();
  }
}
