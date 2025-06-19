import React, { useState, useEffect } from 'react';
import { Candidate, JobType, User } from '../types';
import { getCandidates, getEvaluations, getEvaluationByCandidate } from '../utils/storage';
import { getInterviewsByCandidate } from '../utils/interviewStorage';
import { CandidateForm } from './CandidateForm';
import { 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Mail, 
  Phone, 
  GraduationCap, 
  Briefcase, 
  Star, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Users,
  Clock,
  RefreshCw
} from 'lucide-react';

interface CandidateDatabaseProps {
  user?: User;
}

export const CandidateDatabase: React.FC<CandidateDatabaseProps> = ({ user }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJobType, setFilterJobType] = useState<JobType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'hired' | 'rejected' | 'pending'>('all');
  const [sortField, setSortField] = useState<'name' | 'createdAt' | 'updatedAt' | 'score'>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCandidates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [candidates, searchTerm, filterJobType, filterStatus, sortField, sortDirection]);

  const loadCandidates = () => {
    setLoading(true);
    const allCandidates = getCandidates();
    setCandidates(allCandidates);
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...candidates];
    
    // 検索フィルター
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.education.toLowerCase().includes(term) ||
        c.experience.toLowerCase().includes(term)
      );
    }
    
    // 職種フィルター
    if (filterJobType !== 'all') {
      filtered = filtered.filter(c => c.appliedPosition === filterJobType);
    }
    
    // ステータスフィルター
    if (filterStatus !== 'all') {
      const evaluations = getEvaluations();
      
      if (filterStatus === 'hired') {
        filtered = filtered.filter(c => {
          const evaluation = evaluations.find(e => e.candidateId === c.id);
          return evaluation?.finalDecision === 'hired';
        });
      } else if (filterStatus === 'rejected') {
        filtered = filtered.filter(c => {
          const evaluation = evaluations.find(e => e.candidateId === c.id);
          return evaluation?.finalDecision === 'rejected';
        });
      } else if (filterStatus === 'pending') {
        filtered = filtered.filter(c => {
          const evaluation = evaluations.find(e => e.candidateId === c.id);
          return !evaluation?.finalDecision || evaluation.finalDecision === 'pending';
        });
      }
    }
    
    // ソート
    filtered.sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortField === 'createdAt') {
        return sortDirection === 'asc'
          ? a.createdAt.getTime() - b.createdAt.getTime()
          : b.createdAt.getTime() - a.createdAt.getTime();
      } else if (sortField === 'updatedAt') {
        return sortDirection === 'asc'
          ? a.updatedAt.getTime() - b.updatedAt.getTime()
          : b.updatedAt.getTime() - a.updatedAt.getTime();
      } else if (sortField === 'score') {
        const evaluations = getEvaluations();
        const evalA = evaluations.find(e => e.candidateId === a.id);
        const evalB = evaluations.find(e => e.candidateId === b.id);
        
        const scoreA = evalA ? Object.values(evalA.scores).reduce((sum, score) => sum + score, 0) / Object.values(evalA.scores).length : 0;
        const scoreB = evalB ? Object.values(evalB.scores).reduce((sum, score) => sum + score, 0) / Object.values(evalB.scores).length : 0;
        
        return sortDirection === 'asc' ? scoreA - scoreB : scoreB - scoreA;
      }
      
      return 0;
    });
    
    setFilteredCandidates(filtered);
  };

  const handleSort = (field: 'name' | 'createdAt' | 'updatedAt' | 'score') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowEditModal(true);
  };

  const handleDeleteCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    // 実際の削除処理はこちらに実装
    // deleteCandidate(selectedCandidate.id);
    setShowDeleteConfirm(false);
    loadCandidates();
  };

  const handleCandidateSubmit = (candidateData: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedCandidate) return;
    
    // 既存の候補者情報を更新
    const updatedCandidate: Candidate = {
      ...selectedCandidate,
      ...candidateData,
      updatedAt: new Date()
    };
    
    // 保存処理
    const updatedCandidates = candidates.map(c => 
      c.id === updatedCandidate.id ? updatedCandidate : c
    );
    
    setCandidates(updatedCandidates);
    setShowEditModal(false);
    loadCandidates();
  };

  const toggleDetails = (candidateId: string) => {
    setShowDetails(showDetails === candidateId ? null : candidateId);
  };

  const getCandidateStatus = (candidateId: string) => {
    const evaluation = getEvaluationByCandidate(candidateId);
    if (!evaluation) return 'pending';
    return evaluation.finalDecision || 'pending';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'hired': return { label: '採用', color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'rejected': return { label: '不採用', color: 'bg-red-100 text-red-800', icon: XCircle };
      default: return { label: '検討中', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle };
    }
  };

  const getJobTypeLabel = (jobType: JobType) => {
    switch (jobType) {
      case 'fresh_sales': return '新卒営業';
      case 'experienced_sales': return '中途営業';
      case 'specialist': return '中途専門職';
      case 'engineer': return 'エンジニア';
      case 'part_time_base': return 'アルバイト（拠点）';
      case 'part_time_sales': return 'アルバイト（営業）';
      case 'finance_accounting': return '財務経理';
      case 'human_resources': return '人事';
      case 'business_development': return '事業開発';
      case 'marketing': return 'マーケティング';
      default: return jobType;
    }
  };

  const getInterviewStatus = (candidateId: string) => {
    const interviews = getInterviewsByCandidate(candidateId);
    if (interviews.length === 0) return '未実施';
    
    const completedCount = interviews.filter(i => i.status === 'completed').length;
    const scheduledCount = interviews.filter(i => i.status === 'scheduled').length;
    
    if (completedCount > 0) {
      return `${completedCount}回完了${scheduledCount > 0 ? `/${scheduledCount}回予定` : ''}`;
    } else if (scheduledCount > 0) {
      return `${scheduledCount}回予定`;
    }
    
    return '未実施';
  };

  const getCandidateScore = (candidateId: string) => {
    const evaluation = getEvaluationByCandidate(candidateId);
    if (!evaluation || !evaluation.scores) return null;
    
    const scores = Object.values(evaluation.scores);
    if (scores.length === 0) return null;
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  const exportCandidates = () => {
    const dataToExport = filteredCandidates.map(candidate => {
      const evaluation = getEvaluationByCandidate(candidate.id);
      const status = getCandidateStatus(candidate.id);
      const score = getCandidateScore(candidate.id);
      
      return {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        age: candidate.age,
        education: candidate.education,
        major: candidate.major,
        appliedPosition: getJobTypeLabel(candidate.appliedPosition),
        experience: candidate.experience,
        selfPr: candidate.selfPr,
        interviewNotes: candidate.interviewNotes,
        status,
        score: score ? score.toFixed(1) : 'N/A',
        recommendation: evaluation?.recommendation || 'N/A',
        createdAt: candidate.createdAt.toLocaleDateString('ja-JP'),
        updatedAt: candidate.updatedAt.toLocaleDateString('ja-JP')
      };
    });
    
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `候補者データ_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Users className="mr-3" size={28} />
              候補者データベース
            </h2>
            <p className="text-gray-600 mt-1">
              登録済み候補者の検索・管理
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={exportCandidates}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="mr-2" size={16} />
              エクスポート
            </button>
            
            <button
              onClick={loadCandidates}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="mr-2" size={16} />
              更新
            </button>
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
                onChange={(e) => setFilterJobType(e.target.value as JobType | 'all')}
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'hired' | 'rejected' | 'pending')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全ステータス</option>
                <option value="hired">採用</option>
                <option value="rejected">不採用</option>
                <option value="pending">検討中</option>
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
        ) : filteredCandidates.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-medium text-gray-700 mb-2">候補者が見つかりません</h3>
            <p className="text-gray-500 mb-4">検索条件を変更するか、新しい候補者を追加してください</p>
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
                      ステータス
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
                      面接
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button 
                        onClick={() => handleSort('updatedAt')}
                        className="flex items-center"
                      >
                        更新日
                        {sortField === 'updatedAt' && (
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
                  {filteredCandidates.map((candidate) => {
                    const status = getCandidateStatus(candidate.id);
                    const statusInfo = getStatusLabel(status);
                    const StatusIcon = statusInfo.icon;
                    const score = getCandidateScore(candidate.id);
                    
                    return (
                      <React.Fragment key={candidate.id}>
                        <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleDetails(candidate.id)}>
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
                            <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center w-fit ${statusInfo.color}`}>
                              <StatusIcon className="mr-1" size={12} />
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {score ? (
                              <div className="flex items-center">
                                <Star className={`mr-1 ${
                                  score >= 4 ? 'text-yellow-500' : 
                                  score >= 3 ? 'text-blue-500' : 'text-gray-400'
                                }`} size={16} />
                                <span className="text-sm font-medium">{score.toFixed(1)}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">未評価</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-500 flex items-center">
                              <Clock className="mr-1" size={14} />
                              {getInterviewStatus(candidate.id)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {candidate.updatedAt.toLocaleDateString('ja-JP')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditCandidate(candidate);
                                }}
                                className="p-1 text-blue-600 hover:text-blue-800"
                                title="編集"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCandidate(candidate);
                                }}
                                className="p-1 text-red-600 hover:text-red-800"
                                title="削除"
                              >
                                <Trash2 size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDetails(candidate.id);
                                }}
                                className="p-1 text-gray-600 hover:text-gray-800"
                                title="詳細"
                              >
                                <Eye size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* 詳細表示 */}
                        {showDetails === candidate.id && (
                          <tr>
                            <td colSpan={7} className="px-6 py-4 bg-gray-50">
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
                                      <Mail className="text-gray-500 mr-2 mt-0.5" size={16} />
                                      <div>
                                        <span className="text-sm text-gray-600 block">メール</span>
                                        <span className="text-sm font-medium">{candidate.email}</span>
                                      </div>
                                    </div>
                                    {candidate.phone && (
                                      <div className="flex items-start">
                                        <Phone className="text-gray-500 mr-2 mt-0.5" size={16} />
                                        <div>
                                          <span className="text-sm text-gray-600 block">電話</span>
                                          <span className="text-sm font-medium">{candidate.phone}</span>
                                        </div>
                                      </div>
                                    )}
                                    <div className="flex items-start">
                                      <GraduationCap className="text-gray-500 mr-2 mt-0.5" size={16} />
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
                                  <h4 className="font-medium text-gray-800 mb-3">経験・PR</h4>
                                  <div className="space-y-3">
                                    <div>
                                      <span className="text-sm text-gray-600 block mb-1">職歴・経験</span>
                                      <p className="text-sm bg-gray-100 p-2 rounded max-h-24 overflow-y-auto">
                                        {candidate.experience}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-sm text-gray-600 block mb-1">自己PR</span>
                                      <p className="text-sm bg-gray-100 p-2 rounded max-h-24 overflow-y-auto">
                                        {candidate.selfPr}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex justify-between">
                                  <div className="flex space-x-2">
                                    {candidate.documents && Object.values(candidate.documents).some(Boolean) && (
                                      <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full flex items-center">
                                        <FileText className="mr-1" size={12} />
                                        書類あり
                                      </span>
                                    )}
                                    {candidate.spiResults && (
                                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full flex items-center">
                                        <Brain className="mr-1" size={12} />
                                        SPI結果あり
                                      </span>
                                    )}
                                    {candidate.interviewMinutes && candidate.interviewMinutes.length > 0 && (
                                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center">
                                        <MessageSquare className="mr-1" size={12} />
                                        面接議事録あり
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    登録: {candidate.createdAt.toLocaleDateString('ja-JP')} | 
                                    更新: {candidate.updatedAt.toLocaleDateString('ja-JP')}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  {filteredCandidates.length}件 / 全{candidates.length}件
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 編集モーダル */}
      {showEditModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  候補者情報編集 - {selectedCandidate.name}
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <CandidateForm
                jobType={selectedCandidate.appliedPosition}
                onCandidateSubmit={handleCandidateSubmit}
                initialData={selectedCandidate}
              />
            </div>
          </div>
        </div>
      )}

      {/* 削除確認モーダル */}
      {showDeleteConfirm && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <XCircle className="mx-auto mb-4 text-red-600" size={48} />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                候補者を削除しますか？
              </h3>
              <p className="text-gray-600 mb-6">
                {selectedCandidate.name}の情報を削除します。この操作は元に戻せません。
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  削除する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};