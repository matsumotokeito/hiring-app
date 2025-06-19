import React, { useState, useEffect } from 'react';
import { JobType, Candidate, Evaluation, MatchingResult, SavedDraft, User, InterviewPhaseType } from './types';
import { getJobTypeConfigSync } from './config/jobTypes';
import { saveCandidate, saveEvaluation, getCandidateById, deleteCandidate } from './utils/storage';
import { initializeInterviewProcess } from './utils/interviewStorage';
import { RoleSelector } from './components/RoleSelector';
import { NavigationHeader } from './components/NavigationHeader';
import { ConfirmationModal } from './components/ConfirmationModal';
import { JobTypeSelector } from './components/JobTypeSelector';
import { CandidateForm } from './components/CandidateForm';
import { EvaluationForm } from './components/EvaluationForm';
import { ResultDisplay } from './components/ResultDisplay';
import { DraftManager } from './components/DraftManager';
import { CandidateDatabase } from './components/CandidateDatabase';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { MonthlyDashboard } from './components/MonthlyDashboard';
import { JobPostingManagement } from './components/JobPostingManagement';
import { CompanyInfoManagement } from './components/CompanyInfoManagement';
import { InterviewManagement } from './components/InterviewManagement';
import { HiringHistoryButton } from './components/HiringHistoryButton';
import { Target, BarChart3, Database, LogOut, Calendar, Briefcase, Building, TrendingUp, Users, Award, Clock, MessageSquare, Brain, FileText, History } from 'lucide-react';

type AppState = 'job_selection' | 'candidate_input' | 'evaluation' | 'result' | 'database' | 'analytics' | 'monthly_dashboard' | 'job_posting_management' | 'company_info_management' | 'interview_management';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentState, setCurrentState] = useState<AppState>('job_selection');
  const [selectedJobType, setSelectedJobType] = useState<JobType>('fresh_sales');
  const [currentCandidate, setCurrentCandidate] = useState<Candidate | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<MatchingResult | null>(null);
  const [draftData, setDraftData] = useState<{
    candidateData?: Partial<Candidate>;
    evaluationData?: Partial<Evaluation>;
  }>({});

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'warning' | 'danger' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  if (!currentUser) {
    return <RoleSelector onRoleSelect={setCurrentUser} />;
  }

  const hasPermission = (action: string, resource: string): boolean => {
    return currentUser.permissions.some(p => p.action === action && p.resource === resource);
  };

  const handleJobTypeChange = (jobType: JobType) => {
    setSelectedJobType(jobType);
    setCurrentState('candidate_input');
    setDraftData({});
    setCurrentCandidate(null);
  };

  const handleLoadDraft = (draft: SavedDraft) => {
    setSelectedJobType(draft.jobType);
    
    if (draft.stage === 'candidate_input' && draft.candidateData) {
      setDraftData({ candidateData: draft.candidateData });
      setCurrentState('candidate_input');
    } else if (draft.stage === 'evaluation' && draft.evaluationData) {
      // When loading an evaluation draft, we need to retrieve the candidate data
      if (draft.evaluationData.candidateId) {
        const candidate = getCandidateById(draft.evaluationData.candidateId);
        if (candidate) {
          setCurrentCandidate(candidate);
          setDraftData({ evaluationData: draft.evaluationData });
          setCurrentState('evaluation');
        } else {
          // If candidate not found, go back to candidate input
          setCurrentState('candidate_input');
          setDraftData({});
          setCurrentCandidate(null);
        }
      } else {
        // If no candidateId in draft, go back to candidate input
        setCurrentState('candidate_input');
        setDraftData({});
        setCurrentCandidate(null);
      }
    }
  };

  const handleCandidateSubmit = (candidateData: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const candidate: Candidate = {
      ...candidateData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    saveCandidate(candidate);
    
    // 面接プロセスの初期化
    if (!candidate.interviewPhase) {
      initializeInterviewProcess(candidate.id, candidate.appliedPosition);
    }
    
    setCurrentCandidate(candidate);
    setCurrentState('evaluation');
    setDraftData({});
  };

  const handleEditCandidateSubmit = (candidateData: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentCandidate) return;

    const updatedCandidate: Candidate = {
      ...currentCandidate,
      ...candidateData,
      updatedAt: new Date()
    };
    
    saveCandidate(updatedCandidate);
    setCurrentCandidate(updatedCandidate);
  };

  const handleEvaluationSubmit = (evaluationData: Omit<Evaluation, 'evaluatedAt'>) => {
    if (!currentCandidate) return;

    const evaluation: Evaluation = {
      ...evaluationData,
      evaluatedAt: new Date(),
      evaluatorId: currentUser.id,
      evaluatorName: currentUser.name,
    };

    saveEvaluation(evaluation);

    const jobConfig = getJobTypeConfigSync(selectedJobType);
    
    const scores = Object.values(evaluationData.scores);
    const totalScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    jobConfig.evaluationCriteria.forEach(criterion => {
      const score = evaluationData.scores[criterion.id];
      if (score) {
        weightedSum += score * (criterion.weight / 100);
        totalWeight += criterion.weight / 100;
      }
    });
    
    const weightedScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

    const criteriaScores = jobConfig.evaluationCriteria.map(criterion => ({
      criterion,
      score: evaluationData.scores[criterion.id] || 0,
      comment: evaluationData.comments[criterion.id] || '',
    }));

    const result: MatchingResult = {
      candidate: currentCandidate,
      evaluation,
      totalScore,
      weightedScore,
      criteriaScores,
    };

    setEvaluationResult(result);
    setCurrentState('result');
  };

  const handleNewEvaluation = () => {
    setCurrentState('job_selection');
    setCurrentCandidate(null);
    setEvaluationResult(null);
    setDraftData({});
  };

  const handleViewDatabase = () => {
    setCurrentState('database');
  };

  const handleViewAnalytics = () => {
    setCurrentState('analytics');
  };

  const handleViewMonthlyDashboard = () => {
    setCurrentState('monthly_dashboard');
  };

  const handleViewJobPostingManagement = () => {
    setCurrentState('job_posting_management');
  };

  const handleViewCompanyInfoManagement = () => {
    setCurrentState('company_info_management');
  };

  const handleViewInterviewManagement = () => {
    setCurrentState('interview_management');
  };

  const handleEditCandidate = (candidateId: string) => {
    const candidate = getCandidateById(candidateId);
    if (candidate) {
      setCurrentCandidate(candidate);
      setSelectedJobType(candidate.appliedPosition);
      setCurrentState('candidate_input');
      setDraftData({ candidateData: candidate });
    }
  };

  const handleDeleteCandidateConfirm = (candidateId: string) => {
    setConfirmModal({
      isOpen: true,
      title: '候補者削除の確認',
      message: '本当にこの候補者を削除しますか？この操作は元に戻せません。',
      onConfirm: () => {
        deleteCandidate(candidateId);
        setConfirmModal({ ...confirmModal, isOpen: false });
        // 削除後に適切な状態に戻す
        if (currentCandidate && currentCandidate.id === candidateId) {
          setCurrentCandidate(null);
          setCurrentState('job_selection');
        }
      },
      type: 'danger',
    });
  };

  const handleLogout = () => {
    setConfirmModal({
      isOpen: true,
      title: 'ログアウト確認',
      message: 'ログアウトしますか？未保存のデータは失われる可能性があります。',
      onConfirm: () => {
        setCurrentUser(null);
        setCurrentState('job_selection');
        setCurrentCandidate(null);
        setEvaluationResult(null);
        setDraftData({});
        setConfirmModal({ ...confirmModal, isOpen: false });
      },
      type: 'warning',
    });
  };

  const handleNavigateHome = () => {
    const hasUnsavedData = draftData.candidateData || draftData.evaluationData;
    
    if (hasUnsavedData) {
      setConfirmModal({
        isOpen: true,
        title: '未保存のデータがあります',
        message: 'ホームに戻ると、現在の入力内容が失われる可能性があります。続行しますか？',
        onConfirm: () => {
          setConfirmModal({ ...confirmModal, isOpen: false });
          setCurrentState('job_selection');
          setCurrentCandidate(null);
          setEvaluationResult(null);
          setDraftData({});
        },
        type: 'warning',
      });
    } else {
      setCurrentState('job_selection');
      setCurrentCandidate(null);
      setEvaluationResult(null);
      setDraftData({});
    }
  };

  const handleNavigateBack = () => {
    const hasUnsavedData = draftData.candidateData || draftData.evaluationData;
    
    if (hasUnsavedData && currentState !== 'result' && !['database', 'analytics', 'monthly_dashboard', 'job_posting_management', 'company_info_management', 'interview_management'].includes(currentState)) {
      setConfirmModal({
        isOpen: true,
        title: '前のページに戻りますか？',
        message: '現在の入力内容が失われる可能性があります。続行しますか？',
        onConfirm: () => {
          setConfirmModal({ ...confirmModal, isOpen: false });
          navigateBackInternal();
        },
        type: 'warning',
      });
    } else {
      navigateBackInternal();
    }
  };

  const navigateBackInternal = () => {
    switch (currentState) {
      case 'candidate_input':
        setCurrentState('job_selection');
        setDraftData({});
        setCurrentCandidate(null);
        break;
      case 'evaluation':
        setCurrentState('candidate_input');
        setDraftData({});
        break;
      case 'result':
        setCurrentState('evaluation');
        break;
      case 'database':
      case 'analytics':
      case 'monthly_dashboard':
      case 'job_posting_management':
      case 'company_info_management':
      case 'interview_management':
        setCurrentState('job_selection');
        break;
      default:
        break;
    }
  };

  const renderProgressSteps = () => {
    const steps = [
      { id: 'job_selection', name: '職種選択', icon: Target },
      { id: 'candidate_input', name: '候補者情報', icon: Users },
      { id: 'evaluation', name: '評価入力', icon: BarChart3 },
      { id: 'result', name: '結果表示', icon: Award },
    ];

    const getStepIndex = (state: AppState) => {
      return steps.findIndex(step => step.id === state);
    };

    const currentIndex = getStepIndex(currentState);

    if (['database', 'analytics', 'monthly_dashboard', 'job_posting_management', 'company_info_management', 'interview_management'].includes(currentState)) {
      return null;
    }

    return (
      <div className="bg-white shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentIndex;
              const isCompleted = index < currentIndex;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                      isActive 
                        ? 'border-blue-500 bg-blue-500 text-white shadow-lg scale-110' 
                        : isCompleted 
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300 text-gray-400'
                    }`}>
                      <StepIcon size={20} />
                    </div>
                    <span className={`mt-2 text-sm font-medium transition-colors ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`mx-8 w-16 h-0.5 transition-colors ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader
        currentState={currentState}
        onNavigateHome={handleNavigateHome}
        onNavigateBack={handleNavigateBack}
        candidateName={currentCandidate?.name}
        user={currentUser}
        onLogout={handleLogout}
      />

      {renderProgressSteps()}

      <main className="max-w-7xl mx-auto px-4 py-6">
        {(currentState === 'candidate_input' || currentState === 'evaluation') && (
          <DraftManager
            onLoadDraft={handleLoadDraft}
            currentJobType={selectedJobType}
          />
        )}

        {currentState === 'job_selection' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <JobTypeSelector
                  selectedJobType={selectedJobType}
                  onJobTypeChange={handleJobTypeChange}
                />
              </div>
              
              {/* 採用履歴ボタン */}
              <div>
                {hasPermission('view', 'candidates') && (
                  <HiringHistoryButton user={currentUser} />
                )}
              </div>
            </div>
            
            {/* 機能メニュー */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  利用可能な機能
                </h3>
                <p className="text-gray-600">
                  役割に応じた機能にアクセスできます
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hasPermission('view', 'candidates') && (
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); handleViewDatabase(); }}
                    className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl hover:from-purple-100 hover:to-purple-200 hover:border-purple-300 transition-all duration-300 text-left hover:shadow-lg"
                  >
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-purple-500 rounded-xl group-hover:scale-110 transition-transform">
                        <Database className="text-white" size={24} />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-bold text-purple-800">候補者データベース</h4>
                        <p className="text-sm text-purple-600">候補者情報の閲覧・管理</p>
                      </div>
                    </div>
                  </a>
                )}

                {hasPermission('view', 'interviews') && (
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); handleViewInterviewManagement(); }}
                    className="group p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-xl hover:from-amber-100 hover:to-amber-200 hover:border-amber-300 transition-all duration-300 text-left hover:shadow-lg"
                  >
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-amber-500 rounded-xl group-hover:scale-110 transition-transform">
                        <Clock className="text-white" size={24} />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-bold text-amber-800">面接管理</h4>
                        <p className="text-sm text-amber-600">面接スケジュール・評価管理</p>
                      </div>
                    </div>
                  </a>
                )}

                {hasPermission('view_analytics', 'reports') && (
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); handleViewAnalytics(); }}
                    className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 transition-all duration-300 text-left hover:shadow-lg"
                  >
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-blue-500 rounded-xl group-hover:scale-110 transition-transform">
                        <BarChart3 className="text-white" size={24} />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-bold text-blue-800">分析ダッシュボード</h4>
                        <p className="text-sm text-blue-600">採用データの分析・レポート</p>
                      </div>
                    </div>
                  </a>
                )}

                {hasPermission('view_analytics', 'reports') && (
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); handleViewMonthlyDashboard(); }}
                    className="group p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl hover:from-green-100 hover:to-green-200 hover:border-green-300 transition-all duration-300 text-left hover:shadow-lg"
                  >
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-green-500 rounded-xl group-hover:scale-110 transition-transform">
                        <Calendar className="text-white" size={24} />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-bold text-green-800">月別ダッシュボード</h4>
                        <p className="text-sm text-green-600">月次採用実績・進捗管理</p>
                      </div>
                    </div>
                  </a>
                )}

                {hasPermission('edit', 'job_postings') && (
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); handleViewJobPostingManagement(); }}
                    className="group p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl hover:from-orange-100 hover:to-orange-200 hover:border-orange-300 transition-all duration-300 text-left hover:shadow-lg"
                  >
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-orange-500 rounded-xl group-hover:scale-110 transition-transform">
                        <Briefcase className="text-white" size={24} />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-bold text-orange-800">求人票管理</h4>
                        <p className="text-sm text-orange-600">職種別求人票の作成・編集</p>
                      </div>
                    </div>
                  </a>
                )}

                {hasPermission('edit', 'company_info') && (
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); handleViewCompanyInfoManagement(); }}
                    className="group p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 rounded-xl hover:from-indigo-100 hover:to-indigo-200 hover:border-indigo-300 transition-all duration-300 text-left hover:shadow-lg"
                  >
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-indigo-500 rounded-xl group-hover:scale-110 transition-transform">
                        <Building className="text-white" size={24} />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-bold text-indigo-800">会社情報管理</h4>
                        <p className="text-sm text-indigo-600">AI評価用の会社情報・価値観設定</p>
                      </div>
                    </div>
                  </a>
                )}
              </div>
            </div>

            {/* 主な機能リンク */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  主な機能
                </h3>
                <p className="text-gray-600">
                  以下のリンクから各機能に直接アクセスできます
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); handleJobTypeChange('fresh_sales'); }}
                  className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-md transition-all"
                >
                  <div className="p-3 bg-blue-500 rounded-full text-white mr-4">
                    <Target size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800">職種別評価システム</h4>
                    <p className="text-sm text-blue-600">各職種に最適化された評価基準</p>
                  </div>
                </a>
                
                <a 
                  href="#" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    handleJobTypeChange('fresh_sales');
                    setTimeout(() => {
                      const chatGptSection = document.querySelector('[data-section="chatgpt"]');
                      if (chatGptSection) chatGptSection.scrollIntoView({ behavior: 'smooth' });
                    }, 500);
                  }}
                  className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 hover:shadow-md transition-all"
                >
                  <div className="p-3 bg-green-500 rounded-full text-white mr-4">
                    <Brain size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800">ChatGPT AI分析</h4>
                    <p className="text-sm text-green-600">AIによる客観的評価と洞察</p>
                  </div>
                </a>
                
                <a 
                  href="#" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    handleJobTypeChange('fresh_sales');
                    setTimeout(() => {
                      const spiSection = document.querySelector('[data-section="spi"]');
                      if (spiSection) spiSection.scrollIntoView({ behavior: 'smooth' });
                    }, 500);
                  }}
                  className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200 hover:shadow-md transition-all"
                >
                  <div className="p-3 bg-purple-500 rounded-full text-white mr-4">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-800">SPI適性検査連携</h4>
                    <p className="text-sm text-purple-600">適性検査結果の分析と活用</p>
                  </div>
                </a>
                
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); handleViewInterviewManagement(); }}
                  className="flex items-center p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-200 hover:shadow-md transition-all"
                >
                  <div className="p-3 bg-amber-500 rounded-full text-white mr-4">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-800">面接プロセス管理</h4>
                    <p className="text-sm text-amber-600">面接スケジュールと評価の管理</p>
                  </div>
                </a>
                
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); handleViewAnalytics(); }}
                  className="flex items-center p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200 hover:shadow-md transition-all"
                >
                  <div className="p-3 bg-red-500 rounded-full text-white mr-4">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-800">採用データ分析</h4>
                    <p className="text-sm text-red-600">採用活動の分析とレポート</p>
                  </div>
                </a>
                
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); handleViewJobPostingManagement(); }}
                  className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200 hover:shadow-md transition-all"
                >
                  <div className="p-3 bg-indigo-500 rounded-full text-white mr-4">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-indigo-800">求人票管理</h4>
                    <p className="text-sm text-indigo-600">職種別求人情報の管理</p>
                  </div>
                </a>
              </div>
            </div>

            {/* 役割別情報 */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-xl p-8 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <TrendingUp className="mr-3 text-blue-600" size={24} />
                {currentUser.role === 'recruiter' ? '採用担当者向け情報' : '人事戦略運用担当者向け情報'}
              </h3>
              
              {currentUser.role === 'recruiter' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700 mb-3">主な機能</h4>
                    <div className="space-y-3 text-sm text-gray-700">
                      <p className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                        候補者の評価・面接・採用判定を効率的に実施
                      </p>
                      <p className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                        ChatGPT AI機能による客観的な判断材料の提供
                      </p>
                      <p className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                        評価の途中保存機能で作業の中断・再開が可能
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700 mb-3">活用メリット</h4>
                    <div className="space-y-3 text-sm text-gray-700">
                      <p className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
                        個別の評価レポートを出力・共有
                      </p>
                      <p className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
                        月別ダッシュボードで採用活動の進捗確認
                      </p>
                      <p className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
                        求人票情報を活用した精密な適性判断
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700 mb-3">戦略的機能</h4>
                    <div className="space-y-3 text-sm text-gray-700">
                      <p className="flex items-start">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></span>
                        採用データの全体分析による戦略的意思決定支援
                      </p>
                      <p className="flex items-start">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></span>
                        職種別・期間別の詳細な採用メトリクス確認
                      </p>
                      <p className="flex items-start">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></span>
                        採用チャネルの効果分析でリソース配分最適化
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700 mb-3">管理機能</h4>
                    <div className="space-y-3 text-sm text-gray-700">
                      <p className="flex items-start">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3"></span>
                        月別ダッシュボードで採用目標の達成状況監視
                      </p>
                      <p className="flex items-start">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3"></span>
                        ChatGPT AIを活用した高度な候補者分析
                      </p>
                      <p className="flex items-start">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3"></span>
                        求人票・会社情報管理による標準化と最適化
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentState === 'candidate_input' && hasPermission('create', 'candidates') && (
          <CandidateForm
            jobType={selectedJobType}
            onCandidateSubmit={currentCandidate ? handleEditCandidateSubmit : handleCandidateSubmit}
            initialData={currentCandidate || draftData.candidateData}
          />
        )}

        {currentState === 'evaluation' && currentCandidate && hasPermission('create', 'evaluations') && (
          <EvaluationForm
            candidate={currentCandidate}
            jobType={selectedJobType}
            onEvaluationSubmit={handleEvaluationSubmit}
            initialEvaluation={draftData.evaluationData}
          />
        )}

        {currentState === 'result' && evaluationResult && (
          <ResultDisplay
            result={evaluationResult}
            onNewEvaluation={handleNewEvaluation}
            user={currentUser}
          />
        )}

        {currentState === 'database' && hasPermission('view', 'candidates') && (
          <CandidateDatabase 
            user={currentUser} 
            onEditCandidate={handleEditCandidate}
            onDeleteCandidate={handleDeleteCandidateConfirm}
          />
        )}

        {currentState === 'analytics' && hasPermission('view_analytics', 'reports') && (
          <AnalyticsDashboard user={currentUser} />
        )}

        {currentState === 'monthly_dashboard' && hasPermission('view_analytics', 'reports') && (
          <MonthlyDashboard user={currentUser} />
        )}

        {currentState === 'job_posting_management' && hasPermission('edit', 'job_postings') && (
          <JobPostingManagement user={currentUser} />
        )}

        {currentState === 'company_info_management' && hasPermission('edit', 'company_info') && (
          <CompanyInfoManagement user={currentUser} />
        )}

        {currentState === 'interview_management' && hasPermission('view', 'interviews') && currentCandidate && (
          <InterviewManagement 
            candidate={currentCandidate}
            user={currentUser}
          />
        )}

        {/* 権限不足の場合 */}
        {((currentState === 'candidate_input' && !hasPermission('create', 'candidates')) ||
          (currentState === 'evaluation' && !hasPermission('create', 'evaluations')) ||
          (currentState === 'database' && !hasPermission('view', 'candidates')) ||
          (currentState === 'analytics' && !hasPermission('view_analytics', 'reports')) ||
          (currentState === 'monthly_dashboard' && !hasPermission('view_analytics', 'reports')) ||
          (currentState === 'job_posting_management' && !hasPermission('edit', 'job_postings')) ||
          (currentState === 'company_info_management' && !hasPermission('edit', 'company_info')) ||
          (currentState === 'interview_management' && !hasPermission('view', 'interviews'))) && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-red-600 mb-4">
              <LogOut size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              アクセス権限がありません
            </h3>
            <p className="text-gray-600 mb-4">
              この機能を利用するための権限がありません。システム管理者にお問い合わせください。
            </p>
            <button
              onClick={handleNavigateHome}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              ホームに戻る
            </button>
          </div>
        )}
      </main>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        type={confirmModal.type}
        confirmText="続行"
        cancelText="キャンセル"
      />

      {/* フッター */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Users className="mr-2" size={24} />
                <h3 className="text-lg font-bold">採用マッチング判定システム</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                AI支援による科学的人材評価プラットフォーム。
                データドリブンな採用判定で、最適な人材の発見をサポートします。
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">主な機能</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• <a href="#" onClick={(e) => { e.preventDefault(); handleJobTypeChange('fresh_sales'); }} className="hover:text-white">職種別評価システム</a></li>
                <li>• <a href="#" onClick={(e) => { e.preventDefault(); handleJobTypeChange('fresh_sales'); }} className="hover:text-white">ChatGPT AI分析</a></li>
                <li>• <a href="#" onClick={(e) => { e.preventDefault(); handleJobTypeChange('fresh_sales'); }} className="hover:text-white">SPI適性検査連携</a></li>
                <li>• <a href="#" onClick={(e) => { e.preventDefault(); handleViewInterviewManagement(); }} className="hover:text-white">面接プロセス管理</a></li>
                <li>• <a href="#" onClick={(e) => { e.preventDefault(); handleViewAnalytics(); }} className="hover:text-white">採用データ分析</a></li>
                <li>• <a href="#" onClick={(e) => { e.preventDefault(); handleViewJobPostingManagement(); }} className="hover:text-white">求人票管理</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">現在のユーザー</h4>
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="font-medium">{currentUser.name}</p>
                <p className="text-sm text-gray-300">
                  {currentUser.role === 'recruiter' ? '採用担当者' : 
                   currentUser.role === 'hr_strategy' ? '人事戦略運用担当者' : 'システム管理者'}
                </p>
                <p className="text-xs text-gray-400 mt-1">{currentUser.department}</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 flex justify-between items-center">
            <p className="text-sm text-gray-400">
              © 2025 採用マッチング判定システム. All rights reserved.
            </p>
            <p className="text-xs text-gray-500">
              機密情報の取り扱いにご注意ください
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;