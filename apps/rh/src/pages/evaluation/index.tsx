import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  ClipboardListIcon, // For Matrizes
  UserGroupIcon,     // For Avaliar Subordinados
  CollectionIcon,    // For Minhas Avaliações (or similar)
  ClockIcon,         // For Pendentes
  CheckCircleIcon,   // For Concluídas
  DocumentTextIcon,  // For Balanços Pendentes
  PlusCircleIcon,    // For Nova Matriz
  AdjustmentsHorizontalIcon, // for Matrizes de Avaliação button
  IdentificationIcon, // for Minhas Avaliações button
} from '@heroicons/react/24/outline';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus, PublicClientApplication } from '@azure/msal-browser';
import { useSelectedEmployee } from '@/contexts/SelectedEmployeeContext';
import { fetchWithAuth, ApiClientOptions } from '@/lib/apiClient';

interface RoleInfo {
  isManager: boolean;
  subordinates: { id: string; name: string }[];
}

interface SelfEvaluation {
  id: number;
  matrix_title: string;
  evaluation_period_month: string;
  status: string;
}

const EvaluationDashboardPage = () => {
  const [activeTab, setActiveTab] = useState<'gestor' | 'colaborador'>('gestor');
  const [roleInfo, setRoleInfo] = useState<RoleInfo | null>(null);
  const [selfEvals, setSelfEvals] = useState<SelfEvaluation[]>([]);
  const [summaryData, setSummaryData] = useState({
    pendingReviews: 0,
    completedReviews: 0,
    pendingBalances: 0,
  });
  const { msalInstance, accounts, inProgress, selectedEmployeeId } = useSelectedEmployee();
  const activeAccount = accounts && accounts.length > 0 ? accounts[0] : null;

  useEffect(() => {
    const fetchData = async () => {
      if (!msalInstance || !activeAccount || inProgress !== InteractionStatus.None || !selectedEmployeeId) {
        return;
      }

      const apiClientOptions: ApiClientOptions = {
        msalInstance: msalInstance as PublicClientApplication,
        selectedEmployeeId,
        interactionStatus: inProgress,
        activeAccount,
      };

      try {
        const role = await fetchWithAuth<RoleInfo>('/api/evaluation/user-role-info', { method: 'GET' }, apiClientOptions);
        setRoleInfo(role);
        setActiveTab(role.isManager ? 'gestor' : 'colaborador');

        const selfData = await fetchWithAuth<SelfEvaluation[]>(
          '/api/evaluation/self-evaluations?status=draft',
          { method: 'GET' },
          apiClientOptions
        );
        setSelfEvals(selfData);

        setSummaryData((prev) => ({
          ...prev,
          pendingReviews: role.isManager ? role.subordinates.length : selfData.length,
        }));
      } catch (err) {
        console.error('Failed to fetch evaluation dashboard data:', err);
      }
    };

    fetchData();
  }, [msalInstance, activeAccount, inProgress, selectedEmployeeId]);


  return (
    <>
      <Head>
        <title>Avaliação de Desempenho</title>
      </Head>

      <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Avaliação de Desempenho</h1>
          <div className="flex space-x-3">
            <Link href="/evaluation/matrices" legacyBehavior>
              <a className="bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 px-4 py-2 rounded-md shadow-sm text-sm font-medium flex items-center">
                <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-gray-500" />
                Matrizes de Avaliação
              </a>
            </Link>
            <button 
              onClick={() => alert('Navegar para Minhas Avaliações (placeholder)')}
              className="bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-md shadow-sm text-sm font-medium flex items-center"
            >
              <IdentificationIcon className="h-5 w-5 mr-2" />
              Minhas Avaliações
            </button>
          </div>
        </div>

        {/* Summary Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avaliações Pendentes</p>
              <p className="text-3xl font-semibold text-gray-800">{summaryData.pendingReviews}</p>
              <p className="text-xs text-gray-400">Avaliações a aguardar preenchimento</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-500" />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avaliações Concluídas</p>
              <p className="text-3xl font-semibold text-gray-800">{summaryData.completedReviews}</p>
              <p className="text-xs text-gray-400">Avaliações finalizadas este mês</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Balanços Pendentes</p>
              <p className="text-3xl font-semibold text-gray-800">{summaryData.pendingBalances}</p>
              <p className="text-xs text-gray-400">F-RH-04 a aguardar preenchimento</p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        {/* Tabs for Gestor / Colaborador */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('gestor')}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === 'gestor'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                Gestor
              </button>
              <button
                onClick={() => setActiveTab('colaborador')}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === 'colaborador'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                Colaborador
              </button>
            </nav>
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          {activeTab === 'gestor' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-1">Ações do Gestor</h2>
              <p className="text-sm text-gray-500 mb-6">Gerencie as avaliações dos seus subordinados.</p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Link href="/evaluation/evaluate" legacyBehavior>
                  <a className="w-full sm:w-auto flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                    Avaliar Colaboradores
                  </a>
                </Link>
                <Link href="/evaluation/matrices" legacyBehavior>
                  <a className="w-full sm:w-auto flex-1 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
                    Nova Matriz de Avaliação
                  </a>
                </Link>
              </div>
              {roleInfo && roleInfo.subordinates.length > 0 ? (
                <ul className="mt-6 divide-y divide-gray-200">
                  {roleInfo.subordinates.map((sub) => (
                    <li key={sub.id} className="py-2 flex justify-between items-center">
                      <span>{sub.name}</span>
                      <Link href={`/evaluation/evaluate/${sub.id}`} className="text-sm text-blue-600 hover:underline">
                        Avaliar
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mt-6">Sem avaliações pendentes.</p>
              )}
            </div>
          )}

          {activeTab === 'colaborador' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-1">Ações do Colaborador</h2>
              <p className="text-sm text-gray-500 mb-6">Acompanhe o seu desempenho e preencha os seus formulários.</p>
              {selfEvals.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {selfEvals.map((se) => (
                    <li key={se.id} className="py-2 flex justify-between">
                      <span>{se.matrix_title}</span>
                      <span>{new Date(se.evaluation_period_month).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 py-8">Nenhuma autoavaliação pendente.</p>
              )}
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default EvaluationDashboardPage; 