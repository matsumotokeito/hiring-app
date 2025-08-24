<template>
  <v-app>
    <!-- ログイン画面 -->
    <RoleSelector v-if="!currentUser" @role-select="setCurrentUser" />
    
    <!-- メインアプリケーション -->
    <template v-else>
      <!-- ナビゲーションヘッダー -->
      <NavigationHeader
        :current-state="currentState"
        :candidate-name="currentCandidate?.name"
        :user="currentUser"
        @navigate-home="handleNavigateHome"
        @navigate-back="handleNavigateBack"
        @logout="handleLogout"
      />

      <!-- プログレスステップ -->
      <ProgressSteps
        v-if="!['database', 'analytics', 'monthly_dashboard', 'job_posting_management', 'company_info_management', 'interview_management'].includes(currentState)"
        :current-state="currentState"
      />

      <!-- メインコンテンツ -->
      <v-main>
        <v-container fluid class="pa-6">
          <!-- 下書き管理 -->
          <DraftManager
            v-if="['candidate_input', 'evaluation'].includes(currentState)"
            :current-job-type="selectedJobType"
            @load-draft="handleLoadDraft"
          />

          <!-- 職種選択 -->
          <JobTypeSelector
            v-if="currentState === 'job_selection'"
            :selected-job-type="selectedJobType"
            @job-type-change="handleJobTypeChange"
          />

          <!-- 候補者情報入力 -->
          <CandidateForm
            v-if="currentState === 'candidate_input' && hasPermission('create', 'candidates')"
            :job-type="selectedJobType"
            :initial-data="currentCandidate || draftData.candidateData"
            @candidate-submit="currentCandidate ? handleEditCandidateSubmit : handleCandidateSubmit"
          />

          <!-- 評価入力 -->
          <EvaluationForm
            v-if="currentState === 'evaluation' && currentCandidate && hasPermission('create', 'evaluations')"
            :candidate="currentCandidate"
            :job-type="selectedJobType"
            :initial-evaluation="draftData.evaluationData"
            @evaluation-submit="handleEvaluationSubmit"
          />

          <!-- 結果表示 -->
          <ResultDisplay
            v-if="currentState === 'result' && evaluationResult"
            :result="evaluationResult"
            :user="currentUser"
            @new-evaluation="handleNewEvaluation"
          />

          <!-- 候補者データベース -->
          <CandidateDatabase
            v-if="currentState === 'database' && hasPermission('view', 'candidates')"
            :user="currentUser"
            @edit-candidate="handleEditCandidate"
            @delete-candidate="handleDeleteCandidateConfirm"
          />

          <!-- 分析ダッシュボード -->
          <AnalyticsDashboard
            v-if="currentState === 'analytics' && hasPermission('view_analytics', 'reports')"
            :user="currentUser"
          />

          <!-- 月別ダッシュボード -->
          <MonthlyDashboard
            v-if="currentState === 'monthly_dashboard' && hasPermission('view_analytics', 'reports')"
            :user="currentUser"
          />

          <!-- 求人票管理 -->
          <JobPostingManagement
            v-if="currentState === 'job_posting_management' && hasPermission('edit', 'job_postings')"
            :user="currentUser"
          />

          <!-- 会社情報管理 -->
          <CompanyInfoManagement
            v-if="currentState === 'company_info_management' && hasPermission('edit', 'company_info')"
            :user="currentUser"
          />

          <!-- 面接管理 -->
          <InterviewManagement
            v-if="currentState === 'interview_management' && hasPermission('view', 'interviews') && currentCandidate"
            :candidate="currentCandidate"
            :user="currentUser"
          />

          <!-- 権限不足の場合 -->
          <PermissionDenied
            v-if="showPermissionDenied"
            @navigate-home="handleNavigateHome"
          />
        </v-container>
      </v-main>

      <!-- フッター -->
      <AppFooter :current-user="currentUser" />

      <!-- 確認モーダル -->
      <ConfirmationModal
        v-model="confirmModal.isOpen"
        :title="confirmModal.title"
        :message="confirmModal.message"
        :type="confirmModal.type"
        :confirm-text="confirmModal.confirmText"
        :cancel-text="confirmModal.cancelText"
        @confirm="confirmModal.onConfirm"
        @cancel="confirmModal.onCancel"
      />
    </template>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { JobType, Candidate, Evaluation, MatchingResult, SavedDraft, User } from './types';
import { getJobTypeConfigSync } from './config/jobTypes';
import { saveCandidate, saveEvaluation, getCandidateById, deleteCandidate } from './utils/storage';
import { initializeInterviewProcess } from './utils/interviewStorage';

// Components
import RoleSelector from './components/RoleSelector.vue';
import NavigationHeader from './components/NavigationHeader.vue';
import ProgressSteps from './components/ProgressSteps.vue';
import DraftManager from './components/DraftManager.vue';
import JobTypeSelector from './components/JobTypeSelector.vue';
import CandidateForm from './components/CandidateForm.vue';
import EvaluationForm from './components/EvaluationForm.vue';
import ResultDisplay from './components/ResultDisplay.vue';
import CandidateDatabase from './components/CandidateDatabase.vue';
import AnalyticsDashboard from './components/AnalyticsDashboard.vue';
import MonthlyDashboard from './components/MonthlyDashboard.vue';
import JobPostingManagement from './components/JobPostingManagement.vue';
import CompanyInfoManagement from './components/CompanyInfoManagement.vue';
import InterviewManagement from './components/InterviewManagement.vue';
import PermissionDenied from './components/PermissionDenied.vue';
import AppFooter from './components/AppFooter.vue';
import ConfirmationModal from './components/ConfirmationModal.vue';

type AppState = 'job_selection' | 'candidate_input' | 'evaluation' | 'result' | 'database' | 'analytics' | 'monthly_dashboard' | 'job_posting_management' | 'company_info_management' | 'interview_management';

// Reactive state
const currentUser = ref<User | null>(null);
const currentState = ref<AppState>('job_selection');
const selectedJobType = ref<JobType>('fresh_sales');
const currentCandidate = ref<Candidate | null>(null);
const evaluationResult = ref<MatchingResult | null>(null);
const draftData = ref<{
  candidateData?: Partial<Candidate>;
  evaluationData?: Partial<Evaluation>;
}>({});

const confirmModal = ref({
  isOpen: false,
  title: '',
  message: '',
  onConfirm: () => {},
  onCancel: () => {},
  type: 'warning' as 'warning' | 'danger' | 'info',
  confirmText: '続行',
  cancelText: 'キャンセル'
});

// Computed properties
const showPermissionDenied = computed(() => {
  const permissionRequiredStates = [
    { state: 'candidate_input', action: 'create', resource: 'candidates' },
    { state: 'evaluation', action: 'create', resource: 'evaluations' },
    { state: 'database', action: 'view', resource: 'candidates' },
    { state: 'analytics', action: 'view_analytics', resource: 'reports' },
    { state: 'monthly_dashboard', action: 'view_analytics', resource: 'reports' },
    { state: 'job_posting_management', action: 'edit', resource: 'job_postings' },
    { state: 'company_info_management', action: 'edit', resource: 'company_info' },
    { state: 'interview_management', action: 'view', resource: 'interviews' }
  ];

  const currentStatePermission = permissionRequiredStates.find(p => p.state === currentState.value);
  return currentStatePermission && !hasPermission(currentStatePermission.action, currentStatePermission.resource);
});

// Methods
const setCurrentUser = (user: User) => {
  currentUser.value = user;
};

const hasPermission = (action: string, resource: string): boolean => {
  return currentUser.value?.permissions.some(p => p.action === action && p.resource === resource) || false;
};

const handleJobTypeChange = (jobType: JobType) => {
  selectedJobType.value = jobType;
  currentState.value = 'candidate_input';
  draftData.value = {};
  currentCandidate.value = null;
};

const handleLoadDraft = (draft: SavedDraft) => {
  selectedJobType.value = draft.jobType;
  
  if (draft.stage === 'candidate_input' && draft.candidateData) {
    draftData.value = { candidateData: draft.candidateData };
    currentState.value = 'candidate_input';
  } else if (draft.stage === 'evaluation' && draft.evaluationData) {
    if (draft.evaluationData.candidateId) {
      const candidate = getCandidateById(draft.evaluationData.candidateId);
      if (candidate) {
        currentCandidate.value = candidate;
        draftData.value = { evaluationData: draft.evaluationData };
        currentState.value = 'evaluation';
      } else {
        currentState.value = 'candidate_input';
        draftData.value = {};
        currentCandidate.value = null;
      }
    } else {
      currentState.value = 'candidate_input';
      draftData.value = {};
      currentCandidate.value = null;
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
  
  if (!candidate.interviewPhase) {
    initializeInterviewProcess(candidate.id, candidate.appliedPosition);
  }
  
  currentCandidate.value = candidate;
  currentState.value = 'evaluation';
  draftData.value = {};
};

const handleEditCandidateSubmit = (candidateData: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (!currentCandidate.value) return;

  const updatedCandidate: Candidate = {
    ...currentCandidate.value,
    ...candidateData,
    updatedAt: new Date()
  };
  
  saveCandidate(updatedCandidate);
  currentCandidate.value = updatedCandidate;
};

const handleEvaluationSubmit = (evaluationData: Omit<Evaluation, 'evaluatedAt'>) => {
  if (!currentCandidate.value) return;

  const evaluation: Evaluation = {
    ...evaluationData,
    evaluatedAt: new Date(),
    evaluatorId: currentUser.value!.id,
    evaluatorName: currentUser.value!.name,
  };

  saveEvaluation(evaluation);

  const jobConfig = getJobTypeConfigSync(selectedJobType.value);
  
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
    candidate: currentCandidate.value,
    evaluation,
    totalScore,
    weightedScore,
    criteriaScores,
  };

  evaluationResult.value = result;
  currentState.value = 'result';
};

const handleNewEvaluation = () => {
  currentState.value = 'job_selection';
  currentCandidate.value = null;
  evaluationResult.value = null;
  draftData.value = {};
};

const handleEditCandidate = (candidateId: string) => {
  const candidate = getCandidateById(candidateId);
  if (candidate) {
    currentCandidate.value = candidate;
    selectedJobType.value = candidate.appliedPosition;
    currentState.value = 'candidate_input';
    draftData.value = { candidateData: candidate };
  }
};

const handleDeleteCandidateConfirm = (candidateId: string) => {
  confirmModal.value = {
    isOpen: true,
    title: '候補者削除の確認',
    message: '本当にこの候補者を削除しますか？この操作は元に戻せません。',
    onConfirm: () => {
      deleteCandidate(candidateId);
      confirmModal.value.isOpen = false;
      if (currentCandidate.value && currentCandidate.value.id === candidateId) {
        currentCandidate.value = null;
        currentState.value = 'job_selection';
      }
    },
    onCancel: () => {
      confirmModal.value.isOpen = false;
    },
    type: 'danger',
    confirmText: '削除',
    cancelText: 'キャンセル'
  };
};

const handleLogout = () => {
  confirmModal.value = {
    isOpen: true,
    title: 'ログアウト確認',
    message: 'ログアウトしますか？未保存のデータは失われる可能性があります。',
    onConfirm: () => {
      currentUser.value = null;
      currentState.value = 'job_selection';
      currentCandidate.value = null;
      evaluationResult.value = null;
      draftData.value = {};
      confirmModal.value.isOpen = false;
    },
    onCancel: () => {
      confirmModal.value.isOpen = false;
    },
    type: 'warning',
    confirmText: 'ログアウト',
    cancelText: 'キャンセル'
  };
};

const handleNavigateHome = () => {
  const hasUnsavedData = draftData.value.candidateData || draftData.value.evaluationData;
  
  if (hasUnsavedData) {
    confirmModal.value = {
      isOpen: true,
      title: '未保存のデータがあります',
      message: 'ホームに戻ると、現在の入力内容が失われる可能性があります。続行しますか？',
      onConfirm: () => {
        confirmModal.value.isOpen = false;
        currentState.value = 'job_selection';
        currentCandidate.value = null;
        evaluationResult.value = null;
        draftData.value = {};
      },
      onCancel: () => {
        confirmModal.value.isOpen = false;
      },
      type: 'warning',
      confirmText: '続行',
      cancelText: 'キャンセル'
    };
  } else {
    currentState.value = 'job_selection';
    currentCandidate.value = null;
    evaluationResult.value = null;
    draftData.value = {};
  }
};

const handleNavigateBack = () => {
  const hasUnsavedData = draftData.value.candidateData || draftData.value.evaluationData;
  
  if (hasUnsavedData && currentState.value !== 'result' && !['database', 'analytics', 'monthly_dashboard', 'job_posting_management', 'company_info_management', 'interview_management'].includes(currentState.value)) {
    confirmModal.value = {
      isOpen: true,
      title: '前のページに戻りますか？',
      message: '現在の入力内容が失われる可能性があります。続行しますか？',
      onConfirm: () => {
        confirmModal.value.isOpen = false;
        navigateBackInternal();
      },
      onCancel: () => {
        confirmModal.value.isOpen = false;
      },
      type: 'warning',
      confirmText: '続行',
      cancelText: 'キャンセル'
    };
  } else {
    navigateBackInternal();
  }
};

const navigateBackInternal = () => {
  switch (currentState.value) {
    case 'candidate_input':
      currentState.value = 'job_selection';
      draftData.value = {};
      currentCandidate.value = null;
      break;
    case 'evaluation':
      currentState.value = 'candidate_input';
      draftData.value = {};
      break;
    case 'result':
      currentState.value = 'evaluation';
      break;
    case 'database':
    case 'analytics':
    case 'monthly_dashboard':
    case 'job_posting_management':
    case 'company_info_management':
    case 'interview_management':
      currentState.value = 'job_selection';
      break;
    default:
      break;
  }
};
</script>