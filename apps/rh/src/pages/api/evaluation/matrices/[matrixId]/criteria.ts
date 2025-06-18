import { NextApiResponse } from 'next';
import { Pool } from 'pg';
import { withAuth, AuthenticatedRequest } from '../../../../../middleware/auth';
import { withErrorHandler } from '../../../../../lib/errors';

// TODO: Ideally, use a shared DB pool module
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Adjust based on your DB hosting requirements
});


async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { method } = req;
  const { matrixId: queryMatrixId } = req.query; // matrixId from the path

  if (!queryMatrixId || Array.isArray(queryMatrixId)) {
    return res.status(400).json({ message: 'Valid matrixId must be provided in the path.' });
  }
  const matrixId = queryMatrixId as string;
  const authenticatedSystemUserId = req.user!.id;

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

export default withErrorHandler(withAuth(handler));
