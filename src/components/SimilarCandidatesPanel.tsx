import React, { useState } from 'react';
import { Candidate, Evaluation, SimilarCandidate } from '../types';
import { SimilarCandidateAnalyzer } from '../utils/similarCandidateAnalyzer';
import { 
  Users, 
  Target, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Star, 
  BarChart3, 
  TrendingUp, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Award,
  Briefcase,
  GraduationCap,
  Lightbulb
} from 'lucide-react';

interface SimilarCandidatesPanelProps {
  candidate: Candidate;
  evaluation?: Partial<Evaluation>;
}

export const SimilarCandidatesPanel: React.FC<SimilarCandidatesPanelProps> = ({
  candidate,
  evaluation
}) => {
  const [similarCandidates, setSimilarCandidates] = useState<SimilarCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showPrediction, setShowPrediction] = useState(false);
  const [prediction, setPrediction] = useState<{
    prediction: 'hire' | 'reject';
    confidence: number;
    reasons: string[];
  } | null>(null);
  const [analyzer] = useState(new SimilarCandidateAnalyzer());
  const [hiringStats, setHiringStats] = useState<any>(null);

  const findSimilarCandidates = () => {
    setLoading(true);
    
    try {
      // 類似候補者を検索
      const similar = analyzer.findSimilarCandidates(candidate);
      setSimilarCandidates(similar);
      
      // 採用統計を取得
      const stats = analyzer.getHiringStatistics();
      setHiringStats(stats);
      
      // 採用予測を実行
      if (evaluation) {
        const pred = analyzer.predictHiringOutcome(candidate, evaluation);
        setPrediction(pred);
        setShowPrediction(true);
      }
    } catch (error) {
      console.error('類似候補者検索エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (candidateId: string) => {
    setExpanded(expanded === candidateId ? null : candidateId);
  };

  const getScoreColor = (score: number) => {
    if (score >= 3.5) return 'text-green-600';
    if (score >= 2.5) return 'text-blue-600';
    if (score >= 1.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDecisionBadge = (decision?: string) => {
    if (decision === 'hired') {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center">
          <CheckCircle size={12} className="mr-1" />
          採用
        </span>
      );
    } else if (decision === 'rejected') {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center">
          <XCircle size={12} className="mr-1" />
          不採用
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
        未定
      </span>
    );
  };

  const getAverageScore = (scores: Record<string, number>): number => {
    const values = Object.values(scores);
    return values.length > 0 ? values.reduce((sum, score) => sum + score, 0) / values.length : 0;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <Users className="mr-2 text-blue-600" size={24} />
          類似候補者分析
        </h3>
        
        <button
          onClick={findSimilarCandidates}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin mr-2" size={16} />
              分析中...
            </>
          ) : (
            <>
              <Target className="mr-2" size={16} />
              類似候補者を検索
            </>
          )}
        </button>
      </div>

      {/* 採用統計情報 */}
      {hiringStats && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-3 flex items-center">
            <BarChart3 className="mr-2" size={18} />
            過去の採用統計
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-full mr-3">
                  <Users className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">総評価数</p>
                  <p className="text-lg font-bold text-gray-800">{hiringStats.totalEvaluated}名</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-full mr-3">
                  <CheckCircle className="text-green-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">採用数</p>
                  <p className="text-lg font-bold text-green-600">{hiringStats.hired}名</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-full mr-3">
                  <Target className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">採用率</p>
                  <p className="text-lg font-bold text-blue-600">{hiringStats.overallHiringRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* 職種別採用率 */}
          {Object.keys(hiringStats.jobTypeStats).length > 0 && (
            <div className="mt-3">
              <h5 className="text-sm font-medium text-gray-700 mb-2">職種別採用率</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.entries(hiringStats.jobTypeStats).map(([jobType, stats]: [string, any]) => (
                  <div key={jobType} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                    <span className="text-sm text-gray-700">{getJobTypeLabel(jobType)}</span>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-2">{stats.hired}/{stats.total}</span>
                      <span className="text-sm font-medium text-blue-600">{stats.rate.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 採用予測 */}
      {showPrediction && prediction && (
        <div className={`bg-gradient-to-br ${
          prediction.prediction === 'hire' 
            ? 'from-green-50 to-emerald-50 border-green-200' 
            : 'from-red-50 to-orange-50 border-red-200'
        } rounded-lg p-6 border`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-800 flex items-center">
              <Lightbulb className={`mr-2 ${
                prediction.prediction === 'hire' ? 'text-green-600' : 'text-red-600'
              }`} size={20} />
              データに基づく採用予測
            </h4>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              prediction.prediction === 'hire' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {prediction.prediction === 'hire' ? '採用予測' : '不採用予測'}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">予測信頼度</span>
              <span className="text-sm font-medium">{(prediction.confidence * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  prediction.prediction === 'hire' ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${prediction.confidence * 100}%` }}
              />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">予測根拠</h5>
            <ul className="space-y-1">
              {prediction.reasons.map((reason, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2"></span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            注意: この予測は過去の採用データに基づく参考情報であり、最終的な判断は評価者が行ってください。
          </div>
        </div>
      )}

      {/* 類似候補者リスト */}
      {similarCandidates.length > 0 ? (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">類似候補者 ({similarCandidates.length}名)</h4>
          
          {similarCandidates.map((similar) => (
            <div key={similar.candidate.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="p-4 bg-gray-50 flex justify-between items-center cursor-pointer"
                onClick={() => toggleExpand(similar.candidate.id)}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">{similar.candidate.name.charAt(0)}</span>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <h5 className="text-sm font-medium text-gray-800">{similar.candidate.name}</h5>
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        類似度: {similar.similarityScore.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                      <span className="flex items-center">
                        <Briefcase className="mr-1" size={12} />
                        {getJobTypeLabel(similar.candidate.appliedPosition)}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="mr-1" size={12} />
                        {similar.candidate.updatedAt.toLocaleDateString('ja-JP')}
                      </span>
                      {getDecisionBadge(similar.evaluation.finalDecision)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="mr-4">
                    <div className="flex items-center">
                      <Star className="text-yellow-500 mr-1" size={14} />
                      <span className={`text-sm font-medium ${getScoreColor(getAverageScore(similar.evaluation.scores))}`}>
                        {getAverageScore(similar.evaluation.scores).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  {expanded === similar.candidate.id ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </div>
              </div>
              
              {expanded === similar.candidate.id && (
                <div className="p-4 border-t border-gray-200">
                  {/* 類似理由 */}
                  <div className="mb-4">
                    <h6 className="text-sm font-medium text-gray-700 mb-2">類似点</h6>
                    <div className="flex flex-wrap gap-2">
                      {similar.similarityReasons.map((reason, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* 基本情報 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h6 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <GraduationCap className="mr-1" size={14} />
                        学歴・基本情報
                      </h6>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>年齢: {similar.candidate.age}歳</p>
                        <p>学歴: {similar.candidate.education}</p>
                        {similar.candidate.major && <p>専攻: {similar.candidate.major}</p>}
                      </div>
                    </div>
                    
                    <div>
                      <h6 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Award className="mr-1" size={14} />
                        評価結果
                      </h6>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>総合スコア: {getAverageScore(similar.evaluation.scores).toFixed(1)}/4.0</p>
                        <p>推奨: {
                          similar.evaluation.recommendation === 'hire' ? '採用推奨' :
                          similar.evaluation.recommendation === 'consider' ? '要検討' : '不採用'
                        }</p>
                        <p>最終判定: {
                          similar.evaluation.finalDecision === 'hired' ? '採用' :
                          similar.evaluation.finalDecision === 'rejected' ? '不採用' : '未定'
                        }</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* 経験・PR */}
                  <div className="mb-4">
                    <h6 className="text-sm font-medium text-gray-700 mb-2">経験・PR (抜粋)</h6>
                    <div className="text-xs text-gray-600">
                      <div className="bg-gray-50 p-2 rounded mb-2 max-h-16 overflow-y-auto">
                        {similar.candidate.experience.substring(0, 150)}
                        {similar.candidate.experience.length > 150 && '...'}
                      </div>
                      <div className="bg-gray-50 p-2 rounded max-h-16 overflow-y-auto">
                        {similar.candidate.selfPr.substring(0, 150)}
                        {similar.candidate.selfPr.length > 150 && '...'}
                      </div>
                    </div>
                  </div>
                  
                  {/* 評価コメント */}
                  {similar.evaluation.overallComment && (
                    <div>
                      <h6 className="text-sm font-medium text-gray-700 mb-2">評価コメント</h6>
                      <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded max-h-20 overflow-y-auto">
                        {similar.evaluation.overallComment}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="mx-auto mb-4 text-gray-400" size={48} />
          <h4 className="text-lg font-medium text-gray-700 mb-2">類似候補者データがありません</h4>
          <p className="text-gray-500 mb-4">
            「類似候補者を検索」ボタンをクリックして分析を開始するか、<br />
            より多くの候補者データを登録してください
          </p>
        </div>
      )}
    </div>
  );
};

// 職種名を取得する関数
function getJobTypeLabel(jobType: string): string {
  const jobTypeLabels: Record<string, string> = {
    'fresh_sales': '新卒営業',
    'experienced_sales': '中途営業',
    'specialist': '中途専門職',
    'engineer': 'エンジニア',
    'part_time_base': 'アルバイト（拠点）',
    'part_time_sales': 'アルバイト（営業）',
    'finance_accounting': '財務経理',
    'human_resources': '人事',
    'business_development': '事業開発',
    'marketing': 'マーケティング'
  };
  
  return jobTypeLabels[jobType] || jobType;
}