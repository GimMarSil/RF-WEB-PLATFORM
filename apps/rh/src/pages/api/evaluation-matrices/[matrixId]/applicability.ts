import { NextApiRequest, NextApiResponse } from 'next';
import * as jose from 'jose';

import pool from '../../../../lib/dbPool';



// Validate bearer token and extract system user id
async function getAuthenticatedSystemUserId(req: NextApiRequest): Promise<string | null> {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.split(' ')[1];
  const tenant = process.env.AZURE_AD_TENANT_ID;
  const audience = process.env.AZURE_AD_API_AUDIENCE || process.env.AZURE_AD_CLIENT_ID;
  if (!tenant || !audience) return null;
  try {
    const JWKS = jose.createRemoteJWKSet(new URL(`https://login.microsoftonline.com/${tenant}/discovery/v2.0/keys`));
    const { payload } = await jose.jwtVerify(token, JWKS, { issuer: `https://login.microsoftonline.com/${tenant}/v2.0`, audience });
    const id = payload.oid || payload.sub;
    return typeof id === 'string' ? id : null;
  } catch (err) {
    console.error('Token validation failed', err);
    return null;
  }
}

async function getSelectedEmployeeId(req: NextApiRequest, userId: string): Promise<string | null> {
  const headerValue = req.headers['x-selected-employee-id'] as string | undefined;
  const selectedEmployeeId = headerValue || (req.body && (req.body.actingAsEmployeeId as string));
  if (!selectedEmployeeId) {
    console.warn('X-Selected-Employee-ID header not found for matrix applicability API.');
    return null;
  }
  try {
    const result = await pool.query('SELECT user_id FROM employees WHERE employee_number = $1', [selectedEmployeeId]);
    if (result.rows.length === 0 || result.rows[0].user_id !== userId) return null;
    return selectedEmployeeId;
  } catch (err) {
    console.error('Error validating selected employee', err);
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { matrixId } = req.query;

  if (!matrixId || Array.isArray(matrixId)) {
    return res.status(400).json({ message: 'Valid matrixId must be provided in the path.' });
  }

  let authenticatedSystemUserId: string | null = null;
  let selectedEmployeeId: string | null = null;

  try {
    authenticatedSystemUserId = await getAuthenticatedSystemUserId(req);
    if (!authenticatedSystemUserId) {
      return res.status(401).json({ message: 'Unauthorized: Authenticated system user ID not available.' });
    }

    selectedEmployeeId = await getSelectedEmployeeId(req, authenticatedSystemUserId);
    if (!selectedEmployeeId && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
      return res.status(403).json({ message: 'Forbidden: Selected Employee ID required for this operation.' });
    }
  } catch (authError) {
    console.error('Authentication error in matrix applicability API:', authError);
    return res.status(500).json({ message: 'Authentication failed.' });
  }

  const client = await pool.connect();
  try {
    await client.query(`SET LOCAL app.current_user_id = $1`, [authenticatedSystemUserId]);

    if (method === 'GET') {
      // Get applicability for a matrix
      try {
        const result = await client.query(
          `SELECT a.*, 
           e.first_name, e.last_name, e.email,
           d.name as department_name,
           p.name as position_name
           FROM evaluation_matrix_applicability a
           JOIN employees e ON a.employee_id = e.id
           LEFT JOIN departments d ON e.department_id = d.id
           LEFT JOIN positions p ON e.position_id = p.id
           WHERE a.matrix_id = $1
           ORDER BY e.last_name, e.first_name`,
          [matrixId]
        );

        return res.status(200).json(result.rows);
      } catch (dbError) {
        console.error(`Error fetching applicability for matrix ${matrixId}:`, dbError);
        return res.status(500).json({ message: `Error fetching applicability`, error: dbError.message });
      }
    } else if (method === 'POST') {
      // Add applicability for multiple employees
      try {
        const { employee_ids, valid_from, valid_to } = req.body;

        if (!employee_ids || !Array.isArray(employee_ids) || !valid_from || !valid_to) {
          return res.status(400).json({ message: 'Missing required fields: employee_ids, valid_from, valid_to.' });
        }

        await client.query('BEGIN');

        // Check if matrix exists and is active
        const matrixCheck = await client.query(
          'SELECT id FROM evaluation_matrices WHERE id = $1 AND status = $2',
          [matrixId, 'active']
        );

        if (matrixCheck.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ message: 'Matrix not found or not active.' });
        }

        // Insert applicability for each employee
        for (const employeeId of employee_ids) {
          await client.query(
            `INSERT INTO evaluation_matrix_applicability 
             (matrix_id, employee_id, valid_from, valid_to, status, created_by_user_id, updated_by_user_id)
             VALUES ($1, $2, $3, $4, 'active', $5, $5)
             ON CONFLICT (matrix_id, employee_id) 
             DO UPDATE SET 
               valid_from = EXCLUDED.valid_from,
               valid_to = EXCLUDED.valid_to,
               status = 'active',
               updated_by_user_id = EXCLUDED.updated_by_user_id,
               updated_at = NOW()`,
            [matrixId, employeeId, valid_from, valid_to, authenticatedSystemUserId]
          );
        }

        await client.query('COMMIT');

        // Fetch updated applicability
        const updatedApplicability = await client.query(
          `SELECT a.*, 
           e.first_name, e.last_name, e.email,
           d.name as department_name,
           p.name as position_name
           FROM evaluation_matrix_applicability a
           JOIN employees e ON a.employee_id = e.id
           LEFT JOIN departments d ON e.department_id = d.id
           LEFT JOIN positions p ON e.position_id = p.id
           WHERE a.matrix_id = $1
           ORDER BY e.last_name, e.first_name`,
          [matrixId]
        );

        return res.status(200).json(updatedApplicability.rows);
      } catch (dbError) {
        await client.query('ROLLBACK');
        console.error(`Error adding applicability for matrix ${matrixId}:`, dbError);
        return res.status(500).json({ message: `Error adding applicability`, error: dbError.message });
      }
    } else if (method === 'DELETE') {
      // Remove applicability for specific employees
      try {
        const { employee_ids } = req.body;

        if (!employee_ids || !Array.isArray(employee_ids)) {
          return res.status(400).json({ message: 'Missing required field: employee_ids.' });
        }

        await client.query('BEGIN');

        // Update applicability status to inactive
        const result = await client.query(
          `UPDATE evaluation_matrix_applicability 
           SET status = 'inactive', 
               updated_by_user_id = $1, 
               updated_at = NOW()
           WHERE matrix_id = $2 
           AND employee_id = ANY($3)
           RETURNING *`,
          [authenticatedSystemUserId, matrixId, employee_ids]
        );

        await client.query('COMMIT');

        return res.status(200).json({ 
          message: 'Applicability removed successfully.',
          affected_rows: result.rowCount
        });
      } catch (dbError) {
        await client.query('ROLLBACK');
        console.error(`Error removing applicability for matrix ${matrixId}:`, dbError);
        return res.status(500).json({ message: `Error removing applicability`, error: dbError.message });
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed for this route.`);
    }
  } catch (error) {
    console.error('General API handler error in matrix applicability API:', error);
    return res.status(500).json({ message: 'An unexpected error occurred in matrix applicability API.', error: error.message });
  } finally {
    if (client) client.release();
  }
} 