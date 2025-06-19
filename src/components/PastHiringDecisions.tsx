import React, { useState, useEffect } from 'react';
import { Candidate, Evaluation, User } from '../types';
import { getCandidates, getEvaluations, updateEvaluationOutcome } from '../utils/storage';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Star, 
  Filter, 
  Search, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Award,
  Briefcase,
  FileText,
  Clock,
  TrendingUp
} from 'lucide-react';

interface PastHiringDecisionsProps {
  user: User;
}

export const PastHiringDecisions: React.FC<PastHiringDecisionsProps> = ({ user }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [filteredData, setFilteredData] = useState<Array<{candidate: Candidate, evaluation: Evaluation}>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJobType, setFilterJobType] = useState<string>('all');
  const [filterDecision, setFilterDecision] = useState<'all' | 'hired' | 'rejected' | 'pending'>('all');
  const [sortField, setSortField] = useState<'name' | 'date' | 'score'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hiringStats, setHiringStats] = useState<{
    total: number;
    hired: number;
    rejected: number;
    pending: number;
    hiringRate: number;
    averageScore: number;
  }>({
    total: 0,
    hired: 0,
    rejected: 0,
    pending: 0,
    hiringRate: 0,
    averageScore: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [candidates, evaluations, searchTerm, filterJobType, filterDecision, sortField, sortDirection]);

  const loadData = () => {
    setLoading(true);
    const allCandidates = getCandidates();
    const allEvaluations = getEvaluations();
    
    // 評価が完了している候補者のみを対象とする
    const completedEvaluations = allEvaluations.filter(e => e.isComplete);
    const candidatesWithEvaluation = allCandidates.filter(c => 
      completedEvaluations.some(e => e.candidateId === c.id)
    );
    
    setCandidates(candidatesWithEvaluation);
    setEvaluations(completedEvaluations);
    
    // 統計情報を計算
    calculateStats(completedEvaluations);
    
    setLoading(false);
  };

  const calculateStats = (evaluations: Evaluation[]) => {
    const total = evaluations.length;
    const hired = evaluations.filter(e => e.finalDecision === 'hired').length;
    const rejected = evaluations.filter(e => e.finalDecision === 'rejected').length;
    const pending = evaluations.filter(e => !e.finalDecision || e.finalDecision === 'pending').length;
    
    const scores = evaluations.map(e => {
      const values = Object.values(e.scores);
      return values.length > 0 ? values.reduce((sum, score) => sum + score, 0) / values.length : 0;
    });
    
    const averageScore = scores.length > 0 
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
      : 0;
    
    setHiringStats({
      total,
      hired,
      rejected,
      pending,
      hiringRate: total > 0 ? (hired / total) * 100 : 0,
      averageScore
    });
  };

  const applyFilters = () => {
    // 評価と候補者を結合
    let filtered = candidates.map(candidate => {
      const evaluation = evaluations.find(e => e.candidateId === candidate.id);
      return { candidate, evaluation: evaluation! };
    });
    
    // 検索フィルター
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.candidate.name.toLowerCase().includes(term) ||
        item.candidate.email.toLowerCase().includes(term) ||
        item.candidate.education.toLowerCase().includes(term) ||
        item.candidate.experience.toLowerCase().includes(term)
      );
    }
    
    // 職種フィルター
    if (filterJobType !== 'all') {
      filtered = filtered.filter(item => item.candidate.appliedPosition === filterJobType);
    }
    
    // 採用判定フィルター
    if (filterDecision !== 'all') {
      if (filterDecision === 'hired') {
        filtered = filtered.filter(item => item.evaluation.finalDecision === 'hired');
      } else if (filterDecision === 'rejected') {
        filtered = filtered.filter(item => item.evaluation.finalDecision === 'rejected');
      } else if (filterDecision === 'pending') {
        filtered = filtered.filter(item => !item.evaluation.finalDecision || item.evaluation.finalDecision === 'pending');
      }
    }
    
    // ソート
    filtered.sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? a.candidate.name.localeCompare(b.candidate.name)
          : b.candidate.name.localeCompare(a.candidate.name);
      } else if (sortField === 'date') {
        return sortDirection === 'asc'
          ? a.evaluation.evaluatedAt.getTime() - b.evaluation.evaluatedAt.getTime()
          : b.evaluation.evaluatedAt.getTime() - a.evaluation.evaluatedAt.getTime();
      } else if (sortField === 'score') {
        const scoreA = getAverageScore(a.evaluation.scores);
        const scoreB = getAverageScore(b.evaluation.scores);
        return sortDirection === 'asc' ? scoreA - scoreB : scoreB - scoreA;
      }
      
      return 0;
    });
    
    setFilteredData(filtered);
  };

  const handleSort = (field: 'name' | 'date' | 'score') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleExpand = (candidateId: string) => {
    setExpandedId(expandedId === candidateId ? null : candidateId);
  };

  const updateDecision = (candidateId: string, decision: 'hired' | 'rejected') => {
    updateEvaluationOutcome(candidateId, decision);
    loadData();
  };

  const getAverageScore = (scores: Record<string, number>): number => {
    const values = Object.values(scores);
    return values.length > 0 ? values.reduce((sum, score) => sum + score, 0) / values.length : 0;
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
      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
        未定
      </span>
    );
  };

  const getJobTypeLabel = (jobType: string): string => {
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
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Users className="mr-3" size={28} />
              過去の採用判定履歴
            </h2>
            <p className="text-gray-600 mt-1">
              過去の候補者の採用・不採用データを管理し、採用判断の参考にします
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={loadData}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="mr-2" size={16} />
              更新
            </button>
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-3">
              <Users className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">総評価数</p>
              <p className="text-2xl font-bold text-gray-800">{hiringStats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full mr-3">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">採用数</p>
              <p className="text-2xl font-bold text-green-600">{hiringStats.hired}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full mr-3">
              <XCircle className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">不採用数</p>
              <p className="text-2xl font-bold text-red-600">{hiringStats.rejected}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-3">
              <TrendingUp className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">採用率</p>
              <p className="text-2xl font-bold text-blue-600">{hiringStats.hiringRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full mr-3">
              <Star className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">平均スコア</p>
              <p className="text-2xl font-bold text-yellow-600">{hiringStats.averageScore.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 検索・フィルター */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-1 md:col-span-2">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="候補者を検索..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>
          
          <div>
            <div className="flex items-center">
              <Filter className="text-gray-400 mr-2" size={18} />
              <select
                value={filterJobType}
                onChange={(e) => setFilterJobType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全職種</option>
                <option value="fresh_sales">新卒営業</option>
                <option value="experienced_sales">中途営業</option>
                <option value="specialist">中途専門職</option>
                <option value="engineer">エンジニア</option>
                <option value="part_time_base">アルバイト（拠点）</option>
                <option value="part_time_sales">アルバイト（営業）</option>
                <option value="finance_accounting">財務経理</option>
                <option value="human_resources">人事</option>
                <option value="business_development">事業開発</option>
                <option value="marketing">マーケティング</option>
              </select>
            </div>
          </div>
          
          <div>
            <div className="flex items-center">
              <Filter className="text-gray-400 mr-2" size={18} />
              <select
                value={filterDecision}
                onChange={(e) => setFilterDecision(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全ステータス</option>
                <option value="hired">採用</option>
                <option value="rejected">不採用</option>
                <option value="pending">未定</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 候補者リスト */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-medium text-gray-700 mb-2">候補者が見つかりません</h3>
            <p className="text-gray-500 mb-4">検索条件を変更するか、新しい候補者を評価してください</p>
          </div>
        ) : (
          <div>
            {/* テーブルヘッダー */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button 
                        onClick={() => handleSort('name')}
                        className="flex items-center"
                      >
                        候補者
                        {sortField === 'name' && (
                          sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      職種
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      判定
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button 
                        onClick={() => handleSort('score')}
                        className="flex items-center"
                      >
                        評価
                        {sortField === 'score' && (
                          sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button 
                        onClick={() => handleSort('date')}
                        className="flex items-center"
                      >
                        評価日
                        {sortField === 'date' && (
                          sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map(({ candidate, evaluation }) => (
                    <React.Fragment key={candidate.id}>
                      <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpand(candidate.id)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium">{candidate.name.charAt(0)}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                              <div className="text-sm text-gray-500">{candidate.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {getJobTypeLabel(candidate.appliedPosition)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getDecisionBadge(evaluation.finalDecision)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Star className={`mr-1 ${getScoreColor(getAverageScore(evaluation.scores))}`} size={16} />
                            <span className="text-sm font-medium">{getAverageScore(evaluation.scores).toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {evaluation.evaluatedAt.toLocaleDateString('ja-JP')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {!evaluation.finalDecision || evaluation.finalDecision === 'pending' ? (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateDecision(candidate.id, 'hired');
                                  }}
                                  className="p-1 text-green-600 hover:text-green-800"
                                  title="採用"
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateDecision(candidate.id, 'rejected');
                                  }}
                                  className="p-1 text-red-600 hover:text-red-800"
                                  title="不採用"
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpand(candidate.id);
                                }}
                                className="p-1 text-gray-600 hover:text-gray-800"
                                title="詳細"
                              >
                                {expandedId === candidate.id ? (
                                  <ChevronUp size={16} />
                                ) : (
                                  <ChevronDown size={16} />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      
                      {/* 詳細表示 */}
                      {expandedId === candidate.id && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium text-gray-800 mb-3">基本情報</h4>
                                <div className="space-y-2">
                                  <div className="flex items-start">
                                    <Calendar className="text-gray-500 mr-2 mt-0.5" size={16} />
                                    <div>
                                      <span className="text-sm text-gray-600 block">年齢</span>
                                      <span className="text-sm font-medium">{candidate.age}歳</span>
                                    </div>
                                  </div>
                                  <div className="flex items-start">
                                    <Briefcase className="text-gray-500 mr-2 mt-0.5" size={16} />
                                    <div>
                                      <span className="text-sm text-gray-600 block">職種</span>
                                      <span className="text-sm font-medium">{getJobTypeLabel(candidate.appliedPosition)}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-start">
                                    <Award className="text-gray-500 mr-2 mt-0.5" size={16} />
                                    <div>
                                      <span className="text-sm text-gray-600 block">学歴</span>
                                      <span className="text-sm font-medium">{candidate.education}</span>
                                      {candidate.major && (
                                        <span className="text-sm text-gray-500 block">専攻: {candidate.major}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-gray-800 mb-3">評価情報</h4>
                                <div className="space-y-2">
                                  <div className="flex items-start">
                                    <Star className="text-gray-500 mr-2 mt-0.5" size={16} />
                                    <div>
                                      <span className="text-sm text-gray-600 block">評価スコア</span>
                                      <span className={`text-sm font-medium ${getScoreColor(getAverageScore(evaluation.scores))}`}>
                                        {getAverageScore(evaluation.scores).toFixed(1)}/4.0
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-start">
                                    <FileText className="text-gray-500 mr-2 mt-0.5" size={16} />
                                    <div>
                                      <span className="text-sm text-gray-600 block">推奨</span>
                                      <span className="text-sm font-medium">
                                        {evaluation.recommendation === 'hire' ? '採用推奨' :
                                         evaluation.recommendation === 'consider' ? '要検討' : '不採用'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-start">
                                    <Clock className="text-gray-500 mr-2 mt-0.5" size={16} />
                                    <div>
                                      <span className="text-sm text-gray-600 block">評価日</span>
                                      <span className="text-sm font-medium">
                                        {evaluation.evaluatedAt.toLocaleDateString('ja-JP')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h4 className="font-medium text-gray-800 mb-3">評価コメント</h4>
                              <div className="bg-white p-3 rounded border border-gray-200">
                                <p className="text-sm text-gray-700">
                                  {evaluation.overallComment || '評価コメントなし'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                              <div className="text-sm text-gray-600">
                                最終判定: {evaluation.finalDecision === 'hired' ? '採用' : 
                                          evaluation.finalDecision === 'rejected' ? '不採用' : '未定'}
                              </div>
                              
                              {(!evaluation.finalDecision || evaluation.finalDecision === 'pending') && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => updateDecision(candidate.id, 'hired')}
                                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                                  >
                                    採用
                                  </button>
                                  <button
                                    onClick={() => updateDecision(candidate.id, 'rejected')}
                                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                  >
                                    不採用
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  {filteredData.length}件 / 全{candidates.length}件
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};