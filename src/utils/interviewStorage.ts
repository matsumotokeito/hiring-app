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

export const deleteInterview = (interviewId: string): void => {
  const interviews = getInterviews().filter(i => i.id !== interviewId);
  saveInterviews(interviews);
};

export const initializeInterviewProcess = (candidateId: string, jobType: string): void => {
  const existingInterviews = getInterviewsByCandidate(candidateId);
  if (existingInterviews.length > 0) return;
  
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