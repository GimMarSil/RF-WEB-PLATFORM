import { NextApiRequest, NextApiResponse } from 'next';
import * as jose from 'jose';
import { pool, executeQuery } from '../../../../../../../../../lib/db/pool';
import { userHasAdminRightsToManageCriteria } from '../../../../../lib/authz';

// Validate bearer token using Azure AD and return the user ID
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

// Helper to get the Employee ID the user is currently acting as (selected on landing)
async function getSelectedEmployeeId(req: NextApiRequest, userId: string): Promise<string | null> {
    const fromHeader = req.headers['x-selected-employee-id'] as string | undefined;
    const selectedEmployeeId = fromHeader || (req.body && (req.body.actingAsEmployeeId as string));
    if (!selectedEmployeeId) {
        console.warn('MATRIX_CRITERIA_API: selectedEmployeeId not found in headers (X-Selected-Employee-ID) or body (actingAsEmployeeId).');
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
  const { matrixId: queryMatrixId } = req.query; // matrixId from the path

  if (!queryMatrixId || Array.isArray(queryMatrixId)) {
    return res.status(400).json({ message: 'Valid matrixId must be provided in the path.' });
  }
  const matrixId = queryMatrixId as string;

  let authenticatedSystemUserId: string | null = null;
  try {
    authenticatedSystemUserId = await getAuthenticatedSystemUserId(req);
    if (!authenticatedSystemUserId) {
      return res.status(401).json({ message: 'Unauthorized: System User ID not available.' });
    }
  } catch (authError) {
    console.error('MATRIX_CRITERIA_API: Authentication error:', authError);
    return res.status(500).json({ message: 'Authentication failed.' });
  }

  // For managing criteria, authorization should check if the user (via selectedEmployeeId or system user role) has RH/Admin rights.
  const selectedEmployeeId = await getSelectedEmployeeId(req, authenticatedSystemUserId);
  // Verify RH/Admin permissions
  const hasRights = await userHasAdminRightsToManageCriteria(
    selectedEmployeeId,
    authenticatedSystemUserId
  );
  if (!hasRights) {
    return res.status(403).json({
      message: 'Forbidden: User does not have rights to manage criteria for this matrix.'
    });
  }

  const client = await pool.connect();
  try {
    await client.query(`SET LOCAL app.current_user_id = $1`, [authenticatedSystemUserId]);

    if (method === 'POST') {
      // --- POST /api/evaluation/matrices/[matrixId]/criteria ---
      try {
        const {
          name,
          description,
          weight,
          is_competency_gap_critical = false,
          min_score_possible = 0.0, 
          max_score_possible = 10.0, 
        } = req.body;

        if (!name || typeof weight === 'undefined') {
          return res.status(400).json({ message: 'Missing required fields: name, weight.' });
        }
        if (typeof weight !== 'number' || weight <= 0 || weight > 100) {
            return res.status(400).json({ message: 'Invalid weight: must be a number between 0 (exclusive) and 100 (inclusive).' });
        }

        await client.query('BEGIN');
        const result = await client.query(
          `INSERT INTO evaluation_criteria 
           (matrix_id, name, description, weight, is_competency_gap_critical, min_score_possible, max_score_possible, 
            created_by_user_id, -- System user who created it
            updated_by_user_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
           RETURNING *`,
          [matrixId, name, description, weight, is_competency_gap_critical, min_score_possible, max_score_possible, authenticatedSystemUserId]
        );
        await client.query('COMMIT');
        return res.status(201).json(result.rows[0]);

      } catch (dbError) {
        await client.query('ROLLBACK');
        console.error(`MATRIX_CRITERIA_API: Error creating criterion for matrix ${matrixId}:`, dbError);
        if (dbError.code === '23505') { 
            return res.status(409).json({ message: `A criterion with the name '${req.body.name}' already exists for this matrix.`, code: dbError.code });
        } else if (dbError.message && dbError.message.includes('Criteria weights for matrix_id')) { 
            return res.status(400).json({ message: dbError.message, code: 'CRITERIA_WEIGHT_SUM_INVALID' });
        }
        return res.status(500).json({ message: `Error creating criterion for matrix ${matrixId}`, error: dbError.message });
      }
    } else if (method === 'GET') {
      // --- GET /api/evaluation/matrices/[matrixId]/criteria ---
      // Authorization: Typically allowed for any authenticated user with a selected profile to view matrix structure.
      try {
        const criteriaResult = await client.query('SELECT * FROM evaluation_criteria WHERE matrix_id = $1 ORDER BY name', [matrixId]);
        return res.status(200).json(criteriaResult.rows);
      } catch (dbError) {
        console.error(`MATRIX_CRITERIA_API: Error fetching criteria for matrix ${matrixId}:`, dbError);
        return res.status(500).json({ message: `Error fetching criteria for matrix ${matrixId}`, error: dbError.message });
      }
    }else {
      res.setHeader('Allow', ['POST', 'GET']);
      return res.status(405).end(`Method ${method} Not Allowed for this route.`);
    }
  } catch (error) {
    console.error('MATRIX_CRITERIA_API: General API handler error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ message: 'An unexpected error occurred in criteria API.', error: error.message });
    }
  } finally {
    if (client) client.release();
  }
} 