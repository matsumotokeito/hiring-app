import { EvaluationCriterion, JobType } from '../types';

const STORAGE_KEY = 'hr_tool_evaluation_criteria';

// 評価基準データの保存・取得
export const saveEvaluationCriteria = (jobType: JobType, criteria: EvaluationCriterion[]): void => {
  const allCriteria = getAllEvaluationCriteria();
  allCriteria[jobType] = criteria;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allCriteria));
};

export const getEvaluationCriteria = (jobType: JobType): EvaluationCriterion[] => {
  const allCriteria = getAllEvaluationCriteria();
  return allCriteria[jobType] || [];
};

export const getAllEvaluationCriteria = (): Record<JobType, EvaluationCriterion[]> => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return {} as Record<JobType, EvaluationCriterion[]>;
  
  try {
    return JSON.parse(data);
  } catch {
    return {} as Record<JobType, EvaluationCriterion[]>;
  }
};

export const deleteEvaluationCriterion = (jobType: JobType, criterionId: string): void => {
  const criteria = getEvaluationCriteria(jobType);
  const updatedCriteria = criteria.filter(c => c.id !== criterionId);
  saveEvaluationCriteria(jobType, updatedCriteria);
};

export const addEvaluationCriterion = (jobType: JobType, criterion: EvaluationCriterion): void => {
  const criteria = getEvaluationCriteria(jobType);
  criteria.push(criterion);
  saveEvaluationCriteria(jobType, criteria);
};

export const updateEvaluationCriterion = (jobType: JobType, updatedCriterion: EvaluationCriterion): void => {
  const criteria = getEvaluationCriteria(jobType);
  const index = criteria.findIndex(c => c.id === updatedCriterion.id);
  if (index >= 0) {
    criteria[index] = updatedCriterion;
    saveEvaluationCriteria(jobType, criteria);
  }
};