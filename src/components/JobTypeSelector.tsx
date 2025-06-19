import React from 'react';
import { JobType, JobTypeConfig } from '../types';
import { getAllJobTypesSync } from '../config/jobTypes';
import { getEvaluationCriteria } from '../utils/evaluationCriteriaStorage';
import { Users, Briefcase, Award, Code, Store, Phone, TrendingUp, Clock, Target, Heart, Compass, Star, CheckCircle, Calculator, UserCheck, Building, BarChart3 } from 'lucide-react';

interface JobTypeSelectorProps {
  selectedJobType: JobType;
  onJobTypeChange: (jobType: JobType) => void;
}

export const JobTypeSelector: React.FC<JobTypeSelectorProps> = ({
  selectedJobType,
  onJobTypeChange,
}) => {
  const jobTypes = getAllJobTypesSync();

  const getJobTypeIcon = (jobTypeId: JobType) => {
    switch (jobTypeId) {
      case 'fresh_sales':
        return Users;
      case 'experienced_sales':
        return Briefcase;
      case 'specialist':
        return Award;
      case 'engineer':
        return Code;
      case 'part_time_base':
        return Store;
      case 'part_time_sales':
        return Phone;
      case 'finance_accounting':
        return Calculator;
      case 'human_resources':
        return UserCheck;
      case 'business_development':
        return TrendingUp;
      case 'marketing':
        return BarChart3;
      default:
        return Users;
    }
  };

  const getJobTypeColor = (jobTypeId: JobType) => {
    switch (jobTypeId) {
      case 'fresh_sales':
        return 'blue';
      case 'experienced_sales':
        return 'green';
      case 'specialist':
        return 'purple';
      case 'engineer':
        return 'orange';
      case 'part_time_base':
        return 'pink';
      case 'part_time_sales':
        return 'indigo';
      case 'finance_accounting':
        return 'emerald';
      case 'human_resources':
        return 'rose';
      case 'business_development':
        return 'amber';
      case 'marketing':
        return 'cyan';
      default:
        return 'blue';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '能力経験': return Target;
      case '価値観': return Heart;
      case '志向性': return Compass;
      default: return Target;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '能力経験': return 'blue';
      case '価値観': return 'purple';
      case '志向性': return 'green';
      default: return 'gray';
    }
  };

  const groupCriteriaByCategory = (criteria: any[]) => {
    const categories = ['能力経験', '価値観', '志向性'];
    return categories.map(category => ({
      name: category,
      criteria: criteria.filter(c => c.category === category),
      icon: getCategoryIcon(category),
      color: getCategoryColor(category)
    }));
  };

  // 評価基準管理から実際の評価基準を取得
  const getActualEvaluationCriteria = (jobType: JobType) => {
    const managedCriteria = getEvaluationCriteria(jobType);
    if (managedCriteria && managedCriteria.length > 0) {
      return managedCriteria;
    }
    // フォールバック: デフォルトの評価基準
    const jobConfig = jobTypes.find(jt => jt.id === jobType);
    return jobConfig?.evaluationCriteria || [];
  };

  return (
    <div className="space-y-8">
      {/* ヘッダーセクション */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-6">
          <Target className="text-white" size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          評価対象の職種を選択
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          候補者が応募している職種に応じて、最適化された評価項目で科学的な判定を行います
        </p>
      </div>

      {/* 職種選択カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {jobTypes.map((jobType: JobTypeConfig) => {
          const Icon = getJobTypeIcon(jobType.id);
          const color = getJobTypeColor(jobType.id);
          const isSelected = selectedJobType === jobType.id;
          const actualCriteria = getActualEvaluationCriteria(jobType.id);
          
          return (
            <button
              key={jobType.id}
              onClick={() => onJobTypeChange(jobType.id)}
              className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left hover:shadow-xl hover:scale-105 transform ${
                isSelected
                  ? `border-${color}-500 bg-gradient-to-br from-${color}-50 to-${color}-100 shadow-xl scale-105`
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {/* 選択インジケーター */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className={`w-6 h-6 bg-${color}-500 rounded-full flex items-center justify-center`}>
                    <CheckCircle className="text-white" size={16} />
                  </div>
                </div>
              )}

              {/* アイコンとタイトル */}
              <div className="flex items-center mb-4">
                <div className={`p-4 rounded-xl ${
                  isSelected 
                    ? `bg-${color}-500 shadow-lg` 
                    : `bg-${color}-100 group-hover:bg-${color}-200`
                } transition-all duration-300`}>
                  <Icon 
                    className={`${
                      isSelected 
                        ? 'text-white' 
                        : `text-${color}-600`
                    }`} 
                    size={28} 
                  />
                </div>
                <div className="ml-4">
                  <h3 className={`font-bold text-lg ${
                    isSelected ? `text-${color}-800` : 'text-gray-800'
                  }`}>
                    {jobType.name}
                  </h3>
                </div>
              </div>
              
              <p className={`text-sm mb-6 leading-relaxed ${
                isSelected ? `text-${color}-700` : 'text-gray-600'
              }`}>
                {jobType.description}
              </p>
              
              {/* 統計情報 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className={`flex items-center ${
                    isSelected ? `text-${color}-600` : 'text-gray-500'
                  }`}>
                    <TrendingUp size={14} className="mr-2" />
                    評価項目
                  </span>
                  <span className={`font-bold ${
                    isSelected ? `text-${color}-800` : 'text-gray-700'
                  }`}>
                    {actualCriteria.length}項目
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className={`flex items-center ${
                    isSelected ? `text-${color}-600` : 'text-gray-500'
                  }`}>
                    <Clock size={14} className="mr-2" />
                    評価時間
                  </span>
                  <span className={`font-bold ${
                    isSelected ? `text-${color}-800` : 'text-gray-700'
                  }`}>
                    約10-15分
                  </span>
                </div>
              </div>

              {/* カテゴリ別項目数 */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className={`text-xs font-medium mb-3 ${
                  isSelected ? `text-${color}-600` : 'text-gray-500'
                }`}>
                  カテゴリ別評価項目:
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {groupCriteriaByCategory(actualCriteria).map((category) => (
                    <div key={category.name} className="text-center">
                      <div className={`font-bold text-lg ${
                        isSelected ? `text-${color}-700` : 'text-gray-600'
                      }`}>
                        {category.criteria.length}
                      </div>
                      <div className={`text-xs ${
                        isSelected ? `text-${color}-600` : 'text-gray-500'
                      }`}>
                        {category.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 面接プロセス情報 */}
              {jobType.interviewProcess && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className={`text-xs font-medium mb-2 ${
                    isSelected ? `text-${color}-600` : 'text-gray-500'
                  }`}>
                    面接プロセス:
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${
                      isSelected ? `text-${color}-600` : 'text-gray-500'
                    }`}>
                      {jobType.interviewProcess.phases.length}フェーズ
                    </span>
                    <span className={`text-xs ${
                      isSelected ? `text-${color}-600` : 'text-gray-500'
                    }`}>
                      {jobType.interviewProcess.allowSkipping ? 'スキップ可' : 'スキップ不可'}
                    </span>
                  </div>
                </div>
              )}

              {isSelected && (
                <div className={`mt-4 p-3 bg-${color}-500 rounded-lg border border-${color}-600 text-center`}>
                  <p className="text-white text-sm font-medium flex items-center justify-center">
                    <Star className="mr-2" size={16} />
                    選択中 - 候補者情報の入力に進んでください
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};