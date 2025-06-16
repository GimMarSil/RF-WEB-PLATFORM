import { NextApiRequest, NextApiResponse } from 'next';
import { pool, executeQuery } from '../../../../../../../../lib/db/pool';
import { canManageMatrix } from '../../../../lib/evaluation/auth';
import { validateMatrixInput } from '../../../../lib/evaluation/validation';


import * as jose from 'jose';

// Helper to validate the bearer token and return the user ID (oid or sub)
async function getAuthenticatedSystemUserId(req: NextApiRequest): Promise<string | null> {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return null;
  }
  const token = auth.split(' ')[1];
  const tenant = process.env.AZURE_AD_TENANT_ID;
  const audience = process.env.AZURE_AD_API_AUDIENCE || process.env.AZURE_AD_CLIENT_ID;
  if (!tenant || !audience) return null;
  try {
    const JWKS = jose.createRemoteJWKSet(new URL(`https://login.microsoftonline.com/${tenant}/discovery/v2.0/keys`));
    const { payload } = await jose.jwtVerify(token, JWKS, {
      issuer: `https://login.microsoftonline.com/${tenant}/v2.0`,
      audience,
    });
    const id = payload.oid || payload.sub;
    return typeof id === 'string' ? id : null;
  } catch (err) {
    console.error('Token validation failed', err);
    return null;
  }
}

// Helper to get the selected Employee ID
async function getSelectedEmployeeId(req: NextApiRequest, userId: string): Promise<string | null> {
  const headerValue = req.headers['x-selected-employee-id'] as string | undefined;
  const selectedEmployeeId = headerValue || (req.body && (req.body.actingAsEmployeeId as string));
  if (!selectedEmployeeId) {
    console.warn('X-Selected-Employee-ID header not found for matrices API.');
    return null;
  }
  try {
    const result = await executeQuery('SELECT 1 FROM employees WHERE employee_number = $1 AND user_id = $2', [selectedEmployeeId, userId]);
    return result.length > 0 ? selectedEmployeeId : null;
  } catch (err) {
    console.error('Error validating selected employee', err);
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  let authenticatedSystemUserId: string | null = null;
  let selectedEmployeeId: string | null = null;

  try {
    authenticatedSystemUserId = await getAuthenticatedSystemUserId(req);
    if (!authenticatedSystemUserId) {
      return res.status(401).json({ message: 'Unauthorized: Authenticated system user ID not available.' });
    }

    selectedEmployeeId = await getSelectedEmployeeId(req, authenticatedSystemUserId);
    if (!selectedEmployeeId) {
      return res.status(403).json({ message: 'Forbidden: Selected Employee ID required for matrix operations.' });
    }

  } catch (authError) {
    console.error('Authentication error in matrices API:', authError);
    return res.status(500).json({ message: 'Authentication failed.' });
  }

  const client = await pool.connect();
  try {
    await client.query(`SET LOCAL app.current_user_id = $1`, [authenticatedSystemUserId]);

    if (method === 'GET') {
      // --- GET /api/evaluation/matrices ---
      try {
        const { status, department_id, business_unit_id } = req.query;

        let query = `
          SELECT 
            em.*,
            e.name as created_by_name,
            e.department_id as created_by_department_id,
            e.business_unit_id as created_by_business_unit_id
          FROM evaluation_matrices em
          LEFT JOIN employees e ON em.created_by_user_id = e.id
          WHERE 1=1
        `;
        const values: any[] = [];
        let valueCount = 1;

        if (status) {
          query += ` AND em.status = $${valueCount++}`;
          values.push(status);
        }
        if (department_id) {
          query += ` AND e.department_id = $${valueCount++}`;
          values.push(department_id);
        }
        if (business_unit_id) {
          query += ` AND e.business_unit_id = $${valueCount++}`;
          values.push(business_unit_id);
        }

        query += ` ORDER BY em.created_at DESC`;

        const result = await client.query(query, values);
        return res.status(200).json(result.rows);

      } catch (dbError) {
        console.error('Error fetching matrices:', dbError);
        return res.status(500).json({ message: 'Error fetching matrices', error: dbError.message });
      }
    } else if (method === 'POST') {
      // --- POST /api/evaluation/matrices ---
      try {
        const validatedData = await validateMatrixInput(req.body);
        const { title, description, valid_from, valid_to, criteria } = validatedData;

        await client.query('BEGIN');

        // Insert the matrix
        const matrixResult = await client.query(
          `INSERT INTO evaluation_matrices 
           (title, description, valid_from, valid_to, status, created_by_user_id, updated_by_user_id)
           VALUES ($1, $2, $3, $4, 'active', $5, $5)
           RETURNING *`,
          [title, description, valid_from, valid_to, authenticatedSystemUserId]
        );

        const matrix = matrixResult.rows[0];

        // Insert criteria
        const criteriaPromises = criteria.map(criterion =>
          client.query(
            `INSERT INTO evaluation_criteria 
             (matrix_id, name, description, weight, is_competency_gap_critical, 
              min_score_possible, max_score_possible, created_by_user_id, updated_by_user_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
             RETURNING *`,
            [
              matrix.id,
              criterion.name,
              criterion.description,
              criterion.weight,
              criterion.is_competency_gap_critical,
              criterion.min_score_possible,
              criterion.max_score_possible,
              authenticatedSystemUserId
            ]
          )
        );

        const criteriaResults = await Promise.all(criteriaPromises);
        matrix.criteria = criteriaResults.map(r => r.rows[0]);

        await client.query('COMMIT');
        return res.status(201).json(matrix);

      } catch (dbError) {
        await client.query('ROLLBACK');
        console.error('Error creating matrix:', dbError);
        if (dbError.code === '23505') { // Unique violation
          return res.status(409).json({ message: 'A matrix with this title already exists.', code: dbError.code });
        }
        return res.status(500).json({ message: 'Error creating matrix', error: dbError.message });
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed for this route.`);
    }
  } catch (error) {
    console.error('General API handler error in matrices API:', error);
    return res.status(500).json({ message: 'An unexpected error occurred in matrices API.', error: error.message });
  } finally {
    if (client) client.release();
  }
} 