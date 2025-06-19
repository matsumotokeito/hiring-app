import React from 'react';
import { MatchingResult } from '../types';
import { ChatGPTEvaluator } from '../utils/chatGPTEvaluator';
import { SPIAnalyzer } from '../utils/spiAnalyzer';
import { ChatGPTInsights } from './ChatGPTInsights';
import { SPIDisplay } from './SPIDisplay';
import { InterviewManagement } from './InterviewManagement';
import { SimilarCandidatesPanel } from './SimilarCandidatesPanel';
import { 
  User, 
  Award, 
  TrendingUp, 
  FileText, 
  Download,
  CheckCircle,
  AlertCircle,
  XCircle,
  Brain,
  Star,
  Calendar,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  MessageSquare,
  Target,
  Heart,
  Compass,
  BarChart3,
  Users,
  FileUp
} from 'lucide-react';

interface ResultDisplayProps {
  result: MatchingResult;
  onNewEvaluation: () => void;
  user?: any; // User型を追加
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  result,
  onNewEvaluation,
  user
}) => {
  const { candidate, evaluation, totalScore, weightedScore, criteriaScores } = result;
  const [showChatGPTInsights, setShowChatGPTInsights] = React.useState(false);
  const [showSPIResults, setShowSPIResults] = React.useState(false);
  const [showInterviewManagement, setShowInterviewManagement] = React.useState(false);
  const [showDocuments, setShowDocuments] = React.useState(false);
  const [showSimilarCandidates, setShowSimilarCandidates] = React.useState(false);
  const [chatGPTEvaluator] = React.useState(new ChatGPTEvaluator());
  const [spiAnalyzer] = React.useState(new SPIAnalyzer());
  const [spiAnalysis] = React.useState(
    candidate.spiResults ? spiAnalyzer.analyzeSPI(candidate, candidate.appliedPosition) : null
  );

  const getRecommendationStyle = (recommendation: string) => {
    switch (recommendation) {
      case 'hire':
        return {
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: CheckCircle,
          iconColor: 'text-green-600',
          label: '採用推奨',
          description: '積極的に採用することを推奨します'
        };
      case 'consider':
        return {
          bg: 'bg-gradient-to-r from-yellow-50 to-amber-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: AlertCircle,
          iconColor: 'text-yellow-600',
          label: '要検討',
          description: '他の候補者と比較検討が必要です'
        };
      case 'reject':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-rose-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: XCircle,
          iconColor: 'text-red-600',
          label: '不採用',
          description: '採用は推奨しません'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: AlertCircle,
          iconColor: 'text-gray-600',
          label: '未設定',
          description: ''
        };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 3.5) return 'text-green-600';
    if (score >= 2.5) return 'text-blue-600';
    if (score >= 1.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 3.5) return 'bg-green-500';
    if (score >= 2.5) return 'bg-blue-500';
    if (score >= 1.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 3.5) return '優秀';
    if (score >= 2.5) return '良好';
    if (score >= 1.5) return 'やや不十分';
    return '不十分';
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

  // カテゴリ別にスコアを整理
  const scoresByCategory = criteriaScores.reduce((acc, cs) => {
    const category = cs.criterion.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(cs);
    return acc;
  }, {} as Record<string, typeof criteriaScores>);

  const exportResults = () => {
    const exportData = {
      候補者名: candidate.name,
      評価日: new Date().toLocaleDateString('ja-JP'),
      職種: evaluation.jobType,
      総合スコア: `${totalScore.toFixed(1)}/4`,
      加重スコア: `${weightedScore.toFixed(1)}/4`,
      推奨判定: recommendationStyle.label,
      SPI分析: candidate.spiResults && spiAnalysis ? {
        職種適合度: `${spiAnalysis.jobFitScore}/100`,
        管理職適性: `${spiAnalysis.managementPotential}/100`,
        チーム適合度: spiAnalysis.teamFit,
        推奨役割: spiAnalysis.recommendedRole,
        強み領域: spiAnalysis.strengthAreas,
        改善領域: spiAnalysis.developmentAreas,
        推奨事項: spiAnalysis.recommendations
      } : null,
      ChatGPT利用可能: chatGPTEvaluator.hasAPIKey(),
      カテゴリ別評価: Object.entries(scoresByCategory).map(([category, scores]) => ({
        カテゴリ: category,
        平均スコア: `${(scores.reduce((sum, cs) => sum + cs.score, 0) / scores.length).toFixed(1)}/4`,
        項目: scores.map(cs => ({
          項目名: cs.criterion.name,
          スコア: `${cs.score}/4`,
          評価: getScoreLabel(cs.score),
          重み: `${cs.criterion.weight}%`,
          コメント: cs.comment || '未記入'
        }))
      })),
      総合コメント: evaluation.overallComment || '未記入'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `評価結果_${candidate.name}_${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const recommendationStyle = getRecommendationStyle(evaluation.recommendation);
  const RecommendationIcon = recommendationStyle.icon;

  return (
    <div className="space-y-6">
      {/* ChatGPT AI分析 */}
      {showChatGPTInsights && (
        <ChatGPTInsights 
          candidate={candidate}
          evaluation={evaluation}
          evaluator={chatGPTEvaluator}
        />
      )}

      {/* SPI結果表示 */}
      {showSPIResults && candidate.spiResults && (
        <SPIDisplay 
          spiResults={candidate.spiResults} 
          spiAnalysis={spiAnalysis || undefined}
          showAnalysis={true}
        />
      )}

      {/* 面接管理 */}
      {showInterviewManagement && user && (
        <InterviewManagement 
          candidate={candidate}
          user={user}
        />
      )}

      {/* 類似候補者分析 */}
      {showSimilarCandidates && (
        <SimilarCandidatesPanel
          candidate={candidate}
          evaluation={evaluation}
        />
      )}

      {/* 書類表示 */}
      {showDocuments && candidate.documents && (
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FileUp className="mr-2" size={24} />
            アップロードされた書類
          </h3>
          
          {candidate.documents.resume && (
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-4">履歴書</h4>
              <div className="bg-white p-4 rounded-lg border border-blue-100 max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{candidate.documents.resume.content}</pre>
              </div>
            </div>
          )}
          
          {candidate.documents.careerHistory && (
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-4">職務経歴書</h4>
              <div className="bg-white p-4 rounded-lg border border-green-100 max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{candidate.documents.careerHistory.content}</pre>
              </div>
            </div>
          )}
          
          {candidate.documents.coverLetter && (
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-4">志望動機書</h4>
              <div className="bg-white p-4 rounded-lg border border-purple-100 max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{candidate.documents.coverLetter.content}</pre>
              </div>
            </div>
          )}
          
          {candidate.documents.portfolio && (
            <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-4">ポートフォリオ</h4>
              <div className="bg-white p-4 rounded-lg border border-amber-100 max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{candidate.documents.portfolio.content}</pre>
              </div>
            </div>
          )}
          
          {candidate.documents.others && candidate.documents.others.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-4">その他の書類</h4>
              {candidate.documents.others.map((doc, index) => (
                <div key={doc.id} className="mb-4 last:mb-0">
                  <h5 className="font-medium text-gray-700 mb-2">{doc.name}</h5>
                  <div className="bg-white p-4 rounded-lg border border-gray-100 max-h-64 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">{doc.content}</pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* メインヘッダー */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <User className="text-blue-600" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {candidate.name}
              </h1>
              <div className="flex items-center space-x-4 text-gray-600 mt-1">
                <span className="flex items-center">
                  <Mail className="mr-1" size={14} />
                  {candidate.email}
                </span>
                <span className="flex items-center">
                  <Calendar className="mr-1" size={14} />
                  {candidate.age}歳
                </span>
                {candidate.phone && (
                  <span className="flex items-center">
                    <Phone className="mr-1" size={14} />
                    {candidate.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowSimilarCandidates(!showSimilarCandidates)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                showSimilarCandidates 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              }`}
            >
              <Users className="mr-2" size={16} />
              類似候補者
            </button>
            
            <button
              onClick={() => setShowChatGPTInsights(!showChatGPTInsights)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                showChatGPTInsights 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              <Brain className="mr-2" size={16} />
              ChatGPT
              {!chatGPTEvaluator.hasAPIKey() && (
                <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
                  未設定
                </span>
              )}
            </button>
            {candidate.spiResults && (
              <button
                onClick={() => setShowSPIResults(!showSPIResults)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  showSPIResults 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                <Brain className="mr-2" size={16} />
                SPI結果
              </button>
            )}
            {candidate.documents && Object.values(candidate.documents).some(Boolean) && (
              <button
                onClick={() => setShowDocuments(!showDocuments)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  showDocuments 
                    ? 'bg-amber-600 text-white hover:bg-amber-700' 
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                }`}
              >
                <FileUp className="mr-2" size={16} />
                書類
              </button>
            )}
            {user && (
              <button
                onClick={() => setShowInterviewManagement(!showInterviewManagement)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  showInterviewManagement 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                <Users className="mr-2" size={16} />
                面接管理
              </button>
            )}
            <button
              onClick={exportResults}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="mr-2" size={16} />
              エクスポート
            </button>
            <button
              onClick={onNewEvaluation}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              新しい評価
            </button>
          </div>
        </div>

        {/* 判定結果 */}
        <div className={`p-6 rounded-xl border-2 ${recommendationStyle.bg} ${recommendationStyle.border}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <RecommendationIcon className={`mr-4 ${recommendationStyle.iconColor}`} size={32} />
              <div>
                <h2 className={`text-2xl font-bold ${recommendationStyle.text}`}>
                  {recommendationStyle.label}
                </h2>
                <p className={`text-sm ${recommendationStyle.text} mt-1`}>
                  {recommendationStyle.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-sm text-gray-600">評価スコア</div>
                  <div className={`text-2xl font-bold ${getScoreColor(weightedScore)}`}>
                    {weightedScore.toFixed(1)}/4.0
                  </div>
                </div>
                {candidate.spiResults && spiAnalysis && (
                  <div className="text-center">
                    <div className="text-sm text-gray-600">SPI適合度</div>
                    <div className={`text-2xl font-bold ${getScoreColor(spiAnalysis.jobFitScore / 25)}`}>
                      {spiAnalysis.jobFitScore}/100
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* スコア概要 */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${candidate.spiResults ? '4' : '3'} gap-6`}>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <Award className="text-blue-600 mr-3" size={24} />
            <div>
              <h3 className="text-sm font-medium text-gray-600">総合スコア</h3>
              <p className={`text-2xl font-bold ${getScoreColor(totalScore)}`}>
                {totalScore.toFixed(1)}/4.0
              </p>
              <p className="text-xs text-gray-500 mt-1">単純平均</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <TrendingUp className="text-green-600 mr-3" size={24} />
            <div>
              <h3 className="text-sm font-medium text-gray-600">加重スコア</h3>
              <p className={`text-2xl font-bold ${getScoreColor(weightedScore)}`}>
                {weightedScore.toFixed(1)}/4.0
              </p>
              <p className="text-xs text-gray-500 mt-1">重み付き平均</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <Target className="text-indigo-600 mr-3" size={24} />
            <div>
              <h3 className="text-sm font-medium text-gray-600">評価項目数</h3>
              <p className="text-2xl font-bold text-gray-800">
                {criteriaScores.length}項目
              </p>
              <p className="text-xs text-gray-500 mt-1">完了済み</p>
            </div>
          </div>
        </div>

        {candidate.spiResults && spiAnalysis && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <Brain className="text-blue-600 mr-3" size={24} />
              <div>
                <h3 className="text-sm font-medium text-gray-600">SPI適合度</h3>
                <p className={`text-2xl font-bold ${getScoreColor(spiAnalysis.jobFitScore / 25)}`}>
                  {spiAnalysis.jobFitScore}/100
                </p>
                <p className="text-xs text-gray-500 mt-1">職種適性</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* カテゴリ別スコア概要 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <BarChart3 className="mr-2" size={24} />
          カテゴリ別スコア概要
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(scoresByCategory).map(([category, scores]) => {
            const CategoryIcon = getCategoryIcon(category);
            const categoryColor = getCategoryColor(category);
            const categoryAverage = scores.reduce((sum, cs) => sum + cs.score, 0) / scores.length;
            const categoryWeight = scores.reduce((sum, cs) => sum + cs.criterion.weight, 0);
            
            return (
              <div key={category} className={`bg-${categoryColor}-50 border border-${categoryColor}-200 rounded-lg p-6`}>
                <div className="flex items-center mb-4">
                  <CategoryIcon className={`text-${categoryColor}-600 mr-3`} size={24} />
                  <h4 className={`text-lg font-semibold text-${categoryColor}-800`}>
                    {category}
                  </h4>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold text-${categoryColor}-700 mb-2`}>
                    {categoryAverage.toFixed(1)}/4.0
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    {scores.length}項目 • 重み合計: {categoryWeight}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full bg-${categoryColor}-500 transition-all duration-500`}
                      style={{ width: `${(categoryAverage / 4) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* カテゴリ別詳細評価 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <Star className="mr-2" size={24} />
          カテゴリ別詳細評価
        </h3>
        
        <div className="space-y-8">
          {Object.entries(scoresByCategory).map(([category, scores]) => {
            const CategoryIcon = getCategoryIcon(category);
            const categoryColor = getCategoryColor(category);
            const categoryAverage = scores.reduce((sum, cs) => sum + cs.score, 0) / scores.length;
            
            return (
              <div key={category} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <CategoryIcon className={`text-${categoryColor}-600 mr-3`} size={24} />
                    <h4 className="text-lg font-semibold text-gray-800">{category}</h4>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(categoryAverage)}`}>
                      {categoryAverage.toFixed(1)}/4.0
                    </div>
                    <div className="text-xs text-gray-500">カテゴリ平均</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {scores.map((cs) => (
                    <div key={cs.criterion.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <h5 className="font-medium text-gray-800">
                              {cs.criterion.name}
                            </h5>
                            <span className={`ml-3 text-xs text-${categoryColor}-600 bg-${categoryColor}-100 px-2 py-1 rounded`}>
                              重み: {cs.criterion.weight}%
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {cs.criterion.description}
                          </p>
                        </div>
                        <div className="text-right ml-6">
                          <div className={`text-2xl font-bold ${getScoreColor(cs.score)}`}>
                            {cs.score}/4
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {cs.score === 4 ? '優秀' : 
                             cs.score === 3 ? '良好' : 
                             cs.score === 2 ? 'やや不十分' : '不十分'}
                          </div>
                        </div>
                      </div>
                      
                      {/* スコアバー */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div
                          className={`h-2 rounded-full ${getScoreBarColor(cs.score)} transition-all duration-500`}
                          style={{ width: `${(cs.score / 4) * 100}%` }}
                        />
                      </div>

                      {cs.comment && (
                        <div className="bg-white p-3 rounded border border-gray-200">
                          <div className="flex items-start">
                            <MessageSquare className="text-gray-500 mr-2 mt-0.5" size={14} />
                            <p className="text-sm text-gray-700 leading-relaxed">{cs.comment}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 総合コメント */}
      {evaluation.overallComment && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FileText className="mr-2" size={24} />
            総合コメント
          </h3>
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <p className="text-gray-700 leading-relaxed text-lg">
              {evaluation.overallComment}
            </p>
          </div>
        </div>
      )}

      {/* 候補者詳細情報 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <User className="mr-2" size={24} />
          候補者詳細情報
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
              <GraduationCap className="mr-2" size={18} />
              学歴・基本情報
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">最終学歴:</span>
                <span className="font-medium">{candidate.education}</span>
              </div>
              {candidate.major && (
                <div className="flex justify-between">
                  <span className="text-gray-600">専攻:</span>
                  <span className="font-medium">{candidate.major}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">年齢:</span>
                <span className="font-medium">{candidate.age}歳</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">連絡先:</span>
                <span className="font-medium">{candidate.email}</span>
              </div>
              {candidate.spiResults && (
                <div className="flex justify-between">
                  <span className="text-gray-600">SPI総合:</span>
                  <span className="font-medium">{candidate.spiResults.totalScore} ({candidate.spiResults.percentile}%)</span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
              <Briefcase className="mr-2" size={18} />
              経験・PR
            </h4>
            <div className="space-y-4">
              <div>
                <span className="font-medium text-gray-700 block mb-2">職歴・経験:</span>
                <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg">
                  {candidate.experience}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700 block mb-2">自己PR:</span>
                <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg">
                  {candidate.selfPr}
                </p>
              </div>
              {candidate.interviewNotes && (
                <div>
                  <span className="font-medium text-gray-700 block mb-2">面接メモ:</span>
                  <p className="text-gray-600 text-sm leading-relaxed bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    {candidate.interviewNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};