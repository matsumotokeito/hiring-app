import React, { useState, useEffect } from 'react';
import { CompanyInfo, User, EvaluationCriterion, ScoreDescription } from '../types';
import { getCompanyInfo, saveCompanyInfo, ensureCompanyInfoExists } from '../utils/companyInfoStorage';
import { 
  Building, 
  Target, 
  Eye, 
  Heart, 
  Users, 
  Save, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Lightbulb,
  Award,
  TrendingUp,
  Globe,
  Briefcase,
  Edit,
  Trash2,
  Settings
} from 'lucide-react';

interface CompanyInfoManagementProps {
  user: User;
}

export const CompanyInfoManagement: React.FC<CompanyInfoManagementProps> = ({ user }) => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [newValue, setNewValue] = useState('');
  const [newGuideline, setNewGuideline] = useState('');
  const [newCriteria, setNewCriteria] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'criteria'>('basic');
  const [editingCriterion, setEditingCriterion] = useState<EvaluationCriterion | null>(null);
  const [showCriterionModal, setShowCriterionModal] = useState(false);

  useEffect(() => {
    loadCompanyInfo();
  }, []);

  const loadCompanyInfo = () => {
    const info = ensureCompanyInfoExists(user.id, user.name);
    setCompanyInfo(info);
  };

  const handleSave = async () => {
    if (!companyInfo) return;

    setSaveStatus('saving');
    try {
      const updatedInfo = {
        ...companyInfo,
        updatedAt: new Date(),
        updatedBy: user.id
      };
      
      saveCompanyInfo(updatedInfo);
      setCompanyInfo(updatedInfo);
      setSaveStatus('saved');
      setIsEditing(false);
      
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleCancel = () => {
    loadCompanyInfo();
    setIsEditing(false);
    setSaveStatus('idle');
  };

  const updateField = (field: keyof CompanyInfo, value: any) => {
    if (!companyInfo) return;
    setCompanyInfo({
      ...companyInfo,
      [field]: value
    });
  };

  const addArrayItem = (field: 'values' | 'behavioralGuidelines' | 'hiringCriteria', value: string) => {
    if (!companyInfo || !value.trim()) return;
    
    const currentArray = companyInfo[field] as string[];
    updateField(field, [...currentArray, value.trim()]);
    
    // 対応する入力フィールドをクリア
    if (field === 'values') setNewValue('');
    if (field === 'behavioralGuidelines') setNewGuideline('');
    if (field === 'hiringCriteria') setNewCriteria('');
  };

  const removeArrayItem = (field: 'values' | 'behavioralGuidelines' | 'hiringCriteria', index: number) => {
    if (!companyInfo) return;
    
    const currentArray = companyInfo[field] as string[];
    updateField(field, currentArray.filter((_, i) => i !== index));
  };

  const handleSaveCriterion = (criterion: EvaluationCriterion) => {
    if (!companyInfo) return;

    const criteria = companyInfo.evaluationCriteria || [];
    const existingIndex = criteria.findIndex(c => c.id === criterion.id);

    if (existingIndex >= 0) {
      criteria[existingIndex] = criterion;
    } else {
      criteria.push(criterion);
    }

    updateField('evaluationCriteria', criteria);
    setShowCriterionModal(false);
    setEditingCriterion(null);
  };

  const handleDeleteCriterion = (criterionId: string) => {
    if (!companyInfo || !confirm('この評価基準を削除しますか？')) return;

    const criteria = companyInfo.evaluationCriteria || [];
    updateField('evaluationCriteria', criteria.filter(c => c.id !== criterionId));
  };

  const handleEditCriterion = (criterion: EvaluationCriterion) => {
    setEditingCriterion(criterion);
    setShowCriterionModal(true);
  };

  const handleAddCriterion = () => {
    setEditingCriterion(null);
    setShowCriterionModal(true);
  };

  if (!companyInfo) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Building className="mr-3" size={28} />
              会社情報管理
            </h2>
            <p className="text-gray-600 mt-1">
              ChatGPT AI評価で参照される会社の基本情報・価値観・評価基準を管理
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="mr-2" size={16} />
                編集
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  disabled={saveStatus === 'saving'}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2" size={16} />
                      保存
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* 保存ステータス */}
        {saveStatus === 'saved' && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="text-green-600 mr-2" size={16} />
              <span className="text-sm text-green-700">会社情報が正常に保存されました</span>
            </div>
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="text-red-600 mr-2" size={16} />
              <span className="text-sm text-red-700">保存中にエラーが発生しました</span>
            </div>
          </div>
        )}
      </div>

      {/* タブナビゲーション */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('basic')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'basic'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building className="inline mr-2" size={16} />
              基本情報・価値観
            </button>
            <button
              onClick={() => setActiveTab('criteria')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'criteria'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="inline mr-2" size={16} />
              評価基準管理
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'basic' ? (
            <div className="space-y-6">
              {/* 基本情報 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Building className="mr-2 text-blue-600" size={20} />
                  基本情報
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">会社名</label>
                    <input
                      type="text"
                      value={companyInfo.companyName}
                      onChange={(e) => updateField('companyName', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">最終更新</label>
                    <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600">
                      {companyInfo.updatedAt.toLocaleDateString('ja-JP')} ({user.name})
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Target className="mr-1" size={16} />
                      ミッション
                    </label>
                    <textarea
                      value={companyInfo.mission}
                      onChange={(e) => updateField('mission', e.target.value)}
                      disabled={!isEditing}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Eye className="mr-1" size={16} />
                      ビジョン
                    </label>
                    <textarea
                      value={companyInfo.vision}
                      onChange={(e) => updateField('vision', e.target.value)}
                      disabled={!isEditing}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Globe className="mr-1" size={16} />
                      企業文化
                    </label>
                    <textarea
                      value={companyInfo.culture}
                      onChange={(e) => updateField('culture', e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* 企業価値観 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Heart className="mr-2 text-purple-600" size={20} />
                  企業価値観
                </h3>
                
                {isEditing && (
                  <div className="mb-4 flex space-x-2">
                    <input
                      type="text"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      placeholder="新しい価値観を入力"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addArrayItem('values', newValue);
                        }
                      }}
                    />
                    <button
                      onClick={() => addArrayItem('values', newValue)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  {companyInfo.values.map((value, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <span className="text-purple-800">{value}</span>
                      {isEditing && (
                        <button
                          onClick={() => removeArrayItem('values', index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 行動指針 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Lightbulb className="mr-2 text-yellow-600" size={20} />
                  行動指針
                </h3>
                
                {isEditing && (
                  <div className="mb-4 flex space-x-2">
                    <input
                      type="text"
                      value={newGuideline}
                      onChange={(e) => setNewGuideline(e.target.value)}
                      placeholder="新しい行動指針を入力"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addArrayItem('behavioralGuidelines', newGuideline);
                        }
                      }}
                    />
                    <button
                      onClick={() => addArrayItem('behavioralGuidelines', newGuideline)}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  {companyInfo.behavioralGuidelines.map((guideline, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <span className="text-yellow-800">{guideline}</span>
                      {isEditing && (
                        <button
                          onClick={() => removeArrayItem('behavioralGuidelines', index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 採用基準 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Award className="mr-2 text-green-600" size={20} />
                  採用基準
                </h3>
                
                {isEditing && (
                  <div className="mb-4 flex space-x-2">
                    <input
                      type="text"
                      value={newCriteria}
                      onChange={(e) => setNewCriteria(e.target.value)}
                      placeholder="新しい採用基準を入力"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addArrayItem('hiringCriteria', newCriteria);
                        }
                      }}
                    />
                    <button
                      onClick={() => addArrayItem('hiringCriteria', newCriteria)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  {companyInfo.hiringCriteria.map((criteria, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-green-800">{criteria}</span>
                      {isEditing && (
                        <button
                          onClick={() => removeArrayItem('hiringCriteria', index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 詳細情報 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Briefcase className="mr-2 text-indigo-600" size={20} />
                  詳細情報
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">評価哲学</label>
                    <textarea
                      value={companyInfo.evaluationPhilosophy}
                      onChange={(e) => updateField('evaluationPhilosophy', e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">労働環境</label>
                    <textarea
                      value={companyInfo.workEnvironment}
                      onChange={(e) => updateField('workEnvironment', e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">リーダーシップスタイル</label>
                    <textarea
                      value={companyInfo.leadershipStyle}
                      onChange={(e) => updateField('leadershipStyle', e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">チームダイナミクス</label>
                    <textarea
                      value={companyInfo.teamDynamics}
                      onChange={(e) => updateField('teamDynamics', e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">パフォーマンス期待値</label>
                    <textarea
                      value={companyInfo.performanceExpectations}
                      onChange={(e) => updateField('performanceExpectations', e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">キャリア開発</label>
                    <textarea
                      value={companyInfo.careerDevelopment}
                      onChange={(e) => updateField('careerDevelopment', e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ダイバーシティ＆インクルージョン</label>
                    <textarea
                      value={companyInfo.diversityInclusion}
                      onChange={(e) => updateField('diversityInclusion', e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">追加コンテキスト</label>
                    <textarea
                      value={companyInfo.additionalContext}
                      onChange={(e) => updateField('additionalContext', e.target.value)}
                      disabled={!isEditing}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      placeholder="ChatGPT評価で考慮すべき追加の情報や特別な状況があれば記載してください"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <EvaluationCriteriaManagement
              criteria={companyInfo.evaluationCriteria || []}
              onSaveCriterion={handleSaveCriterion}
              onDeleteCriterion={handleDeleteCriterion}
              onEditCriterion={handleEditCriterion}
              onAddCriterion={handleAddCriterion}
              isEditing={isEditing}
            />
          )}
        </div>
      </div>

      {/* 評価基準編集モーダル */}
      {showCriterionModal && (
        <CriterionEditModal
          criterion={editingCriterion}
          onSave={handleSaveCriterion}
          onCancel={() => {
            setShowCriterionModal(false);
            setEditingCriterion(null);
          }}
        />
      )}

      {/* 使用方法の説明 */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h4 className="font-medium text-blue-800 mb-3 flex items-center">
          <TrendingUp className="mr-2" size={18} />
          ChatGPT AI評価での活用方法
        </h4>
        <div className="text-sm text-blue-700 space-y-2">
          <p>• この会社情報は、ChatGPT AI が候補者を評価する際の重要な参考情報として使用されます</p>
          <p>• 企業価値観や行動指針は、候補者の価値観適合性を判定する基準となります</p>
          <p>• 採用基準は、候補者の適性を評価する際の重要な指標として活用されます</p>
          <p>• 評価基準は、各職種の評価項目とスコア説明を統一的に管理します</p>
          <p>• 詳細情報は、より精密で企業文化に適した評価を実現するために使用されます</p>
          <p>• 定期的に情報を更新することで、より正確な AI 評価が可能になります</p>
        </div>
      </div>
    </div>
  );
};

// 評価基準管理コンポーネント
interface EvaluationCriteriaManagementProps {
  criteria: EvaluationCriterion[];
  onSaveCriterion: (criterion: EvaluationCriterion) => void;
  onDeleteCriterion: (criterionId: string) => void;
  onEditCriterion: (criterion: EvaluationCriterion) => void;
  onAddCriterion: () => void;
  isEditing: boolean;
}

const EvaluationCriteriaManagement: React.FC<EvaluationCriteriaManagementProps> = ({
  criteria,
  onDeleteCriterion,
  onEditCriterion,
  onAddCriterion,
  isEditing
}) => {
  const categories = ['能力経験', '価値観', '志向性'];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '能力経験': return Target;
      case '価値観': return Heart;
      case '志向性': return TrendingUp;
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">評価基準管理</h3>
        {isEditing && (
          <button
            onClick={onAddCriterion}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="mr-2" size={16} />
            新規追加
          </button>
        )}
      </div>

      {categories.map(category => {
        const categoryCriteria = criteria.filter(c => c.category === category);
        const CategoryIcon = getCategoryIcon(category);
        const categoryColor = getCategoryColor(category);

        return (
          <div key={category} className={`bg-${categoryColor}-50 border border-${categoryColor}-200 rounded-lg overflow-hidden`}>
            <div className={`bg-${categoryColor}-100 p-4 border-b border-${categoryColor}-200`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CategoryIcon className={`text-${categoryColor}-600 mr-3`} size={20} />
                  <h4 className={`font-semibold text-${categoryColor}-800`}>{category}</h4>
                </div>
                <div className="text-sm text-gray-600">
                  {categoryCriteria.length}項目
                </div>
              </div>
            </div>

            <div className="p-4">
              {categoryCriteria.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Settings className="mx-auto mb-2" size={32} />
                  <p>この カテゴリには評価基準がありません</p>
                  {isEditing && (
                    <button
                      onClick={onAddCriterion}
                      className="mt-2 text-blue-600 hover:text-blue-800"
                    >
                      評価基準を追加
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {categoryCriteria.map(criterion => (
                    <div key={criterion.id} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-800 mb-1">{criterion.name}</h5>
                          <p className="text-sm text-gray-600 mb-2">{criterion.description}</p>
                          <div className="text-xs text-gray-500">
                            重み: {criterion.weight}%
                          </div>
                        </div>
                        {isEditing && (
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => onEditCriterion(criterion)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => onDeleteCriterion(criterion.id)}
                              className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* スコア説明 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        {criterion.scoreDescriptions.map(desc => (
                          <div key={desc.score} className="bg-gray-50 p-2 rounded border">
                            <div className="flex items-center mb-1">
                              <span className="font-bold text-sm mr-2">{desc.score}点:</span>
                              <span className="text-sm font-medium">{desc.label}</span>
                            </div>
                            <p className="text-xs text-gray-600">{desc.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 評価基準編集モーダル
interface CriterionEditModalProps {
  criterion: EvaluationCriterion | null;
  onSave: (criterion: EvaluationCriterion) => void;
  onCancel: () => void;
}

const CriterionEditModal: React.FC<CriterionEditModalProps> = ({
  criterion,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<EvaluationCriterion>(
    criterion || {
      id: `criterion_${Date.now()}`,
      name: '',
      description: '',
      weight: 5,
      category: '能力経験',
      scoreDescriptions: [
        { score: 1, label: '要改善', description: '' },
        { score: 2, label: '普通', description: '' },
        { score: 3, label: '良好', description: '' },
        { score: 4, label: '優秀', description: '' }
      ]
    }
  );

  const handleSave = () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      alert('名前と説明は必須です');
      return;
    }

    if (formData.scoreDescriptions.some(desc => !desc.description.trim())) {
      alert('すべてのスコア説明を入力してください');
      return;
    }

    onSave(formData);
  };

  const updateScoreDescription = (score: number, field: 'label' | 'description', value: string) => {
    const newDescriptions = formData.scoreDescriptions.map(desc =>
      desc.score === score ? { ...desc, [field]: value } : desc
    );
    setFormData({ ...formData, scoreDescriptions: newDescriptions });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              {criterion ? '評価基準編集' : '評価基準追加'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 基本情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">評価項目名 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="例: コミュニケーション能力"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="能力経験">能力経験</option>
                <option value="価値観">価値観</option>
                <option value="志向性">志向性</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">説明 *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="この評価項目で何を評価するかを詳しく説明してください"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">重み (%)</label>
            <input
              type="number"
              min="1"
              max="20"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 5 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* スコア説明 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">スコア説明設定</h3>
            <div className="space-y-4">
              {formData.scoreDescriptions.map(desc => (
                <div key={desc.score} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {desc.score}点のラベル
                      </label>
                      <input
                        type="text"
                        value={desc.label}
                        onChange={(e) => updateScoreDescription(desc.score, 'label', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="例: 優秀"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {desc.score}点の説明 *
                      </label>
                      <textarea
                        value={desc.description}
                        onChange={(e) => updateScoreDescription(desc.score, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder={`${desc.score}点に該当する状態を具体的に説明してください`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Save className="mr-2" size={16} />
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};