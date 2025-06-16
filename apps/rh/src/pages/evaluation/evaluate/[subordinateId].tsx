import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus, InteractionRequiredAuthError, PublicClientApplication } from '@azure/msal-browser';
import { fetchWithAuth, ApiClientOptions } from '@/lib/apiClient';
import { useSelectedEmployee } from '@/contexts/SelectedEmployeeContext';

// Placeholder interfaces - these would be defined based on your actual API response
interface EvaluationCriterion {
  id: string;
  name: string;
  description?: string;
  weight: number;
  // ... other fields like score, comments for self and manager
  self_achievement_percentage?: number;
  self_comments?: string;
  manager_achievement_percentage?: number;
  manager_comments?: string;
}

interface EvaluationMatrix {
  id: string;
  title: string;
  criteria: EvaluationCriterion[];
}

interface SubordinateEvaluationData {
  evaluation_id?: string; // If an evaluation already exists
  employee_id: string; // The subordinate being evaluated
  employee_name: string; // Subordinate's name (fetch separately or include in API)
  matrix: EvaluationMatrix;
  status: string; // e.g., 'draft', 'self_evaluation_pending', 'manager_review', 'completed'
  // ... other relevant fields like period, overall comments etc.
}

const EvaluationFormPage = () => {
  const router = useRouter();
  const { subordinateId } = router.query;
  const { instance, accounts, inProgress } = useMsal();
  const {
    selectedEmployeeId: managerEmployeeId, // Manager's own employee ID from context
    systemUserId,
    employeeProfileName: managerName 
  } = useSelectedEmployee();

  const [evaluationData, setEvaluationData] = useState<SubordinateEvaluationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!subordinateId || !managerEmployeeId || inProgress !== InteractionStatus.None || !accounts[0]) {
      if (inProgress === InteractionStatus.None && !accounts[0]) {
        setError("Utilizador não autenticado.");
      } else if (inProgress === InteractionStatus.None && !managerEmployeeId) {
        setError("Informação do gestor não disponível no contexto. Por favor, recarregue a página anterior.");
      }
      // Do not set isLoading to false here if it's just waiting for router.query or context
      if (subordinateId && managerEmployeeId) setIsLoading(false); // Only set loading false if essential IDs are missing and not loading
      return;
    }

    const fetchEvaluationDetails = async () => {
      setIsLoading(true);
      setError(null);

      const apiClientOptions: ApiClientOptions = {
        msalInstance: instance as PublicClientApplication,
        selectedEmployeeId: managerEmployeeId, // Manager's ID is the acting user
        interactionStatus: inProgress,
        activeAccount: accounts[0] || null,
      };

      try {
        console.log(`Fetching evaluation data for subordinate: ${subordinateId}, by manager: ${managerEmployeeId}`);
        const fetchedData = await fetchWithAuth<SubordinateEvaluationData>(
          `/api/evaluation/form-data/${subordinateId}`,
          { method: 'GET' },
          apiClientOptions
        );
        setEvaluationData(fetchedData);
      } catch (err: any) {
        console.error("Error fetching evaluation details:", err);
        if (err instanceof InteractionRequiredAuthError) {
          setError("Sessão expirada ou requer interação. Por favor, tente autenticar novamente.");
          // Potentially trigger interactive login
        } else {
          setError(err.data?.message || err.message || "Falha ao carregar detalhes da avaliação.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvaluationDetails();
  }, [subordinateId, managerEmployeeId, instance, accounts, inProgress, systemUserId]);

  if (isLoading || inProgress !== InteractionStatus.None) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Formulário de Avaliação</h1>
        <p>A carregar dados da avaliação...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Formulário de Avaliação</h1>
        <p className="text-red-500">Erro: {error}</p>
        <Link href="/evaluation/evaluate" className="text-blue-500 hover:underline">
          Voltar à seleção de colaborador
        </Link>
      </div>
    );
  }

  if (!evaluationData) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Formulário de Avaliação</h1>
        <p>Não foram encontrados dados para esta avaliação.</p>
        <Link href="/evaluation/evaluate" className="text-blue-500 hover:underline">
          Voltar à seleção de colaborador
        </Link>
      </div>
    );
  }

  // --- Placeholder for the actual form --- 
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Link href="/evaluation/evaluate" className="text-blue-600 hover:text-blue-800 text-sm">
            &larr; Voltar à Seleção de Colaborador
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            Avaliação de Desempenho: {evaluationData.employee_name || subordinateId}
          </h1>
          <p className="text-sm text-gray-600">
            Gestor: {managerName || 'N/A'} (ID: {managerEmployeeId})
          </p>
          <p className="text-sm text-gray-500">
            Matriz de Avaliação: {evaluationData.matrix.title} (ID: {evaluationData.matrix.id})
          </p>
        </header>

        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Critérios de Avaliação</h2>
          {/* Form will go here */}
          <form>
            {evaluationData.matrix.criteria.map((criterion, index) => (
              <div key={criterion.id} className={`mb-6 pb-6 ${index < evaluationData.matrix.criteria.length - 1 ? 'border-b border-gray-200' : ''}`}>
                <h3 className="text-lg font-semibold text-gray-700">{criterion.name}</h3>
                <p className="text-sm text-gray-500 mb-1">Peso: {criterion.weight}%</p>
                {criterion.description && <p className="text-sm text-gray-600 mb-3">{criterion.description}</p>}

                {/* Self-evaluation data if available */}
                {criterion.self_achievement_percentage !== undefined && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Autoavaliação (% Realização):
                    </label>
                    <input
                      type="number"
                      readOnly
                      value={criterion.self_achievement_percentage ?? ''}
                      className="mt-1 block w-full sm:w-1/2 md:w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-100"
                    />
                  </div>
                )}
                {criterion.self_comments && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Comentários do Colaborador:
                    </label>
                    <textarea
                      readOnly
                      value={criterion.self_comments}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-100"
                      rows={3}
                    />
                  </div>
                )}

                {/* Manager input fields */}
                <div className="mt-2">
                  <label htmlFor={`manager_score_${criterion.id}`} className="block text-sm font-medium text-gray-700">
                    Pontuação do Gestor (% Realização):
                  </label>
                  <input
                    type="number"
                    id={`manager_score_${criterion.id}`}
                    name={`manager_score_${criterion.id}`}
                    min="0"
                    max="100"
                    defaultValue={criterion.manager_achievement_percentage ?? ''}
                    className="mt-1 block w-full sm:w-1/2 md:w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="0-100"
                  />
                </div>
                <div className="mt-2">
                  <label htmlFor={`manager_comments_${criterion.id}`} className="block text-sm font-medium text-gray-700">
                    Observações do Gestor:
                  </label>
                  <textarea
                    id={`manager_comments_${criterion.id}`}
                    name={`manager_comments_${criterion.id}`}
                    rows={3}
                    defaultValue={criterion.manager_comments ?? ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Comentários sobre o desempenho neste critério..."
                  />
                </div>
              </div>
            ))}

            <div className="mt-8 pt-6 border-t border-gray-300">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Comentários Gerais do Gestor</h3>
              <textarea 
                id="manager_overall_comments"
                name="manager_overall_comments"
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Feedback geral sobre o período de avaliação..."
              />
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button 
                type="button" 
                // onClick={handleSaveDraft}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Salvar Rascunho
              </button>
              <button 
                type="submit" 
                // onClick={handleSubmitEvaluation}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Submeter Avaliação
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EvaluationFormPage; 