import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest, getUserManager } from '../../../middleware/auth';
import { withErrorHandler, ValidationError, NotFoundError, AuthorizationError } from '../../../lib/errors';
import { executeQuery, executeTransaction } from '../../../../../../lib/db/pool';
import { z } from 'zod';


// Helper to get authenticated user ID (replace with your actual auth logic)
import * as jose from 'jose';
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

// Helper to get the selected Employee ID (e.g., from a custom header or session)
async function getSelectedEmployeeId(req: NextApiRequest, userId: string): Promise<string | null> {
  const selectedEmployeeId = (req.headers['x-selected-employee-id'] as string | undefined) || (req.body && req.body.actingAsEmployeeId as string);
  if (!selectedEmployeeId) {
    console.warn('X-Selected-Employee-ID header not found for self-evaluations API. This is critical.');
    return null;
  }
  try {
    const result = await executeQuery('SELECT 1 FROM employees WHERE employee_number = $1 AND user_id = $2', [selectedEmployeeId, userId]);
    if (result.length === 0) return null;
    return selectedEmployeeId;
  } catch (err) {
    console.error('Error validating selected employee', err);
    return null;
  }
}

// Validation schemas
const selfEvaluationSchema = z.object({
  matrixId: z.string().uuid(),
  evaluationPeriodMonth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// GET /api/evaluation/self-evaluations
async function getSelfEvaluations(req: AuthenticatedRequest, res: NextApiResponse) {
  const { user } = req;
  if (!user) throw new Error('User not authenticated');

  const { 
    employeeId, // For admin/RH to filter by specific employee
    status, 
    periodStart, 
    periodEnd, 
    matrixId 
  } = req.query;

  let query = `
    SELECT se.*, 
           em.title as matrix_title,
           CONCAT(u.first_name, ' ', u.last_name) as employee_name
    FROM self_evaluations se
    JOIN evaluation_matrices em ON se.matrix_id = em.id
    JOIN users u ON se.employee_id = u.id
  `;

  const conditions: string[] = [];
  const values: any[] = [];
  let valueCount = 1;

  // Authorization Logic
  if (employeeId) {
    // Admin/RH can view any employee's evaluations
    if (!user.roles.includes('admin')) {
      throw new AuthorizationError('Not authorized to view other employees\' self-evaluations');
    }
    conditions.push(`se.employee_id = $${valueCount++}`);
    values.push(employeeId);
  } else {
    // Regular users can only view their own evaluations
    conditions.push(`se.employee_id = $${valueCount++}`);
    values.push(user.id);
  }

  if (status) {
    conditions.push(`se.status = $${valueCount++}`);
    values.push(status);
  }
  if (matrixId) {
    conditions.push(`se.matrix_id = $${valueCount++}`);
    values.push(matrixId);
  }
  if (periodStart) {
    conditions.push(`se.evaluation_period_month >= $${valueCount++}`);
    values.push(periodStart);
  }
  if (periodEnd) {
    conditions.push(`se.evaluation_period_month <= $${valueCount++}`);
    values.push(periodEnd);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY se.evaluation_period_month DESC';

  const evaluations = await executeQuery(query, values);
  res.status(200).json(evaluations);
}

// POST /api/evaluation/self-evaluations
async function createSelfEvaluation(req: AuthenticatedRequest, res: NextApiResponse) {
  const { user } = req;
  if (!user) throw new Error('User not authenticated');

  // Validate input
  const result = selfEvaluationSchema.safeParse(req.body);
  if (!result.success) {
    throw new ValidationError('Invalid self-evaluation data', result.error);
  }

  const { matrixId, evaluationPeriodMonth } = result.data;

  // Verify matrix exists and is active
  const matrix = await executeQuery(
    'SELECT * FROM evaluation_matrices WHERE id = $1 AND status = \'active\'',
    [matrixId]
  );

  if (matrix.length === 0) {
    throw new NotFoundError('Active evaluation matrix');
  }

  // Get user's manager from Microsoft Graph
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    throw new ValidationError('Authorization token is required');
  }

  const manager = await getUserManager(token);
  if (!manager) {
    throw new ValidationError('Could not verify manager relationship');
  }

  // Check if self-evaluation already exists for this period and matrix
  const existingEvaluation = await executeQuery(
    'SELECT 1 FROM self_evaluations WHERE employee_id = $1 AND matrix_id = $2 AND evaluation_period_month = $3',
    [user.id, matrixId, evaluationPeriodMonth]
  );

  if (existingEvaluation.length > 0) {
    throw new ValidationError('A self-evaluation for this period and matrix already exists');
  }

  // Create self-evaluation
  const evaluation = await executeTransaction(async (client) => {
    const result = await client.query(
      `INSERT INTO self_evaluations 
       (matrix_id, employee_id, evaluation_period_month, status, created_by_user_id, updated_by_user_id, manager_id)
       VALUES ($1, $2, $3, 'draft', $4, $4, $5)
       RETURNING *`,
      [matrixId, user.id, evaluationPeriodMonth, user.id, manager.id]
    );
    return result.rows[0];
  });

  res.status(201).json(evaluation);
}

// Export handlers with middleware
export default withErrorHandler(
  withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
    switch (req.method) {
      case 'GET':
        return getSelfEvaluations(req, res);
      case 'POST':
        return createSelfEvaluation(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  })
); 