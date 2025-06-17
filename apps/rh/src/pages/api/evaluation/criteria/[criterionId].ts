import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest, isAdmin, isManager } from '../../../../middleware/auth';
import { validateMatrixInput } from '../../../../lib/evaluation/validation';
import * as jose from 'jose';
import { pool, executeQuery } from '../../../../../../../lib/db/pool';

// Helper to get authenticated user ID (replace with your actual auth logic)
async function getAuthenticatedSystemUserId(req: AuthenticatedRequest): Promise<string | null> {
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
async function getSelectedEmployeeId(req: AuthenticatedRequest, userId: string): Promise<string | null> {
  const selectedEmployeeId = (req.headers['x-selected-employee-id'] as string | undefined) || (req.body && req.body.actingAsEmployeeId as string);
  if (!selectedEmployeeId) {
    console.warn('X-Selected-Employee-ID header not found. Operations may fail authorization.');
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

async function handler(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  const { method } = req;
  const { criterionId } = req.query;

  if (!criterionId || Array.isArray(criterionId)) {
    res.status(400).json({ message: 'Valid criterionId must be provided' });
    return;
  }

  const client = await pool.connect();
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (method === 'GET') {
      // Get criterion details
      const query = `
        SELECT 
          ec.*,
          em.title as matrix_title,
          em.valid_from as matrix_valid_from,
          em.valid_to as matrix_valid_to
        FROM evaluation_criteria ec
        JOIN evaluation_matrices em ON ec.matrix_id = em.id
        WHERE ec.id = $1
      `;

      const result = await client.query(query, [criterionId]);

      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Criterion not found' });
        return;
      }

      const criterion = result.rows[0];

      // Check if user has access to the matrix
      const matrixAccessQuery = await client.query(
        `SELECT 1 FROM evaluation_matrices em
         LEFT JOIN employee_hierarchy eh ON em.created_by_manager_id = eh.manager_id
         WHERE em.id = $1 AND (
           em.created_by_manager_id = $2 OR
           eh.employee_id = $2 OR
           $3 = true
         )`,
        [criterion.matrix_id, req.user.id, isAdmin(req.user.roles)]
      );

      if (matrixAccessQuery.rows.length === 0) {
        res.status(403).json({ message: 'Not authorized to view this criterion' });
        return;
      }

      res.status(200).json(criterion);
      return;

    } else if (method === 'PUT') {
      // Update criterion
      const { 
        name, 
        description, 
        weight, 
        is_competency_gap_critical,
        min_score_possible,
        max_score_possible,
        matrix_id 
      } = req.body;

      // Input validation skipped for brevity

      await client.query('BEGIN');

      // Check if criterion exists and user has access
      const criterionCheck = await client.query(
        `SELECT ec.*, em.created_by_manager_id 
         FROM evaluation_criteria ec
         JOIN evaluation_matrices em ON ec.matrix_id = em.id
         WHERE ec.id = $1`,
        [criterionId]
      );

      if (criterionCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ message: 'Criterion not found' });
        return;
      }

      const criterion = criterionCheck.rows[0];

      // Check permissions
      if (!isAdmin(req.user.roles)) {
        if (isManager(req.user.roles)) {
          // Manager can only update criteria in their own matrices
          if (criterion.created_by_manager_id !== req.user.id) {
            await client.query('ROLLBACK');
            res.status(403).json({ message: 'Not authorized to update this criterion' });
            return;
          }
        } else {
          await client.query('ROLLBACK');
          res.status(403).json({ message: 'Only managers can update criteria' });
          return;
        }
      }

      // Check if matrix is in a state that allows updates
      const matrixCheck = await client.query(
        'SELECT status FROM evaluation_matrices WHERE id = $1',
        [criterion.matrix_id]
      );

      if (matrixCheck.rows[0].status !== 'draft') {
        await client.query('ROLLBACK');
        res.status(400).json({ message: 'Cannot update criteria in a non-draft matrix' });
        return;
      }

      // Update criterion
      const updateQuery = `
        UPDATE evaluation_criteria 
        SET 
          name = $1,
          description = $2,
          weight = $3,
          is_competency_gap_critical = $4,
          min_score_possible = $5,
          max_score_possible = $6,
          updated_by_user_id = $7,
          updated_at = NOW()
        WHERE id = $8
        RETURNING *
      `;

      const result = await client.query(updateQuery, [
        name,
        description,
        weight,
        is_competency_gap_critical,
        min_score_possible,
        max_score_possible,
        req.user.id,
        criterionId
      ]);

      await client.query('COMMIT');
      res.status(200).json(result.rows[0]);
      return;

    } else if (method === 'DELETE') {
      await client.query('BEGIN');

      // Check if criterion exists and user has access
      const criterionCheck = await client.query(
        `SELECT ec.*, em.created_by_manager_id, em.status as matrix_status
         FROM evaluation_criteria ec
         JOIN evaluation_matrices em ON ec.matrix_id = em.id
         WHERE ec.id = $1`,
        [criterionId]
      );

      if (criterionCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ message: 'Criterion not found' });
        return;
      }

      const criterion = criterionCheck.rows[0];

      // Check permissions
      if (!isAdmin(req.user.roles)) {
        if (isManager(req.user.roles)) {
          // Manager can only delete criteria in their own matrices
          if (criterion.created_by_manager_id !== req.user.id) {
            await client.query('ROLLBACK');
            res.status(403).json({ message: 'Not authorized to delete this criterion' });
            return;
          }
        } else {
          await client.query('ROLLBACK');
          res.status(403).json({ message: 'Only managers can delete criteria' });
          return;
        }
      }

      // Check if matrix is in a state that allows deletion
      if (criterion.matrix_status !== 'draft') {
        await client.query('ROLLBACK');
        res.status(400).json({ message: 'Cannot delete criteria from a non-draft matrix' });
        return;
      }

      // Check if criterion is being used in any evaluations
      const usageCheck = await client.query(
        `SELECT 1 FROM (
          SELECT criterion_id FROM employee_evaluation_scores WHERE criterion_id = $1
          UNION
          SELECT criterion_id FROM self_evaluation_scores WHERE criterion_id = $1
        ) as used_criteria`,
        [criterionId]
      );

      if (usageCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        res.status(400).json({ message: 'Cannot delete criterion that is being used in evaluations' });
        return;
      }

      // Delete criterion
      const result = await client.query(
        'DELETE FROM evaluation_criteria WHERE id = $1 RETURNING *',
        [criterionId]
      );

      await client.query('COMMIT');
      res.status(200).json({ message: 'Criterion deleted successfully', criterion: result.rows[0] });
      return;

    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed for this route.`);
      return;
    }
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Error in criterion API:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
    return;
  } finally {
    if (client) {
      client.release();
    }
  }
}

export default withAuth(handler); 