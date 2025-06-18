import { NextApiResponse } from 'next';
import { Pool } from 'pg';
import { canManageMatrix } from '../../../../lib/evaluation/auth';
import { validateMatrixInput } from '../../../../lib/evaluation/validation';
import { withAuth, AuthenticatedRequest } from '../../../../middleware/auth';
import { withErrorHandler } from '../../../../lib/errors';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});



async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { method } = req;

  const authenticatedSystemUserId = req.user!.id;

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

export default withErrorHandler(withAuth(handler));
