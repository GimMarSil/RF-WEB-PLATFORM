import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../../middleware/auth';
import { withErrorHandler, ValidationError, NotFoundError } from '../../../../lib/errors';
import { executeQuery } from '../../../../lib/db/pool';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { method } = req;
  const { subordinateId } = req.query;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${method} Not Allowed` });
  }

  if (!subordinateId || Array.isArray(subordinateId)) {
    throw new ValidationError('Valid subordinateId must be provided');
  }

  const managerId = req.headers['x-selected-employee-id'] as string | undefined;
  if (!managerId) {
    throw new ValidationError('X-Selected-Employee-ID header required');
  }

  // Find active matrix applicability for the subordinate
  const matrixRows = await executeQuery(
    `SELECT ma.matrix_id, em.title, CONCAT(e.first_name, ' ', e.last_name) as employee_name
       FROM evaluation_matrix_applicability ma
       JOIN evaluation_matrices em ON ma.matrix_id = em.id
       JOIN employees e ON ma.employee_id = e.id
      WHERE ma.employee_id = $1
        AND ma.status = 'active'
        AND ma.valid_from <= NOW()
        AND ma.valid_to >= NOW()
      LIMIT 1`,
    [subordinateId]
  );

  if (matrixRows.length === 0) {
    throw new NotFoundError('Active evaluation matrix for employee');
  }

  const matrix = {
    id: matrixRows[0].matrix_id,
    title: matrixRows[0].title,
  };
  const employeeName = matrixRows[0].employee_name;

  // Get existing evaluations
  const evaluationRows = await executeQuery(
    `SELECT id, status FROM employee_evaluations
      WHERE employee_id = $1 AND evaluator_id = $2 AND matrix_id = $3
      ORDER BY created_at DESC LIMIT 1`,
    [subordinateId, managerId, matrix.id]
  );

  const selfEvalRows = await executeQuery(
    `SELECT id FROM self_evaluations
      WHERE employee_id = $1 AND matrix_id = $2
      ORDER BY created_at DESC LIMIT 1`,
    [subordinateId, matrix.id]
  );

  const evaluationId = evaluationRows[0]?.id || null;
  const selfEvaluationId = selfEvalRows[0]?.id || null;
  const status = evaluationRows[0]?.status || 'draft';

  // Fetch criteria and any existing scores
  const criteria = await executeQuery(
    `SELECT ec.id, ec.name, ec.description, ec.weight,
            ses.achievement_percentage as self_achievement_percentage,
            ses.employee_criterion_comments as self_comments,
            ees.achievement_percentage as manager_achievement_percentage,
            ees.manager_criterion_comments as manager_comments
       FROM evaluation_criteria ec
       LEFT JOIN self_evaluation_scores ses ON ses.criterion_id = ec.id AND ses.self_evaluation_id = $2
       LEFT JOIN evaluation_criteria_scores ees ON ees.criterion_id = ec.id AND ees.evaluation_id = $3
      WHERE ec.matrix_id = $1
      ORDER BY ec.id`,
    [matrix.id, selfEvaluationId, evaluationId]
  );

  res.status(200).json({
    evaluation_id: evaluationId,
    employee_id: subordinateId,
    employee_name: employeeName,
    matrix: {
      id: matrix.id,
      title: matrix.title,
      criteria,
    },
    status,
  });
}

export default withErrorHandler(withAuth(handler));
