import { Interview, InterviewPhase, InterviewPhaseType } from '../types';

const STORAGE_KEY = 'hr_tool_interviews';

export const saveInterviews = (interviews: Interview[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(interviews));
};

export const getInterviews = (): Interview[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  
  try {
    const interviews = JSON.parse(data);
    return interviews.map((interview: any) => ({
      ...interview,
      scheduledAt: new Date(interview.scheduledAt),
      createdAt: new Date(interview.createdAt),
      updatedAt: new Date(interview.updatedAt),
    }));
  } catch {
    return [];
  }
};

export const saveInterview = (interview: Interview): void => {
  const interviews = getInterviews();
  const existingIndex = interviews.findIndex(i => i.id === interview.id);
  
  if (existingIndex >= 0) {
    interviews[existingIndex] = { ...interview, updatedAt: new Date() };
  } else {
    interviews.push(interview);
  }
  
  saveInterviews(interviews);
};

export const getInterviewsByCandidate = (candidateId: string): Interview[] => {
  return getInterviews().filter(interview => interview.candidateId === candidateId);
};

export const getInterviewsByInterviewer = (interviewerId: string): Interview[] => {
  return getInterviews().filter(interview => interview.interviewerId === interviewerId);
};

export const deleteInterview = (interviewId: string): void => {
  const interviews = getInterviews().filter(i => i.id !== interviewId);
  saveInterviews(interviews);
};

export const updateInterviewStatus = (
  interviewId: string, 
  status: Interview['status'],
  feedback?: string,
  rating?: number,
  nextPhase?: Interview['nextPhase']
): void => {
  const interviews = getInterviews();
  const interviewIndex = interviews.findIndex(i => i.id === interviewId);
  
  if (interviewIndex >= 0) {
    interviews[interviewIndex] = {
      ...interviews[interviewIndex],
      status,
      feedback: feedback || interviews[interviewIndex].feedback,
      rating: rating || interviews[interviewIndex].rating,
      nextPhase: nextPhase || interviews[interviewIndex].nextPhase,
      updatedAt: new Date()
    };
    saveInterviews(interviews);
  }
};

export const getUpcomingInterviews = (days: number = 7): Interview[] => {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  return getInterviews().filter(interview => 
    interview.status === 'scheduled' &&
    interview.scheduledAt >= now &&
    interview.scheduledAt <= futureDate
  );
};

// Add the missing getInterviewPhase function
export const getInterviewPhase = (candidateId: string): InterviewPhase | null => {
  const interviews = getInterviewsByCandidate(candidateId);
  if (interviews.length === 0) return null;
  
  // Get the latest interview phase
  const latestInterview = interviews.sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime())[0];
  
  return {
    currentPhase: latestInterview.phase,
    status: latestInterview.status === 'completed' ? 'completed' : 
            latestInterview.status === 'scheduled' ? 'scheduled' : 'pending',
    notes: latestInterview.notes || '',
    result: latestInterview.status === 'completed' ? 'pass' : 'pending'
  };
};

// Add interview process initialization function
export const initializeInterviewProcess = (candidateId: string, jobType: string): void => {
  // Check if interview process already exists
  const existingInterviews = getInterviewsByCandidate(candidateId);
  if (existingInterviews.length > 0) return;
  
  // Initialize with casual interview phase
  const initialInterview: Interview = {
    id: `interview_${candidateId}_casual_${Date.now()}`,
    candidateId,
    candidateName: '',
    candidateEmail: '',
    interviewerId: 'system',
    interviewerName: 'システム',
    interviewerEmail: 'system@company.com',
    phase: 'casual',
    scheduledAt: new Date(),
    duration: 30,
    location: '未設定',
    status: 'scheduled',
    notes: '面接プロセスが初期化されました',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  saveInterview(initialInterview);
};

// Add function to advance interview phase
export const advanceInterviewPhase = (
  candidateId: string,
  currentPhase: InterviewPhaseType,
  result: 'pass' | 'fail',
  nextPhase?: InterviewPhaseType
): void => {
  if (result === 'fail' || !nextPhase) return;
  
  // Create next interview phase
  const nextInterview: Interview = {
    id: `interview_${candidateId}_${nextPhase}_${Date.now()}`,
    candidateId,
    candidateName: '',
    candidateEmail: '',
    interviewerId: 'system',
    interviewerName: 'システム',
    interviewerEmail: 'system@company.com',
    phase: nextPhase,
    scheduledAt: new Date(),
    duration: nextPhase === 'final' ? 60 : 90,
    location: '未設定',
    status: 'scheduled',
    notes: `${currentPhase}から進行`,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  saveInterview(nextInterview);
};