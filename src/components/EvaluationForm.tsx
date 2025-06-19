import React, { useState, useEffect } from 'react';
import { Candidate, JobType, Evaluation, SavedDraft, EvaluationCriterion } from '../types';
import { getJobTypeConfigSync } from '../config/jobTypes';
import { getEvaluationCriteria } from '../utils/evaluationCriteriaStorage';
import { saveEvaluation, saveDraft } from '../utils/storage';
import { ChatGPTEvaluator } from '../utils/chatGPTEvaluator';
import { ChatGPTInsights } from './ChatGPTInsights';
import { getCompanyInfo } from '../utils/companyInfoStorage';
import { Star, MessageSquare, CheckCircle, XCircle, AlertCircle, Save, Brain, Target, Heart, Compass, Settings, TrendingUp, Lightbulb, Info } from 'lucide-react';

interface EvaluationFormProps {
  candidate: Candidate;
  jobType: JobType;
  onEvaluationSubmit: (evaluation: Omit<Evaluation, 'evaluatedAt'>) => void;
  initialEvaluation?: Partial<Evaluation>;
}

export const EvaluationForm: React.FC<EvaluationFormProps> = ({
  candidate,
  jobType,
  onEvaluationSubmit,
  initialEvaluation,
}) => {
  // Defensive check: return null if candidate is undefined or null
  if (!candidate) {
    return null;
  }

  // 評価基準を取得する関数
  const getEvaluationCriteriaForJob = () => {
    // 1. まず会社情報から評価基準を取得
    const companyInfo = getCompanyInfo();
    if (companyInfo?.evaluationCriteria && companyInfo.evaluationCriteria.length > 0) {
      return companyInfo.evaluationCriteria;
    }
    
    // 2. 次に職種別の評価基準を取得
    const jobSpecificCriteria = getEvaluationCriteria(jobType);
    if (jobSpecificCriteria && jobSpecificCriteria.length > 0) {
      return jobSpecificCriteria;
    }
    
    // 3. 最後にデフォルトの評価基準を取得
    const jobConfig = getJobTypeConfigSync(jobType);
    return jobConfig.evaluationCriteria;
  };

  const [evaluationCriteria, setEvaluationCriteria] = useState<EvaluationCriterion[]>([]);
  const jobConfig = getJobTypeConfigSync(jobType);
  
  const [scores, setScores] = useState<Record<string, number>>(initialEvaluation?.scores || {});
  const [comments, setComments] = useState<Record<string, string>>(initialEvaluation?.comments || {});
  const [overallComment, setOverallComment] = useState(initialEvaluation?.overallComment || '');
  const [recommendation, setRecommendation] = useState<'hire' | 'consider' | 'reject'>(
    initialEvaluation?.recommendation || 'consider'
  );
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [showChatGPTInsights, setShowChatGPTInsights] = useState(false);
  const [chatGPTEvaluator] = useState(new ChatGPTEvaluator());
  const [showScoreHelp, setShowScoreHelp] = useState(false);

  // 評価基準を初期化
  useEffect(() => {
    const criteria = getEvaluationCriteriaForJob();
    setEvaluationCriteria(criteria);
  }, [jobType]);

  // 自動保存
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const timer = setTimeout(() => {
      handleAutoSave();
    }, 3000);

    return () => clearTimeout(timer);
  }, [scores, comments, overallComment, recommendation, autoSaveEnabled]);

  const handleAutoSave = () => {
    setSaveStatus('saving');
    
    const draft: SavedDraft = {
      id: `evaluation_${candidate.id}_${Date.now()}`,
      evaluationData: {
        candidateId: candidate.id,
        jobType,
        scores,
        comments,
        overallComment,
        recommendation,
        isComplete: false,
      },
      jobType,
      stage: 'evaluation',
      savedAt: new Date(),
      title: `${candidate?.name || '候補者'}の評価`,
    };

    saveDraft(draft);
    setSaveStatus('saved');
    
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleScoreChange = (criterionId: string, score: number) => {
    setScores({ ...scores, [criterionId]: score });
  };

  const handleCommentChange = (criterionId: string, comment: string) => {
    setComments({ ...comments, [criterionId]: comment });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const evaluation: Omit<Evaluation, 'evaluatedAt'> = {
      candidateId: candidate.id,
      jobType,
      scores,
      comments,
      overallComment,
      recommendation,
      isComplete: true,
    };
    onEvaluationSubmit(evaluation);
  };

  const isFormValid = () => {
    return evaluationCriteria.every(criterion => 
      scores[criterion.id] && scores[criterion.id] >= 1 && scores[criterion.id] <= 4
    );
  };

  const getCompletionPercentage = () => {
    const totalCriteria = evaluationCriteria.length;
    const completedCriteria = evaluationCriteria.filter(
      criterion => scores[criterion.id] && scores[criterion.id] >= 1
    ).length;
    return Math.round((completedCriteria / totalCriteria) * 100);
  };

  const getCurrentWeightedScore = () => {
    let weightedSum = 0;
    let totalWeight = 0;
    
    evaluationCriteria.forEach(criterion => {
      const score = scores[criterion.id];
      if (score) {
        weightedSum += score * (criterion.weight / 100);
        totalWeight += criterion.weight / 100;
      }
    });
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  };

  const getCategoryProgress = (categoryName: string) => {
    const categoryCriteria = evaluationCriteria.filter(c => c.category === categoryName);
    const completedInCategory = categoryCriteria.filter(c => scores[c.id]).length;
    return categoryCriteria.length > 0 ? (completedInCategory / categoryCriteria.length) * 100 : 0;
  };

  // カテゴリ別に評価項目を整理
  const categories = ['能力経験', '価値観', '志向性'];
  const criteriaByCategory = categories.map(category => ({
    name: category,
    criteria: evaluationCriteria.filter(c => c.category === category),
    icon: category === '能力経験' ? Target : category === '価値観' ? Heart : Compass
  })).filter(category => category.criteria.length > 0); // 空のカテゴリは表示しない

  // 現在の評価基準のスコア説明を取得
  const getScoreDescription = (criterion: EvaluationCriterion, score: number) => {
    if (!criterion || !criterion.scoreDescriptions) return null;
    return criterion.scoreDescriptions.find(desc => desc.score === score);
  };

  const ScoreButton = ({ 
    score, 
    isSelected, 
    onClick, 
    disabled = false,
    label
  }: { 
    score: number; 
    isSelected: boolean; 
    onClick: () => void;
    disabled?: boolean;
    label: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-16 h-16 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center ${
        isSelected
          ? 'bg-blue-500 border-blue-500 text-white shadow-lg transform scale-110'
          : 'border-gray-300 text-gray-500 hover:border-blue-400 hover:bg-blue-50 hover:scale-105'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className="font-bold text-lg">{score}</span>
      <span className="text-xs mt-1">{label}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* ChatGPT AI分析 */}
      {showChatGPTInsights && (
        <ChatGPTInsights 
          candidate={candidate}
          evaluation={{ scores, comments, overallComment, recommendation }}
          evaluator={chatGPTEvaluator}
        />
      )}

      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* ヘッダー */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              評価入力 - {candidate?.name || '候補者'}
            </h2>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-blue-800">
                  職種: {jobConfig.name}
                </p>
                <div className="flex items-center space-x-4 text-sm text-blue-700">
                  <span>進捗: {getCompletionPercentage()}%</span>
                  <span>{Object.keys(scores).length}/{evaluationCriteria.length} 項目完了</span>
                </div>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getCompletionPercentage()}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-blue-700">
                  各項目を適切なスコアで評価してください（1: 不十分, 2: やや不十分, 3: 良好, 4: 優秀）
                </p>
                <button 
                  onClick={() => setShowScoreHelp(!showScoreHelp)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Info size={16} />
                </button>
              </div>
              
              {showScoreHelp && (
                <div className="mt-3 bg-white p-3 rounded-lg border border-blue-100 text-sm">
                  <h4 className="font-medium text-blue-800 mb-2">評価スコアの説明</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-red-100 text-red-800 rounded-full flex items-center justify-center font-bold mr-2">1</div>
                      <span className="text-gray-700">不十分 - 基準を満たしていない</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center font-bold mr-2">2</div>
                      <span className="text-gray-700">やや不十分 - 改善が必要</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold mr-2">3</div>
                      <span className="text-gray-700">良好 - 期待を満たしている</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center font-bold mr-2">4</div>
                      <span className="text-gray-700">優秀 - 期待を上回っている</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4 ml-6">
            {/* リアルタイムスコア表示 */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">現在のスコア</div>
              <div className="text-2xl font-bold text-blue-600">
                {getCurrentWeightedScore().toFixed(1)}/4.0
              </div>
              <div className="text-xs text-gray-500">加重平均</div>
            </div>

            <button
              type="button"
              onClick={() => setShowChatGPTInsights(!showChatGPTInsights)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                showChatGPTInsights 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              <Brain className="mr-2" size={16} />
              ChatGPT AI
            </button>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoSaveEval"
                checked={autoSaveEnabled}
                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="autoSaveEval" className="text-sm text-gray-600">
                自動保存
              </label>
            </div>
            
            <button
              type="button"
              onClick={handleAutoSave}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {saveStatus === 'saving' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  保存中...
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <CheckCircle className="mr-2" size={16} />
                  保存済み
                </>
              ) : (
                <>
                  <Save className="mr-2" size={16} />
                  手動保存
                </>
              )}
            </button>
          </div>
        </div>

        {evaluationCriteria.length === 0 ? (
          <div className="text-center py-12 bg-yellow-50 rounded-lg border border-yellow-200">
            <Settings className="mx-auto mb-4 text-yellow-500" size={48} />
            <h3 className="text-lg font-medium text-yellow-800 mb-2">評価基準が設定されていません</h3>
            <p className="text-yellow-700 mb-4">
              会社情報管理の「評価基準管理」タブから評価基準を設定してください。
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* カテゴリ別評価セクション */}
            {criteriaByCategory.map((category, categoryIndex) => (
              <div key={category.name} className="space-y-6">
                <div className="flex items-center">
                  <category.icon className="text-blue-600 mr-2" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
                  <div className="ml-4 flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getCategoryProgress(category.name)}%` }}
                      />
                    </div>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {category.criteria.filter(c => scores[c.id]).length}/{category.criteria.length}
                  </span>
                </div>

                {category.criteria.map((criterion) => (
                  <div key={criterion.id} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 mb-1">
                          {criterion.name}
                          <span className="ml-3 text-sm font-normal text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            重み: {criterion.weight}%
                          </span>
                        </h4>
                        <p className="text-gray-600 text-sm">{criterion.description}</p>
                      </div>
                      <div className="text-right">
                        {scores[criterion.id] ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="mr-1" size={16} />
                            <span className="text-sm font-medium">評価: {scores[criterion.id]}</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-400">
                            <AlertCircle className="mr-1" size={16} />
                            <span className="text-sm">未評価</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-center space-x-4 mb-4">
                        {[1, 2, 3, 4].map((score) => {
                          // スコアの説明を取得
                          const scoreDesc = criterion.scoreDescriptions?.find(desc => desc.score === score);
                          const label = scoreDesc?.label || 
                                      (score === 1 ? '不十分' : 
                                       score === 2 ? 'やや不十分' : 
                                       score === 3 ? '良好' : '優秀');
                          
                          return (
                            <ScoreButton
                              key={score}
                              score={score}
                              label={label}
                              isSelected={scores[criterion.id] === score}
                              onClick={() => handleScoreChange(criterion.id, score)}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* スコア説明 */}
                    {scores[criterion.id] && criterion.scoreDescriptions && (
                      <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h5 className="font-medium text-blue-800 mb-2 flex items-center">
                          <Star className="mr-2" size={16} />
                          {scores[criterion.id]}点: {getScoreDescription(criterion, scores[criterion.id])?.label || ''}
                        </h5>
                        <p className="text-sm text-blue-700">
                          {getScoreDescription(criterion, scores[criterion.id])?.description || '説明なし'}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MessageSquare className="inline mr-1" size={16} />
                        コメント・根拠
                      </label>
                      <textarea
                        value={comments[criterion.id] || ''}
                        onChange={(e) => handleCommentChange(criterion.id, e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="評価の根拠や具体的な観察内容を記載してください。面接での回答や印象も含めて詳しく記載すると、ChatGPT分析の精度が向上します。"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* 総合評価セクション */}
            {getCompletionPercentage() === 100 && (
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">総合評価</h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    総合コメント
                  </label>
                  <textarea
                    value={overallComment}
                    onChange={(e) => setOverallComment(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="総合的な印象、採用判断の理由、今後の期待など。面接での全体的な印象や特筆すべき点を詳しく記載すると、ChatGPT分析がより具体的になります。"
                  />
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    採用推奨度
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'hire', label: '採用推奨', icon: CheckCircle, color: 'green', description: '積極的に採用したい' },
                      { value: 'consider', label: '要検討', icon: AlertCircle, color: 'yellow', description: '他候補者と比較検討' },
                      { value: 'reject', label: '不採用', icon: XCircle, color: 'red', description: '採用は推奨しない' },
                    ].map(({ value, label, icon: Icon, color, description }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRecommendation(value as any)}
                        className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                          recommendation === value
                            ? `border-${color}-500 bg-${color}-50 shadow-lg transform scale-105`
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Icon 
                          className={`mx-auto mb-3 ${
                            recommendation === value 
                              ? `text-${color}-600` 
                              : 'text-gray-400'
                          }`} 
                          size={32} 
                        />
                        <div className={`text-lg font-semibold mb-1 ${
                          recommendation === value 
                            ? `text-${color}-800` 
                            : 'text-gray-600'
                        }`}>
                          {label}
                        </div>
                        <div className={`text-sm ${
                          recommendation === value 
                            ? `text-${color}-700` 
                            : 'text-gray-500'
                        }`}>
                          {description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isFormValid()}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    isFormValid()
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isFormValid() ? '評価結果を確認' : `残り${evaluationCriteria.length - Object.keys(scores).length}項目の評価が必要です`}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};