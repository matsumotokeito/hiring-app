import { Candidate, Evaluation, SavedDraft } from '../types';

const STORAGE_KEYS = {
  CANDIDATES: 'hr_tool_candidates',
  EVALUATIONS: 'hr_tool_evaluations',
  DRAFTS: 'hr_tool_drafts',
};

const VALID_JOB_TYPES = [
  'fresh_sales',
  'experienced_sales',
  'specialist',
  'engineer',
  'part_time_base',
  'part_time_sales',
  'finance_accounting',
  'human_resources',
  'business_development',
  'marketing'
];

export const saveCandidates = (candidates: Candidate[]): void => {
  localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
};

export const getCandidates = (): Candidate[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
  if (!data) return [];
  
  try {
    const candidates = JSON.parse(data);
    return candidates.map((c: any) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
      appliedPosition: VALID_JOB_TYPES.includes(c.appliedPosition) ? c.appliedPosition : 'fresh_sales',
      spiResults: c.spiResults ? {
        ...c.spiResults,
        testDate: new Date(c.spiResults.testDate)
      } : undefined,
    }));
  } catch (error) {
    console.error('Failed to parse candidates:', error);
    return [];
  }
};

export const saveCandidate = (candidate: Candidate): void => {
  const candidates = getCandidates();
  const existingIndex = candidates.findIndex(c => c.id === candidate.id);
  
  if (existingIndex >= 0) {
    candidates[existingIndex] = { ...candidate, updatedAt: new Date() };
  } else {
    candidates.push(candidate);
  }
  
  saveCandidates(candidates);
};

export const deleteCandidate = (candidateId: string): void => {
  const candidates = getCandidates().filter(c => c.id !== candidateId);
  saveCandidates(candidates);
  
  const evaluations = getEvaluations().filter(e => e.candidateId !== candidateId);
  saveEvaluations(evaluations);
  
  const drafts = getDrafts().filter(d => !d.candidateData || d.candidateData.id !== candidateId);
  saveDrafts(drafts);
};

export const getCandidateById = (candidateId: string): Candidate | null => {
  const candidates = getCandidates();
  return candidates.find(c => c.id === candidateId) || null;
};

export const saveEvaluations = (evaluations: Evaluation[]): void => {
  localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evaluations));
};

export const getEvaluations = (): Evaluation[] => {
  const data = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
  if (!data) return [];
  
  try {
    const evaluations = JSON.parse(data);
    return evaluations.map((e: any) => ({
      ...e,
      evaluatedAt: new Date(e.evaluatedAt),
      hireDate: e.hireDate ? new Date(e.hireDate) : undefined,
      turnoverDate: e.turnoverDate ? new Date(e.turnoverDate) : undefined
    }));
  } catch (error) {
    console.error('Failed to parse evaluations:', error);
    return [];
  }
};

export const saveEvaluation = (evaluation: Evaluation): void => {
  const evaluations = getEvaluations();
  const existingIndex = evaluations.findIndex(e => e.candidateId === evaluation.candidateId);
  
  if (existingIndex >= 0) {
    evaluations[existingIndex] = evaluation;
  } else {
    evaluations.push(evaluation);
  }
  
  saveEvaluations(evaluations);
};

export const updateEvaluationOutcome = (
  candidateId: string, 
  finalDecision: 'hired' | 'rejected', 
  performanceRating?: number
): void => {
  const evaluations = getEvaluations();
  const evaluationIndex = evaluations.findIndex(e => e.candidateId === candidateId);
  
  if (evaluationIndex >= 0) {
    evaluations[evaluationIndex].finalDecision = finalDecision;
    if (performanceRating !== undefined) {
      evaluations[evaluationIndex].performanceRating = performanceRating;
    }
    
    if (finalDecision === 'hired' && !evaluations[evaluationIndex].hireDate) {
      evaluations[evaluationIndex].hireDate = new Date();
      evaluations[evaluationIndex].isActive = true;
    }
    
    saveEvaluations(evaluations);
  }
};

export const saveDrafts = (drafts: SavedDraft[]): void => {
  localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
};

export const getDrafts = (): SavedDraft[] => {
  const data = localStorage.getItem(STORAGE_KEYS.DRAFTS);
  if (!data) return [];
  
  try {
    const drafts = JSON.parse(data);
    return drafts.map((d: any) => ({
      ...d,
      savedAt: new Date(d.savedAt),
    }));
  } catch (error) {
    console.error('Failed to parse drafts:', error);
    return [];
  }
};

export const saveDraft = (draft: SavedDraft): void => {
  const drafts = getDrafts();
  const existingIndex = drafts.findIndex(d => d.id === draft.id);
  
  if (existingIndex >= 0) {
    drafts[existingIndex] = { ...draft, savedAt: new Date() };
  } else {
    drafts.push(draft);
  }
  
  saveDrafts(drafts);
};

export const deleteDraft = (draftId: string): void => {
  const drafts = getDrafts().filter(d => d.id !== draftId);
  saveDrafts(drafts);
};

export const getEvaluationByCandidate = (candidateId: string): Evaluation | null => {
  const evaluations = getEvaluations();
  return evaluations.find(e => e.candidateId === candidateId) || null;
};

export const generateSampleData = (): void => {
  const candidates = getCandidates();
  const evaluations = getEvaluations();
  
  if (candidates.length > 0 || evaluations.length > 0) {
    return;
  }
  
  const sampleCandidates: Candidate[] = [
    {
      id: '1001',
      name: '山田 太郎',
      email: 'yamada@example.com',
      phone: '090-1234-5678',
      age: 28,
      education: '東京大学 経済学部',
      major: '経済学',
      experience: '株式会社ABC（2019-2023）：法人営業として3年間勤務。新規開拓から既存顧客管理まで担当。年間売上目標120%達成。',
      selfPr: '営業経験を通じて培った交渉力と顧客理解力を活かし、御社の事業拡大に貢献したいと考えています。',
      interviewNotes: '面接では落ち着いた受け答えで、質問に対して具体的な経験を交えて回答していた。',
      appliedPosition: 'experienced_sales',
      createdAt: new Date('2023-10-15'),
      updatedAt: new Date('2023-10-15')
    }
  ];
  
  const sampleEvaluations: Evaluation[] = [
    {
      candidateId: '1001',
      jobType: 'experienced_sales',
      scores: {
        'problem_solving': 4,
        'communication': 4
      },
      comments: {
        'problem_solving': '解決策の提案は具体的で実践的。',
        'communication': '明確かつ説得力のある伝達能力を持つ。'
      },
      overallComment: '営業経験が豊富で、特に顧客理解と関係構築に優れています。',
      recommendation: 'hire',
      evaluatedAt: new Date('2023-10-20'),
      isComplete: true,
      finalDecision: 'hired',
      evaluatorId: 'user1',
      evaluatorName: '評価者1',
      hireDate: new Date('2023-11-01'),
      isActive: true
    }
  ];
  
  saveCandidates(sampleCandidates);
  saveEvaluations(sampleEvaluations);
};

generateSampleData();