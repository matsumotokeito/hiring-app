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
  spiResults?: SPIResults;
  interviewPhase?: InterviewPhase;
  interviewMinutes?: InterviewMinutes[];
  documents?: CandidateDocuments;
}

export interface CandidateDocuments {
  resume?: DocumentFile;
  careerHistory?: DocumentFile;
  coverLetter?: DocumentFile;
  portfolio?: DocumentFile;
  others?: DocumentFile[];
}

export interface DocumentFile {
  id: string;
  name: string;
  type: 'resume' | 'career_history' | 'cover_letter' | 'portfolio' | 'other';
  content: string;
  originalFileName?: string;
  uploadedAt: Date;
  extractedData?: ExtractedDocumentData;
}

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
  confidence: number;
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
  interviewProcess?: {
    phases: InterviewPhase[];
    allowSkipping: boolean;
  };
}

export interface InterviewMinutes {
  id: string;
  candidateId: string;
  interviewId?: string;
  phase: 'casual' | 'first' | 'second' | 'final';
  interviewDate: Date;
  interviewer: string;
  interviewerId: string;
  duration: number;
  location: string;
  attendees: string[];
  agenda: string;
  questions: InterviewQuestion[];
  candidateResponses: CandidateResponse[];
  interviewerObservations: string;
  keyInsights: string[];
  concerns: string[];
  strengths: string[];
  overallImpression: string;
  rating: number;
  recommendation: 'strong_hire' | 'hire' | 'consider' | 'no_hire';
  nextSteps: string;
  createdAt: Date;
  updatedAt: Date;
  isComplete: boolean;
  aiAnalysis?: InterviewAIAnalysis;
}

export interface InterviewAIAnalysis {
  overallAssessment: string;
  strengthsIdentified: string[];
  concernsIdentified: string[];
  skillsAssessment: {
    communication: number;
    technicalSkills: number;
    problemSolving: number;
    culturalFit: number;
    motivation: number;
  };
  recommendedQuestions: string[];
  redFlags: string[];
  positiveSignals: string[];
  confidenceLevel: number;
  analyzedAt: Date;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  purpose: string;
  targetCriteria: string[];
  response: string;
  followUpQuestions?: string[];
  evaluatorNotes: string;
  score?: number;
}

export interface CandidateResponse {
  questionId: string;
  response: string;
  clarity: number;
  depth: number;
  relevance: number;
  enthusiasm: number;
  notes: string;
}

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
  duration: number;
  location: string;
  meetingUrl?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  feedback?: string;
  rating?: number;
  nextPhase?: 'first' | 'second' | 'final' | 'offer' | 'reject';
  createdAt: Date;
  updatedAt: Date;
  reminderSent?: boolean;
  minutesId?: string;
}

export interface InterviewPhase {
  id?: 'casual' | 'first' | 'second' | 'final';
  name?: string;
  description?: string;
  duration?: number;
  required?: boolean;
  canSkip?: boolean;
  interviewers?: string[];
  currentPhase?: InterviewPhaseType;
  status?: 'scheduled' | 'completed' | 'pending';
  notes?: string;
  result?: 'pass' | 'fail' | 'pending';
}

export type InterviewPhaseType = 'casual_interview' | 'first_interview' | 'second_interview' | 'final_interview' | 'completed';

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
  overallRating: number;
  strengths: string[];
  concerns: string[];
  recommendation: 'strong_hire' | 'hire' | 'consider' | 'no_hire';
  culturalFit: number;
  technicalSkills: number;
  communicationSkills: number;
  motivation: number;
  teamFit: number;
  comments: string;
}

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
  essentialRequirements: string[];
  preferredRequirements: string[];
  idealCandidate: string[];
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
  evaluationCriteria?: EvaluationCriterion[];
}

export interface ScoreDescription {
  score: number;
  label: string;
  description: string;
}

export interface EvaluationCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  category: '能力経験' | '価値観' | '志向性';
  scoreDescriptions: ScoreDescription[];
}

export interface SPIResults {
  testDate: Date;
  language: SPILanguageScore;
  nonVerbal: SPINonVerbalScore;
  personality: SPIPersonalityScore;
  totalScore: number;
  percentile: number;
  testVersion: string;
  testDuration: number;
  reliability: 'high' | 'medium' | 'low';
}

export interface SPILanguageScore {
  totalScore: number;
  vocabulary: number;
  reading: number;
  grammar: number;
  percentile: number;
}

export interface SPINonVerbalScore {
  totalScore: number;
  calculation: number;
  logic: number;
  spatial: number;
  dataAnalysis: number;
  percentile: number;
}

export interface SPIPersonalityScore {
  behavioral: {
    leadership: number;
    teamwork: number;
    initiative: number;
    persistence: number;
    adaptability: number;
    communication: number;
  };
  cognitive: {
    analytical: number;
    creative: number;
    practical: number;
    strategic: number;
  };
  emotional: {
    stability: number;
    stress: number;
    optimism: number;
    empathy: number;
  };
  jobFit: {
    sales: number;
    management: number;
    technical: number;
    creative: number;
    service: number;
  };
}

export interface Evaluation {
  candidateId: string;
  jobType: JobType;
  scores: Record<string, number>;
  comments: Record<string, string>;
  overallComment: string;
  recommendation: 'hire' | 'consider' | 'reject';
  evaluatedAt: Date;
  isComplete: boolean;
  finalDecision?: 'hired' | 'rejected' | 'pending';
  performanceRating?: number;
  evaluatorId?: string;
  evaluatorName?: string;
  hireDate?: Date;
  turnoverDate?: Date;
  turnoverReason?: 'voluntary' | 'involuntary' | 'performance' | 'culture_fit' | 'career_change' | 'other';
  isActive?: boolean;
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
  spiAnalysis?: SPIAnalysis;
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

export interface SPIAnalysis {
  jobFitScore: number;
  strengthAreas: string[];
  developmentAreas: string[];
  personalityInsights: string[];
  recommendedRole: string;
  teamFit: 'high' | 'medium' | 'low';
  managementPotential: number;
  riskFactors: string[];
  recommendations: string[];
}

export interface TrainingData {
  candidate: Candidate;
  evaluation: Evaluation;
  outcome: 'hired' | 'rejected';
  performanceRating?: number;
  turnoverData?: {
    turnedOver: boolean;
    daysToTurnover?: number;
    turnoverReason?: string;
  };
}

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
  averageTimeToHire: number;
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
    turnoverRate: number;
    averageTenure: number;
  }>;
  overallTurnoverRate: number;
  turnoverByReason: Record<string, number>;
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

export interface AIPrediction {
  recommendedScore: number;
  confidence: number;
  reasoning: string;
  similarCandidates: string[];
  riskFactors: string[];
  strengths: string[];
}

export interface SimilarCandidate {
  candidate: Candidate;
  evaluation: Evaluation;
  similarityScore: number;
  similarityReasons: string[];
}

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