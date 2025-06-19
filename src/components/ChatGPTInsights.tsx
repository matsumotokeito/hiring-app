import React, { useState } from 'react';
import { Candidate, Evaluation } from '../types';
import { ChatGPTEvaluator } from '../utils/chatGPTEvaluator';
import { getJobTypeConfigSync } from '../config/jobTypes';
import { 
  Brain, 
  MessageSquare, 
  TrendingDown,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Loader,
  Target,
  Heart,
  Compass,
  Star,
  BarChart3,
  Award,
  Users,
  TrendingUp
} from 'lucide-react';

interface ChatGPTInsightsProps {
  candidate: Candidate;
  evaluation?: Partial<Evaluation>;
  evaluator: ChatGPTEvaluator;
}

export const ChatGPTInsights: React.FC<ChatGPTInsightsProps> = ({
  candidate,
  evaluation,
  evaluator
}) => {
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [matchingAnalysis, setMatchingAnalysis] = useState<any>(null);
  const [turnoverAnalysis, setTurnoverAnalysis] = useState<any>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState<{
    evaluation: boolean;
    matching: boolean;
    turnover: boolean;
    questions: boolean;
  }>({
    evaluation: false,
    matching: false,
    turnover: false,
    questions: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const runEvaluation = async () => {
    if (!evaluator.hasAPIKey()) {
      setErrors({ ...errors, evaluation: 'APIキーが設定されていません' });
      return;
    }

    setLoading({ ...loading, evaluation: true });
    setErrors({ ...errors, evaluation: '' });

    try {
      const result = await evaluator.evaluateCandidate(candidate, evaluation);
      setAiAnalysis(result);
    } catch (error) {
      setErrors({ ...errors, evaluation: error instanceof Error ? error.message : 'エラーが発生しました' });
    } finally {
      setLoading({ ...loading, evaluation: false });
    }
  };

  const runMatchingAnalysis = async () => {
    if (!evaluator.hasAPIKey()) {
      setErrors({ ...errors, matching: 'APIキーが設定されていません' });
      return;
    }

    setLoading({ ...loading, matching: true });
    setErrors({ ...errors, matching: '' });

    try {
      const result = await evaluator.analyzeMatchingToCriteria(candidate, evaluation);
      setMatchingAnalysis(result);
    } catch (error) {
      setErrors({ ...errors, matching: error instanceof Error ? error.message : 'エラーが発生しました' });
    } finally {
      setLoading({ ...loading, matching: false });
    }
  };

  const runTurnoverAnalysis = async () => {
    if (!evaluator.hasAPIKey()) {
      setErrors({ ...errors, turnover: 'APIキーが設定されていません' });
      return;
    }

    setLoading({ ...loading, turnover: true });
    setErrors({ ...errors, turnover: '' });

    try {
      const result = await evaluator.analyzeTurnoverRisk(candidate, evaluation);
      setTurnoverAnalysis(result);
    } catch (error) {
      setErrors({ ...errors, turnover: error instanceof Error ? error.message : 'エラーが発生しました' });
    } finally {
      setLoading({ ...loading, turnover: false });
    }
  };

  const generateQuestions = async () => {
    if (!evaluator.hasAPIKey()) {
      setErrors({ ...errors, questions: 'APIキーが設定されていません' });
      return;
    }

    setLoading({ ...loading, questions: true });
    setErrors({ ...errors, questions: '' });

    try {
      const questions = await evaluator.generateInterviewQuestions(candidate);
      setInterviewQuestions(questions);
    } catch (error) {
      setErrors({ ...errors, questions: error instanceof Error ? error.message : 'エラーが発生しました' });
    } finally {
      setLoading({ ...loading, questions: false });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.0) return 'text-green-600';
    if (score >= 3.0) return 'text-blue-600';
    if (score >= 2.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4.5) return '優秀';
    if (score >= 4.0) return '良好';
    if (score >= 3.0) return '標準';
    if (score >= 2.0) return 'やや低い';
    return '要改善';
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return '低リスク';
      case 'medium': return '中リスク';
      case 'high': return '高リスク';
      default: return '不明';
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

  const jobConfig = getJobTypeConfigSync(candidate.appliedPosition);

  if (!evaluator.hasAPIKey()) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="text-yellow-600 mr-3\" size={24} />
          <div>
            <h3 className="font-medium text-yellow-800">ChatGPT AI機能を利用するには</h3>
            <p className="text-sm text-yellow-700 mt-1">
              OpenAI APIキーを設定してください。設定画面でAPIキーを入力できます。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 総合適性度スコア分析 */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Award className="mr-2 text-blue-600" size={20} />
            ChatGPT 総合適性度スコア
          </h3>
          <button
            onClick={runEvaluation}
            disabled={loading.evaluation}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {loading.evaluation ? (
              <Loader className="animate-spin mr-2\" size={16} />
            ) : (
              <RefreshCw className="mr-2" size={16} />
            )}
            {loading.evaluation ? 'スコア算出中...' : 'スコア算出'}
          </button>
        </div>

        {errors.evaluation && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="text-red-600 mr-2" size={16} />
              <span className="text-sm text-red-700">{errors.evaluation}</span>
            </div>
          </div>
        )}

        {aiAnalysis && (
          <div className="space-y-6">
            {/* メインスコア表示 */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <Star className="text-blue-600" size={32} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-gray-800">総合適性度スコア</h4>
                    <p className="text-gray-600">ChatGPT AIによる包括的評価</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-5xl font-bold ${getScoreColor(aiAnalysis.recommendedScore)} mb-2`}>
                    {aiAnalysis.recommendedScore}
                  </div>
                  <div className="text-lg text-gray-600">/5.0</div>
                  <div className={`text-sm font-medium ${getScoreColor(aiAnalysis.recommendedScore)} bg-gray-100 px-3 py-1 rounded-full mt-2`}>
                    {getScoreLabel(aiAnalysis.recommendedScore)}
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div
                  className={`h-4 rounded-full transition-all duration-1000 ${
                    aiAnalysis.recommendedScore >= 4.0 ? 'bg-green-500' :
                    aiAnalysis.recommendedScore >= 3.0 ? 'bg-blue-500' :
                    aiAnalysis.recommendedScore >= 2.0 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(aiAnalysis.recommendedScore / 5) * 100}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>信頼度: {Math.round(aiAnalysis.confidence * 100)}%</span>
                <span>求人票要件との適合度を総合評価</span>
              </div>
            </div>

            {/* スコア理由の詳細説明 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <Lightbulb className="mr-2 text-yellow-600" size={18} />
                スコア算出理由
              </h4>
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <p className="text-gray-700 leading-relaxed text-base">
                  {aiAnalysis.reasoning}
                </p>
              </div>
            </div>

            {/* 詳細分析結果 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 強み */}
              {aiAnalysis.strengths.length > 0 && (
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-4 flex items-center">
                    <CheckCircle className="mr-2\" size={18} />
                    検出された強み
                  </h4>
                  <ul className="space-y-3">
                    {aiAnalysis.strengths.map((strength: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                        <span className="text-green-700 text-sm leading-relaxed">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* リスク要因 */}
              {aiAnalysis.riskFactors.length > 0 && (
                <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-4 flex items-center">
                    <AlertTriangle className="mr-2" size={18} />
                    注意すべき要因
                  </h4>
                  <ul className="space-y-3">
                    {aiAnalysis.riskFactors.map((risk: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></div>
                        <span className="text-red-700 text-sm leading-relaxed">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 推奨事項 */}
            {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
                  <Target className="mr-2" size={18} />
                  採用判定推奨事項
                </h4>
                <ul className="space-y-3">
                  {aiAnalysis.recommendations.map((recommendation: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                      <span className="text-blue-700 text-sm leading-relaxed">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 基準マッチング分析 */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <BarChart3 className="mr-2 text-purple-600" size={20} />
            ChatGPT 基準別マッチング分析
          </h3>
          <button
            onClick={runMatchingAnalysis}
            disabled={loading.matching}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400"
          >
            {loading.matching ? (
              <Loader className="animate-spin mr-2\" size={16} />
            ) : (
              <RefreshCw className="mr-2" size={16} />
            )}
            {loading.matching ? '分析中...' : 'マッチング分析実行'}
          </button>
        </div>

        {errors.matching && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="text-red-600 mr-2" size={16} />
              <span className="text-sm text-red-700">{errors.matching}</span>
            </div>
          </div>
        )}

        {matchingAnalysis && (
          <div className="space-y-6">
            {/* 総合マッチングスコア */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <Award className="text-purple-600 mr-2" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">総合マッチング度</p>
                    <p className={`text-2xl font-bold ${getScoreColor(matchingAnalysis.overallMatchingScore)}`}>
                      {matchingAnalysis.overallMatchingScore}/5.0
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <CheckCircle className="text-green-600 mr-2" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">分析信頼度</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {Math.round(matchingAnalysis.overallConfidence * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 総合分析結果 */}
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                <Lightbulb className="mr-2 text-yellow-600" size={16} />
                総合分析結果
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {matchingAnalysis.overallReasoning}
              </p>
            </div>

            {/* 基準別詳細分析 */}
            {matchingAnalysis.criteriaAnalysis.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <Target className="mr-2" size={18} />
                  基準別詳細分析
                </h4>
                
                {/* カテゴリ別に整理 */}
                {['能力経験', '価値観', '志向性'].map(category => {
                  const categoryAnalysis = matchingAnalysis.criteriaAnalysis.filter((analysis: any) => {
                    const criterion = jobConfig.evaluationCriteria.find(c => c.id === analysis.criterionId);
                    return criterion?.category === category;
                  });

                  if (categoryAnalysis.length === 0) return null;

                  const CategoryIcon = getCategoryIcon(category);
                  const categoryColor = getCategoryColor(category);
                  const categoryAverage = categoryAnalysis.reduce((sum: number, analysis: any) => sum + analysis.matchingScore, 0) / categoryAnalysis.length;

                  return (
                    <div key={category} className={`bg-${categoryColor}-50 border border-${categoryColor}-200 rounded-lg overflow-hidden`}>
                      <div className={`bg-${categoryColor}-100 p-4 border-b border-${categoryColor}-200`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CategoryIcon className={`text-${categoryColor}-600 mr-3`} size={20} />
                            <h5 className={`font-semibold text-${categoryColor}-800`}>{category}</h5>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${getScoreColor(categoryAverage)}`}>
                              {categoryAverage.toFixed(1)}/5.0
                            </div>
                            <div className="text-xs text-gray-500">{categoryAnalysis.length}項目</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        {categoryAnalysis.map((analysis: any) => (
                          <div key={analysis.criterionId} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h6 className="font-medium text-gray-800 mb-1">{analysis.criterionName}</h6>
                                <p className="text-sm text-gray-600 leading-relaxed mb-2">
                                  {analysis.reasoning}
                                </p>
                              </div>
                              <div className="text-right ml-4">
                                <div className={`text-xl font-bold ${getScoreColor(analysis.matchingScore)}`}>
                                  {analysis.matchingScore}/5
                                </div>
                                <div className="text-xs text-gray-500">
                                  信頼度: {Math.round(analysis.confidence * 100)}%
                                </div>
                              </div>
                            </div>

                            {/* 根拠 */}
                            {analysis.evidences.length > 0 && (
                              <div className="mb-3">
                                <h6 className="text-sm font-medium text-green-800 mb-1 flex items-center">
                                  <CheckCircle className="mr-1" size={14} />
                                  根拠・強み
                                </h6>
                                <ul className="space-y-1">
                                  {analysis.evidences.map((evidence: string, index: number) => (
                                    <li key={index} className="text-sm text-green-700 flex items-start">
                                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 mt-2"></span>
                                      {evidence}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* 懸念点 */}
                            {analysis.concerns.length > 0 && (
                              <div className="mb-3">
                                <h6 className="text-sm font-medium text-red-800 mb-1 flex items-center">
                                  <AlertTriangle className="mr-1" size={14} />
                                  懸念点・不足要素
                                </h6>
                                <ul className="space-y-1">
                                  {analysis.concerns.map((concern: string, index: number) => (
                                    <li key={index} className="text-sm text-red-700 flex items-start">
                                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 mt-2"></span>
                                      {concern}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* 推奨事項 */}
                            {analysis.recommendations.length > 0 && (
                              <div>
                                <h6 className="text-sm font-medium text-blue-800 mb-1 flex items-center">
                                  <Lightbulb className="mr-1" size={14} />
                                  推奨事項
                                </h6>
                                <ul className="space-y-1">
                                  {analysis.recommendations.map((recommendation: string, index: number) => (
                                    <li key={index} className="text-sm text-blue-700 flex items-start">
                                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2"></span>
                                      {recommendation}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 全体的な強み・弱み・推奨事項 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchingAnalysis.strengths.length > 0 && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2 flex items-center">
                    <CheckCircle className="mr-2\" size={16} />
                    全体的な強み
                  </h4>
                  <ul className="space-y-1">
                    {matchingAnalysis.strengths.map((strength: string, index: number) => (
                      <li key={index} className="text-sm text-green-700 flex items-center">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {matchingAnalysis.weaknesses.length > 0 && (
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2 flex items-center">
                    <AlertTriangle className="mr-2" size={16} />
                    改善領域
                  </h4>
                  <ul className="space-y-1">
                    {matchingAnalysis.weaknesses.map((weakness: string, index: number) => (
                      <li key={index} className="text-sm text-red-700 flex items-center">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 採用推奨事項 */}
            {matchingAnalysis.recommendations.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  <Target className="mr-2" size={16} />
                  採用判定推奨事項
                </h4>
                <ul className="space-y-1">
                  {matchingAnalysis.recommendations.map((recommendation: string, index: number) => (
                    <li key={index} className="text-sm text-blue-700 flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 離職リスク分析 */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <TrendingDown className="mr-2 text-orange-600" size={20} />
            ChatGPT 離職リスク分析
          </h3>
          <button
            onClick={runTurnoverAnalysis}
            disabled={loading.turnover}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400"
          >
            {loading.turnover ? (
              <Loader className="animate-spin mr-2\" size={16} />
            ) : (
              <RefreshCw className="mr-2" size={16} />
            )}
            {loading.turnover ? '分析中...' : 'リスク分析実行'}
          </button>
        </div>

        {errors.turnover && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="text-red-600 mr-2" size={16} />
              <span className="text-sm text-red-700">{errors.turnover}</span>
            </div>
          </div>
        )}

        {turnoverAnalysis && (
          <div className="space-y-4">
            {/* リスクレベル */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <TrendingDown className="text-orange-600 mr-2" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">離職リスクレベル</p>
                    <p className={`text-2xl font-bold ${getRiskColor(turnoverAnalysis.riskLevel)}`}>
                      {getRiskLabel(turnoverAnalysis.riskLevel)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <AlertTriangle className="text-red-600 mr-2" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">離職確率</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {Math.round(turnoverAnalysis.riskScore * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* リスク要因と推奨対策 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {turnoverAnalysis.factors.length > 0 && (
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2 flex items-center">
                    <AlertTriangle className="mr-2\" size={16} />
                    リスク要因
                  </h4>
                  <ul className="space-y-1">
                    {turnoverAnalysis.factors.map((factor: string, index: number) => (
                      <li key={index} className="text-sm text-red-700 flex items-center">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {turnoverAnalysis.recommendations.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                    <Lightbulb className="mr-2" size={16} />
                    推奨対策
                  </h4>
                  <ul className="space-y-1">
                    {turnoverAnalysis.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-sm text-blue-700 flex items-center">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 面接質問生成 */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <MessageSquare className="mr-2 text-green-600" size={20} />
            ChatGPT 面接質問生成
          </h3>
          <button
            onClick={generateQuestions}
            disabled={loading.questions}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
          >
            {loading.questions ? (
              <Loader className="animate-spin mr-2\" size={16} />
            ) : (
              <RefreshCw className="mr-2" size={16} />
            )}
            {loading.questions ? '生成中...' : '質問生成'}
          </button>
        </div>

        {errors.questions && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="text-red-600 mr-2" size={16} />
              <span className="text-sm text-red-700">{errors.questions}</span>
            </div>
          </div>
        )}

        {interviewQuestions.length > 0 && (
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3">推奨面接質問</h4>
            <div className="space-y-4">
              {interviewQuestions.map((item, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start mb-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white text-xs rounded-full flex items-center justify-center mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-gray-800 font-medium mb-2">{item.question}</p>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-800 font-medium mb-1">質問の目的:</p>
                        <p className="text-sm text-blue-700">{item.purpose}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-9 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-700 font-medium mb-1">評価対象:</p>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {item.targetCriteria.map((criteria: string, i: number) => (
                          <li key={i}>{criteria}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium mb-1">期待される洞察:</p>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {item.expectedInsights.map((insight: string, i: number) => (
                          <li key={i}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};