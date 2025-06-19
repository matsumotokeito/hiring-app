import React, { useState, useEffect } from 'react';
import { Interview, Candidate, User, InterviewPhase } from '../types';
import { getInterviewsByCandidate, saveInterview, deleteInterview, updateInterviewStatus } from '../utils/interviewStorage';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User as UserIcon, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  Star,
  Video,
  Mail,
  Phone,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface InterviewManagementProps {
  candidate: Candidate;
  user: User;
}

const INTERVIEW_PHASES: InterviewPhase[] = [
  {
    id: 'casual',
    name: 'カジュアル面談',
    description: '候補者との初回面談',
    duration: 30,
    required: true,
    canSkip: false,
    interviewers: ['人事担当者']
  },
  {
    id: 'first',
    name: '1次面接',
    description: '基本的な適性確認',
    duration: 60,
    required: true,
    canSkip: true, // カジュアル面談担当者が人事の場合
    interviewers: ['人事担当者', '現場責任者']
  },
  {
    id: 'second',
    name: '2次面接',
    description: '詳細な技能・適性確認',
    duration: 90,
    required: false,
    canSkip: true, // 1次面接の結果次第
    interviewers: ['部門長', '現場責任者']
  },
  {
    id: 'final',
    name: '最終面接',
    description: '最終的な採用判定',
    duration: 60,
    required: true,
    canSkip: false,
    interviewers: ['役員', '部門長']
  }
];

export const InterviewManagement: React.FC<InterviewManagementProps> = ({
  candidate,
  user
}) => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  useEffect(() => {
    loadInterviews();
  }, [candidate.id]);

  const loadInterviews = () => {
    const candidateInterviews = getInterviewsByCandidate(candidate.id);
    setInterviews(candidateInterviews.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime()));
  };

  const handleScheduleInterview = () => {
    setSelectedInterview(null);
    setShowScheduleModal(true);
  };

  const handleEditInterview = (interview: Interview) => {
    setSelectedInterview(interview);
    setShowScheduleModal(true);
  };

  const handleDeleteInterview = async (interview: Interview) => {
    if (!confirm('この面接予定を削除しますか？')) return;

    try {
      deleteInterview(interview.id);
      loadInterviews();
    } catch (error) {
      console.error('Failed to delete interview:', error);
      alert('面接の削除に失敗しました');
    }
  };

  const handleCompleteInterview = (interview: Interview) => {
    // 面接完了処理のモーダルを表示
    const feedback = prompt('面接のフィードバックを入力してください:');
    const ratingStr = prompt('評価を入力してください (1-5):');
    const rating = ratingStr ? parseInt(ratingStr) : undefined;
    
    if (feedback !== null) {
      updateInterviewStatus(interview.id, 'completed', feedback, rating);
      loadInterviews();
    }
  };

  const getNextPhase = (currentPhase: Interview['phase']): Interview['phase'] | null => {
    const currentIndex = INTERVIEW_PHASES.findIndex(p => p.id === currentPhase);
    if (currentIndex < INTERVIEW_PHASES.length - 1) {
      return INTERVIEW_PHASES[currentIndex + 1].id;
    }
    return null;
  };

  const getPhaseInfo = (phase: Interview['phase']) => {
    return INTERVIEW_PHASES.find(p => p.id === phase);
  };

  const getStatusColor = (status: Interview['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Interview['status']) => {
    switch (status) {
      case 'scheduled': return Clock;
      case 'completed': return CheckCircle;
      case 'cancelled': return XCircle;
      case 'rescheduled': return RefreshCw;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Calendar className="mr-2" size={20} />
              面接管理 - {candidate.name}
            </h3>
            <p className="text-gray-600 mt-1">
              面接スケジュールの管理
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleScheduleInterview}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="mr-2" size={16} />
              面接予定
            </button>
          </div>
        </div>
      </div>

      {/* 面接フェーズ進捗 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="font-semibold text-gray-800 mb-4">面接フェーズ進捗</h4>
        <div className="flex items-center justify-between">
          {INTERVIEW_PHASES.map((phase, index) => {
            const phaseInterview = interviews.find(i => i.phase === phase.id);
            const isCompleted = phaseInterview?.status === 'completed';
            const isScheduled = phaseInterview?.status === 'scheduled';
            const isCurrent = !isCompleted && !isScheduled && 
              (index === 0 || INTERVIEW_PHASES.slice(0, index).every(p => 
                interviews.find(i => i.phase === p.id)?.status === 'completed'
              ));
            
            return (
              <div key={phase.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isCompleted 
                    ? 'border-green-500 bg-green-500 text-white' 
                    : isScheduled
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : isCurrent
                        ? 'border-yellow-500 bg-yellow-500 text-white'
                        : 'border-gray-300 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle size={16} />
                  ) : isScheduled ? (
                    <Clock size={16} />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
                <div className="ml-2 text-center">
                  <div className={`text-sm font-medium ${
                    isCompleted ? 'text-green-600' : 
                    isScheduled ? 'text-blue-600' : 
                    isCurrent ? 'text-yellow-600' : 'text-gray-500'
                  }`}>
                    {phase.name}
                  </div>
                  {phaseInterview && (
                    <div className="text-xs text-gray-500">
                      {phaseInterview.scheduledAt.toLocaleDateString('ja-JP')}
                    </div>
                  )}
                </div>
                {index < INTERVIEW_PHASES.length - 1 && (
                  <div className={`mx-4 w-12 h-0.5 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 面接一覧 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="font-semibold text-gray-800 mb-4">面接予定一覧</h4>
        
        {interviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="mx-auto mb-2" size={48} />
            <p>まだ面接予定がありません</p>
            <button
              onClick={handleScheduleInterview}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              最初の面接を予定する
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.map((interview) => {
              const phaseInfo = getPhaseInfo(interview.phase);
              const StatusIcon = getStatusIcon(interview.status);
              
              return (
                <div key={interview.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h5 className="font-medium text-gray-800">{phaseInfo?.name}</h5>
                        <span className={`ml-3 px-2 py-1 rounded text-xs font-medium ${getStatusColor(interview.status)}`}>
                          <StatusIcon className="inline mr-1" size={12} />
                          {interview.status === 'scheduled' ? '予定' :
                           interview.status === 'completed' ? '完了' :
                           interview.status === 'cancelled' ? 'キャンセル' : '変更'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="mr-2" size={14} />
                          {interview.scheduledAt.toLocaleString('ja-JP')} ({interview.duration}分)
                        </div>
                        <div className="flex items-center">
                          <UserIcon className="mr-2" size={14} />
                          {interview.interviewerName}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-2" size={14} />
                          {interview.location}
                        </div>
                        {interview.meetingUrl && (
                          <div className="flex items-center">
                            <Video className="mr-2" size={14} />
                            <a 
                              href={interview.meetingUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              会議に参加
                            </a>
                          </div>
                        )}
                      </div>

                      {interview.notes && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                          <MessageSquare className="inline mr-1" size={14} />
                          {interview.notes}
                        </div>
                      )}

                      {interview.feedback && (
                        <div className="mt-3 p-2 bg-green-50 rounded text-sm">
                          <div className="flex items-center mb-1">
                            <CheckCircle className="mr-1 text-green-600" size={14} />
                            <span className="font-medium text-green-800">フィードバック</span>
                            {interview.rating && (
                              <div className="ml-2 flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={12}
                                    className={star <= interview.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          <p className="text-green-700">{interview.feedback}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {interview.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => handleCompleteInterview(interview)}
                            className="p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                            title="面接完了"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleEditInterview(interview)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                            title="編集"
                          >
                            <Edit size={16} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteInterview(interview)}
                        className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                        title="削除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 面接予定モーダル */}
      {showScheduleModal && (
        <InterviewScheduleModal
          candidate={candidate}
          interview={selectedInterview}
          user={user}
          onSave={() => {
            setShowScheduleModal(false);
            loadInterviews();
          }}
          onCancel={() => setShowScheduleModal(false)}
        />
      )}
    </div>
  );
};

// 面接予定モーダルコンポーネント
interface InterviewScheduleModalProps {
  candidate: Candidate;
  interview?: Interview | null;
  user: User;
  onSave: () => void;
  onCancel: () => void;
}

const InterviewScheduleModal: React.FC<InterviewScheduleModalProps> = ({
  candidate,
  interview,
  user,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    phase: interview?.phase || 'casual' as Interview['phase'],
    scheduledAt: interview?.scheduledAt ? 
      new Date(interview.scheduledAt.getTime() - interview.scheduledAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16) :
      '',
    duration: interview?.duration || 60,
    location: interview?.location || 'オンライン',
    interviewerName: interview?.interviewerName || user.name,
    interviewerEmail: interview?.interviewerEmail || user.email,
    notes: interview?.notes || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const scheduledAt = new Date(formData.scheduledAt);

      const interviewData: Interview = {
        id: interview?.id || `interview_${Date.now()}`,
        candidateId: candidate.id,
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        interviewerId: user.id,
        interviewerName: formData.interviewerName,
        interviewerEmail: formData.interviewerEmail,
        phase: formData.phase,
        scheduledAt,
        duration: formData.duration,
        location: formData.location,
        status: 'scheduled',
        notes: formData.notes,
        createdAt: interview?.createdAt || new Date(),
        updatedAt: new Date()
      };

      saveInterview(interviewData);
      onSave();
    } catch (error) {
      console.error('Failed to save interview:', error);
      setError(error instanceof Error ? error.message : '面接の保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              {interview ? '面接予定編集' : '面接予定作成'} - {candidate.name}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 面接フェーズ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              面接フェーズ
            </label>
            <select
              value={formData.phase}
              onChange={(e) => setFormData({ ...formData, phase: e.target.value as Interview['phase'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {INTERVIEW_PHASES.map((phase) => (
                <option key={phase.id} value={phase.id}>
                  {phase.name} - {phase.description}
                </option>
              ))}
            </select>
          </div>

          {/* 日時と時間 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline mr-1" size={16} />
                面接日時
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                面接時間（分）
              </label>
              <input
                type="number"
                min="15"
                max="180"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 面接官情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="inline mr-1" size={16} />
                面接官名
              </label>
              <input
                type="text"
                value={formData.interviewerName}
                onChange={(e) => setFormData({ ...formData, interviewerName: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline mr-1" size={16} />
                面接官メール
              </label>
              <input
                type="email"
                value={formData.interviewerEmail}
                onChange={(e) => setFormData({ ...formData, interviewerEmail: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 場所 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline mr-1" size={16} />
              面接場所
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="会議室名、住所、またはオンライン"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* メモ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="inline mr-1" size={16} />
              メモ・備考
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="面接に関する特記事項があれば記載してください"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="text-red-600 mr-2" size={16} />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* ボタン */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? (
                <RefreshCw className="animate-spin mr-2" size={16} />
              ) : (
                <Calendar className="mr-2" size={16} />
              )}
              {loading ? '保存中...' : interview ? '更新' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};