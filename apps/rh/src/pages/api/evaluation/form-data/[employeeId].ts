import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../../middleware/auth';
import { executeQuery } from '../../../../../../../lib/db/pool';

interface CriterionData {
  id: number;
  name: string;
  description: string | null;
  weight: string;
  self_achievement_percentage?: number | null;
  self_comments?: string | null;
  manager_achievement_percentage?: number | null;
  manager_comments?: string | null;
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { employeeId } = req.query;
  if (!employeeId || Array.isArray(employeeId)) {
    return res.status(400).json({ message: 'Valid employeeId required' });
  }

  const managerId = req.headers['x-selected-employee-id'] as string;
  if (!managerId) {
    return res.status(400).json({ message: 'Manager employee ID header missing' });
  }

  try {
    // Get active matrix assigned to employee
    const matrixRes = await executeQuery(
      `SELECT m.id, m.title
         FROM evaluation_matrix_applicability ema
         JOIN evaluation_matrices m ON ema.matrix_id = m.id
        WHERE ema.employee_id = $1
          AND ema.status = 'active'
        ORDER BY ema.valid_from DESC
        LIMIT 1`,
      [employeeId]
    );

    if (matrixRes.length === 0) {
      return res.status(404).json({ message: 'No active matrix found for employee' });
    }

    const matrix = matrixRes[0];

    // existing employee evaluation (by manager)
    const evalRes = await executeQuery(
      `SELECT id, status
         FROM employee_evaluations
        WHERE employee_id = $1
          AND evaluator_id = $2
          AND matrix_id = $3
        ORDER BY created_at DESC
        LIMIT 1`,
      [employeeId, managerId, matrix.id]
    );

    const evaluation = evalRes[0] || null;

    // self evaluation submitted
    const selfEvalRes = await executeQuery(
      `SELECT id
         FROM self_evaluations
        WHERE employee_id = $1
          AND matrix_id = $2
          AND status = 'submitted'
        ORDER BY created_at DESC
        LIMIT 1`,
      [employeeId, matrix.id]
    );
    const selfEvalId = selfEvalRes[0]?.id;

    const selfScores = selfEvalId
      ? await executeQuery(
          'SELECT criterion_id, achievement_percentage, employee_criterion_comments FROM self_evaluation_scores WHERE self_evaluation_id = $1',
          [selfEvalId]
        )
      : [];

    const selfMap = new Map(selfScores.map((s) => [s.criterion_id, s]));

    const managerScores = evaluation
      ? await executeQuery(
          'SELECT criterion_id, achievement_percentage, manager_criterion_comments FROM evaluation_criteria_scores WHERE evaluation_id = $1',
          [evaluation.id]
        )
      : [];
    const managerMap = new Map(managerScores.map((s) => [s.criterion_id, s]));

    const criteria = await executeQuery<CriterionData>(
      'SELECT id, name, description, weight FROM evaluation_criteria WHERE matrix_id = $1 ORDER BY id',
      [matrix.id]
    );

    const enrichedCriteria = criteria.map((c) => ({
      ...c,
      self_achievement_percentage: selfMap.get(c.id)?.achievement_percentage || null,
      self_comments: selfMap.get(c.id)?.employee_criterion_comments || null,
      manager_achievement_percentage: managerMap.get(c.id)?.achievement_percentage || null,
      manager_comments: managerMap.get(c.id)?.manager_criterion_comments || null,
    }));

    const employeeNameRes = await executeQuery(
      'SELECT name FROM employees WHERE id = $1',
      [employeeId]
    );

    const response = {
      evaluation_id: evaluation?.id || null,
      employee_id: employeeId,
      employee_name: employeeNameRes[0]?.name || null,
      matrix: {
        id: matrix.id,
        title: matrix.title,
        criteria: enrichedCriteria,
      },
      status: evaluation?.status || 'draft',
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching evaluation form data:', error);
    return res.status(500).json({ message: 'Failed to load form data' });
  }
}

export default withAuth(handler);
