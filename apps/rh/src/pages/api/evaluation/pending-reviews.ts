import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../../lib/db/pool';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed` });
  }

  const managerId = req.query.managerId as string;
  if (!managerId) {
    return res
      .status(400)
      .json({ message: 'managerId query parameter required' });
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT ee.id AS evaluation_id,
              ee.employee_id,
              e.name AS employee_name,
              em.title AS matrix_title
       FROM employee_evaluations ee
       JOIN employees e ON ee.employee_id = e.id
       JOIN evaluation_matrices em ON ee.matrix_id = em.id
       WHERE ee.evaluator_id = $1 AND ee.status = 'draft'
       ORDER BY ee.created_at DESC`,
      [managerId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching pending evaluations:', error);
    res.status(500).json({ message: 'Error fetching pending evaluations' });
  } finally {
    client.release();
  }
}
