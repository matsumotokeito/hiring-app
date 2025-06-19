export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  education: string;
  major: string;
  experience: string;
  selfPr: string;
  interviewNotes: string;
  appliedPosition: JobType;
  createdAt: Date;
  updatedAt: Date;
  // SPI適性検査結果を追加
  spiResults?: SPIResults;
  // 面接フェーズ情報を追加
  interviewPhase?: InterviewPhase;
  // 面接議事録を追加
  interviewMinutes?: InterviewMinutes[];
  // 履歴書・職務経歴書を追加
  documents?: CandidateDocuments;
}

// 候補者の書類情報
export interface CandidateDocuments {
  resume?: DocumentFile; // 履歴書
  careerHistory?: DocumentFile; // 職務経歴書
  coverLetter?: DocumentFile; // 志望動機書
  portfolio?: DocumentFile; // ポートフォリオ
  others?: DocumentFile[]; // その他の書類
}

export interface DocumentFile {
  id: string;
  name: string;
  type: 'resume' | 'career_history' | 'cover_letter' | 'portfolio' | 'other';
  content: string; // テキスト内容（OCRまたは手動入力）
  originalFileName?: string;
  uploadedAt: Date;
  extractedData?: ExtractedDocumentData; // ChatGPTによる抽出データ
}

// ChatGPTによる書類からの抽出データ
export interface ExtractedDocumentData {
  personalInfo?: {
    name?: string;
    age?: number;
    education?: string;
    major?: string;
    contact?: {
      email?: string;
      phone?: string;
      address?: string;
    };
  };
  workExperience?: WorkExperience[];
  skills?: string[];
  qualifications?: string[];
  achievements?: string[];
  selfPr?: string;
  motivations?: string[];
  careerGoals?: string[];
  extractedAt: Date;
  confidence: number; // 抽出の信頼度 0-1
}

export interface WorkExperience {
  company: string;
  position: string;
  period: {
    start: string;
    end: string;
  };
  responsibilities: string[];
  achievements: string[];
  skills: string[];
}

export type JobType = 'fresh_sales' | 'experienced_sales' | 'specialist' | 'engineer' | 'part_time_base' | 'part_time_sales' | 'finance_accounting' | 'human_resources' | 'business_development' | 'marketing';

export interface JobTypeConfig {
  id: JobType;
  name: string;
  description: string;
  evaluationCriteria: EvaluationCriterion[];
  // 面接プロセス情報を追加
  interviewProcess?: {
    phases: InterviewPhase[];
    allowSkipping: boolean;
  };
}

// 面接議事録の型定義を追加
export interface InterviewMinutes {
  id: string;
  candidateId: string;
  interviewId?: string;
  phase: 'casual' | 'first' | 'second' | 'final';
  interviewDate: Date;
  interviewer: string;
  interviewerId: string;
  duration: number; // 分
  location: string;
  attendees: string[];
  
  // 議事録内容
  agenda: string; // 面接の目的・アジェンダ
  questions: InterviewQuestion[];
  candidateResponses: CandidateResponse[];
  interviewerObservations: string; // 面接官の観察・印象
  keyInsights: string[]; // 重要な洞察
  concerns: string[]; // 懸念点
  strengths: string[]; // 強み
  
  // 評価
  overallImpression: string;
  rating: number; // 1-5
  recommendation: 'strong_hire' | 'hire' | 'consider' | 'no_hire';
  nextSteps: string;
  
  // メタデータ
  createdAt: Date;
  updatedAt: Date;
  isComplete: boolean;
  // ChatGPTによる自動分析
  aiAnalysis?: InterviewAIAnalysis;
}

// ChatGPTによる面接議事録の自動分析
export interface InterviewAIAnalysis {
  overallAssessment: string; // 総合評価
  strengthsIdentified: string[]; // 特定された強み
  concernsIdentified: string[]; // 特定された懸念点
  skillsAssessment: {
    communication: number; // 1-5
    technicalSkills: number;
    problemSolving: number;
    culturalFit: number;
    motivation: number;
  };
  recommendedQuestions: string[]; // 次回面接での推奨質問
  redFlags: string[]; // 注意すべき点
  positiveSignals: string[]; // ポジティブなシグナル
  confidenceLevel: number; // 分析の信頼度 0-1
  analyzedAt: Date;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  purpose: string; // 質問の目的
  targetCriteria: string[]; // 評価対象の基準
  response: string; // 候補者の回答
  followUpQuestions?: string[]; // 追加質問
  evaluatorNotes: string; // 面接官のメモ
  score?: number; // 1-5の評価
}

export interface CandidateResponse {
  questionId: string;
  response: string;
  clarity: number; // 回答の明確さ 1-5
  depth: number; // 回答の深さ 1-5
  relevance: number; // 質問との関連性 1-5
  enthusiasm: number; // 熱意・積極性 1-5
  notes: string; // 追加メモ
}

// 面接管理の型定義を追加
export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  interviewerId: string;
  interviewerName: string;
  interviewerEmail: string;
  phase: 'casual' | 'first' | 'second' | 'final';
  scheduledAt: Date;
  duration: number; // 分
  location: string;
  meetingUrl?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  feedback?: string;
  rating?: number; // 1-5
  nextPhase?: 'first' | 'second' | 'final' | 'offer' | 'reject';
  createdAt: Date;
  updatedAt: Date;
  // 簡素化：Google Calendar連携を削除
  reminderSent?: boolean;
  // 議事録への参照
  minutesId?: string;
}

export interface InterviewPhase {
  id?: 'casual' | 'first' | 'second' | 'final';
  name?: string;
  description?: string;
  duration?: number; // デフォルト時間（分）
  required?: boolean;
  canSkip?: boolean;
  interviewers?: string[]; // 面接官の役職・部署
  // 候補者の面接フェーズ状態
  currentPhase?: InterviewPhaseType;
  status?: 'scheduled' | 'completed' | 'pending';
  notes?: string;
  result?: 'pass' | 'fail' | 'pending';
}

export type InterviewPhaseType = 'casual_interview' | 'first_interview' | 'second_interview' | 'final_interview' | 'completed';

// 面接記録の型定義
export interface InterviewRecord {
  id: string;
  phase: InterviewPhaseType;
  scheduledDate: Date;
  interviewer: string;
  interviewerId: string;
  location: string;
  duration?: number;
  attendees?: string[];
  notes?: string;
  result?: 'pass' | 'fail' | 'pending';
  completedDate?: Date;
  evaluation?: InterviewEvaluation;
  nextPhase?: InterviewPhaseType;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewEvaluation {
  overallRating: number; // 1-5
  strengths: string[];
  concerns: string[];
  recommendation: 'strong_hire' | 'hire' | 'consider' | 'no_hire';
  culturalFit: number; // 1-5
  technicalSkills: number; // 1-5
  communicationSkills: number; // 1-5
  motivation: number; // 1-5
  teamFit: number; // 1-5
  comments: string;
}

// 求人票情報を追加
export interface JobPosting {
  id: string;
  jobType: JobType;
  title: string;
  department: string;
  location: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  requirements: {
    education: string[];
    experience: string[];
    skills: string[];
    qualifications: string[];
    languages: string[];
  };
  // 新しく追加する要件
  essentialRequirements: string[]; // 必須要件
  preferredRequirements: string[]; // 歓迎要件
  idealCandidate: string[]; // 求める人物像
  responsibilities: string[];
  benefits: string[];
  workingConditions: {
    workingHours: string;
    holidays: string;
    overtime: string;
    remoteWork: boolean;
    travelRequired: boolean;
  };
  companyInfo: {
    mission: string;
    vision: string;
    values: string[];
    culture: string;
  };
  careerPath: {
    initialRole: string;
    growthOpportunities: string[];
    trainingPrograms: string[];
  };
  applicationDeadline?: Date;
  startDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// 会社情報の型定義
export interface CompanyInfo {
  id: string;
  companyName: string;
  mission: string;
  vision: string;
  values: string[];
  culture: string;
  behavioralGuidelines: string[];
  evaluationPhilosophy: string;
  hiringCriteria: string[];
  workEnvironment: string;
  leadershipStyle: string;
  teamDynamics: string;
  performanceExpectations: string;
  careerDevelopment: string;
  diversityInclusion: string;
  additionalContext: string;
  updatedAt: Date;
  updatedBy: string;
  // 評価基準を追加
  evaluationCriteria?: EvaluationCriterion[];
}

// スコア説明の型定義を追加
export interface ScoreDescription {
  score: number; // 1-4
  label: string; // 例: "優秀", "良好", "普通", "要改善"
  description: string; // 詳細説明
}

export interface EvaluationCriterion {
  id: string;
  name: string;
  description: string;
  weight: number; // 重み（合計100%）
  category: '能力経験' | '価値観' | '志向性'; // 新しく追加
  // スコア説明を追加
  scoreDescriptions: ScoreDescription[];
}

// SPI適性検査の結果インターフェース
export interface SPIResults {
  testDate: Date; // 受検日
  language: SPILanguageScore; // 言語能力
  nonVerbal: SPINonVerbalScore; // 非言語能力
  personality: SPIPersonalityScore; // 性格検査
  totalScore: number; // 総合スコア（偏差値）
  percentile: number; // パーセンタイル順位
  testVersion: string; // SPI版本（SPI3など）
  testDuration: number; // 受検時間（分）
  reliability: 'high' | 'medium' | 'low'; // 回答の信頼性
}

export interface SPILanguageScore {
  totalScore: number; // 言語総合スコア（偏差値）
  vocabulary: number; // 語彙力
  reading: number; // 読解力
  grammar: number; // 文法・語法
  percentile: number; // パーセンタイル順位
}

export interface SPINonVerbalScore {
  totalScore: number; // 非言語総合スコア（偏差値）
  calculation: number; // 計算力
  logic: number; // 論理的思考
  spatial: number; // 空間把握
  dataAnalysis: number; // データ分析
  percentile: number; // パーセンタイル順位
}

export interface SPIPersonalityScore {
  // 行動特性
  behavioral: {
    leadership: number; // リーダーシップ
    teamwork: number; // チームワーク
    initiative: number; // 積極性
    persistence: number; // 粘り強さ
    adaptability: number; // 適応性
    communication: number; // コミュニケーション
  };
  // 思考特性
  cognitive: {
    analytical: number; // 分析的思考
    creative: number; // 創造的思考
    practical: number; // 実践的思考
    strategic: number; // 戦略的思考
  };
  // 情緒特性
  emotional: {
    stability: number; // 情緒安定性
    stress: number; // ストレス耐性
    optimism: number; // 楽観性
    empathy: number; // 共感性
  };
  // 職務適性
  jobFit: {
    sales: number; // 営業適性
    management: number; // 管理適性
    technical: number; // 技術適性
    creative: number; // 創造適性
    service: number; // サービス適性
  };
}

export interface Evaluation {
  candidateId: string;
  jobType: JobType;
  scores: Record<string, number>; // criterionId -> score (1-4)
  comments: Record<string, string>;
  overallComment: string;
  recommendation: 'hire' | 'consider' | 'reject';
  evaluatedAt: Date;
  isComplete: boolean;
  finalDecision?: 'hired' | 'rejected' | 'pending'; // 実際の採用結果
  performanceRating?: number; // 採用後のパフォーマンス評価（1-5）
  evaluatorId?: string; // 評価者ID
  evaluatorName?: string; // 評価者名
  // 離職関連データ
  hireDate?: Date; // 入社日
  turnoverDate?: Date; // 離職日（離職した場合）
  turnoverReason?: 'voluntary' | 'involuntary' | 'performance' | 'culture_fit' | 'career_change' | 'other'; // 離職理由
  isActive?: boolean; // 現在も在籍中かどうか
}

export interface MatchingResult {
  candidate: Candidate;
  evaluation: Evaluation;
  totalScore: number;
  weightedScore: number;
  criteriaScores: Array<{
    criterion: EvaluationCriterion;
    score: number;
    comment: string;
  }>;
  spiAnalysis?: SPIAnalysis; // SPI分析結果を追加
}

export interface SavedDraft {
  id: string;
  candidateData?: Partial<Candidate>;
  evaluationData?: Partial<Evaluation>;
  jobType: JobType;
  stage: 'candidate_input' | 'evaluation';
  savedAt: Date;
  title: string;
}

// SPI分析結果インターフェース
export interface SPIAnalysis {
  jobFitScore: number; // 職種適合度（0-100）
  strengthAreas: string[]; // 強み領域
  developmentAreas: string[]; // 改善領域
  personalityInsights: string[]; // 性格特性の洞察
  recommendedRole: string; // 推奨役割
  teamFit: 'high' | 'medium' | 'low'; // チーム適合度
  managementPotential: number; // 管理職適性（0-100）
  riskFactors: string[]; // リスク要因
  recommendations: string[]; // 推奨事項
}

export interface TrainingData {
  candidate: Candidate;
  evaluation: Evaluation;
  outcome: 'hired' | 'rejected';
  performanceRating?: number;
  // 離職データを追加
  turnoverData?: {
    turnedOver: boolean;
    daysToTurnover?: number;
    turnoverReason?: string;
  };
}

// 新しい型定義
export type UserRole = 'recruiter' | 'hr_strategy' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  permissions: Permission[];
}

export interface Permission {
  action: 'view' | 'create' | 'edit' | 'delete' | 'export' | 'manage_ai' | 'view_analytics';
  resource: 'candidates' | 'evaluations' | 'reports' | 'ai_model' | 'system_settings' | 'job_postings' | 'company_info' | 'interviews';
}

export interface HiringMetrics {
  period: 'week' | 'month' | 'quarter' | 'year';
  totalApplications: number;
  totalEvaluations: number;
  hiredCount: number;
  rejectedCount: number;
  pendingCount: number;
  averageTimeToHire: number; // 日数
  averageEvaluationScore: number;
  aiAccuracy: number;
  costPerHire: number;
  sourceEffectiveness: Record<string, {
    applications: number;
    hires: number;
    conversionRate: number;
  }>;
  jobTypeBreakdown: Record<JobType, {
    applications: number;
    hires: number;
    averageScore: number;
    timeToHire: number;
    // 離職関連メトリクスを追加
    turnoverRate: number;
    averageTenure: number;
  }>;
  // 離職関連の全体メトリクス
  overallTurnoverRate: number;
  turnoverByReason: Record<string, number>;
  // SPI関連メトリクス
  averageSPIScore?: number;
  spiJobFitCorrelation?: number;
}

export interface RecruitmentReport {
  id: string;
  title: string;
  type: 'weekly' | 'monthly' | 'quarterly' | 'custom';
  generatedAt: Date;
  generatedBy: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: HiringMetrics;
  insights: string[];
  recommendations: string[];
}

// AI予測結果の型定義
export interface AIPrediction {
  recommendedScore: number;
  confidence: number;
  reasoning: string;
  similarCandidates: string[];
  riskFactors: string[];
  strengths: string[];
}

// 類似候補者の型定義
export interface SimilarCandidate {
  candidate: Candidate;
  evaluation: Evaluation;
  similarityScore: number; // 0-100
  similarityReasons: string[];
}

// 採用履歴データの型定義
export interface HiringHistory {
  totalCandidates: number;
  hiredCandidates: number;
  rejectedCandidates: number;
  hiringRate: number;
  jobTypeBreakdown: Record<string, {
    total: number;
    hired: number;
    hiringRate: number;
  }>;
  recentDecisions: Array<{
    candidate: Candidate;
    evaluation: Evaluation;
    decision: 'hired' | 'rejected';
    decisionDate: Date;
  }>;
}