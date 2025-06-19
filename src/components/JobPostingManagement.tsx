import React, { useState, useEffect } from 'react';
import { JobPosting, JobType, User } from '../types';
import { 
  getJobPostings, 
  saveJobPosting, 
  deleteJobPosting, 
  createDefaultJobPostings 
} from '../utils/jobPostingStorage';
import { 
  Briefcase, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MapPin, 
  DollarSign,
  Clock,
  Users,
  Building,
  Target,
  Award,
  CheckCircle,
  X,
  Save,
  Calendar,
  Star,
  Heart,
  AlertTriangle
} from 'lucide-react';

interface JobPostingManagementProps {
  user: User;
}

export const JobPostingManagement: React.FC<JobPostingManagementProps> = ({ user }) => {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [selectedJobPosting, setSelectedJobPosting] = useState<JobPosting | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [filterJobType, setFilterJobType] = useState<JobType | 'all'>('all');

  useEffect(() => {
    loadJobPostings();
  }, []);

  const loadJobPostings = () => {
    createDefaultJobPostings(); // デフォルトデータを作成
    const postings = getJobPostings();
    setJobPostings(postings);
  };

  const handleCreateNew = () => {
    setSelectedJobPosting(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (jobPosting: JobPosting) => {
    setSelectedJobPosting(jobPosting);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (jobPosting: JobPosting) => {
    setSelectedJobPosting(jobPosting);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDelete = (jobPosting: JobPosting) => {
    if (confirm(`「${jobPosting.title}」を削除しますか？`)) {
      deleteJobPosting(jobPosting.id);
      loadJobPostings();
    }
  };

  const handleSave = (jobPosting: JobPosting) => {
    saveJobPosting(jobPosting);
    loadJobPostings();
    setShowModal(false);
  };

  const filteredJobPostings = filterJobType === 'all' 
    ? jobPostings 
    : jobPostings.filter(jp => jp.jobType === filterJobType);

  const jobTypeLabels: Record<JobType, string> = {
    fresh_sales: '新卒営業',
    experienced_sales: '中途営業',
    specialist: '中途専門職',
    engineer: 'エンジニア',
    part_time_base: 'アルバイト（拠点）',
    part_time_sales: 'アルバイト（営業）'
  };

  const formatSalary = (min: number, max: number, currency: string) => {
    const formatter = new Intl.NumberFormat('ja-JP');
    return `${formatter.format(min)}〜${formatter.format(max)} ${currency === 'JPY' ? '円' : currency}`;
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Briefcase className="mr-3" size={28} />
              求人票管理
            </h2>
            <p className="text-gray-600 mt-1">
              職種別の求人票を管理し、ChatGPT評価で活用します
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={filterJobType}
              onChange={(e) => setFilterJobType(e.target.value as JobType | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全職種</option>
              {Object.entries(jobTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            
            <button
              onClick={handleCreateNew}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="mr-2" size={16} />
              新規作成
            </button>
          </div>
        </div>
      </div>

      {/* 求人票一覧 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredJobPostings.map((jobPosting) => (
          <div key={jobPosting.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {jobPosting.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Building className="mr-1" size={14} />
                    {jobPosting.department}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="mr-1" size={14} />
                    {jobPosting.location}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  jobPosting.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {jobPosting.isActive ? '公開中' : '非公開'}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-700">
                  <DollarSign className="mr-2 text-green-600" size={16} />
                  <span>{formatSalary(jobPosting.salaryRange.min, jobPosting.salaryRange.max, jobPosting.salaryRange.currency)}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-700">
                  <Clock className="mr-2 text-blue-600" size={16} />
                  <span>{jobPosting.workingConditions.workingHours}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-700">
                  <Users className="mr-2 text-purple-600" size={16} />
                  <span>{jobPosting.employmentType === 'full-time' ? '正社員' : 
                         jobPosting.employmentType === 'part-time' ? 'パート' :
                         jobPosting.employmentType === 'contract' ? '契約社員' : 'インターン'}</span>
                </div>
              </div>

              {/* 新しく追加：要件の概要表示 */}
              <div className="mb-4 space-y-2">
                {jobPosting.essentialRequirements && jobPosting.essentialRequirements.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-red-700 mb-1 flex items-center">
                      <AlertTriangle className="mr-1" size={12} />
                      必須要件
                    </h4>
                    <div className="text-xs text-gray-600">
                      {jobPosting.essentialRequirements.slice(0, 2).map((req, index) => (
                        <p key={index} className="flex items-start mb-1">
                          <span className="w-1 h-1 bg-red-500 rounded-full mr-2 mt-1.5"></span>
                          {req}
                        </p>
                      ))}
                      {jobPosting.essentialRequirements.length > 2 && (
                        <p className="text-gray-500 text-xs">
                          他 {jobPosting.essentialRequirements.length - 2} 項目...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {jobPosting.idealCandidate && jobPosting.idealCandidate.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-blue-700 mb-1 flex items-center">
                      <Star className="mr-1" size={12} />
                      求める人物像
                    </h4>
                    <div className="text-xs text-gray-600">
                      {jobPosting.idealCandidate.slice(0, 2).map((trait, index) => (
                        <p key={index} className="flex items-start mb-1">
                          <span className="w-1 h-1 bg-blue-500 rounded-full mr-2 mt-1.5"></span>
                          {trait}
                        </p>
                      ))}
                      {jobPosting.idealCandidate.length > 2 && (
                        <p className="text-gray-500 text-xs">
                          他 {jobPosting.idealCandidate.length - 2} 項目...
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">主な業務</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {jobPosting.responsibilities.slice(0, 3).map((responsibility, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2"></span>
                      {responsibility}
                    </li>
                  ))}
                  {jobPosting.responsibilities.length > 3 && (
                    <li className="text-gray-500 text-xs">
                      他 {jobPosting.responsibilities.length - 3} 項目...
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  更新: {jobPosting.updatedAt.toLocaleDateString('ja-JP')}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleView(jobPosting)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                    title="詳細表示"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleEdit(jobPosting)}
                    className="p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                    title="編集"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(jobPosting)}
                    className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                    title="削除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredJobPostings.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-medium text-gray-700 mb-2">求人票がありません</h3>
          <p className="text-gray-500 mb-4">新しい求人票を作成してください</p>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            求人票を作成
          </button>
        </div>
      )}

      {/* モーダル */}
      {showModal && (
        <JobPostingModal
          jobPosting={selectedJobPosting}
          mode={modalMode}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          user={user}
        />
      )}
    </div>
  );
};

interface JobPostingModalProps {
  jobPosting: JobPosting | null;
  mode: 'view' | 'edit' | 'create';
  onSave: (jobPosting: JobPosting) => void;
  onClose: () => void;
  user: User;
}

const JobPostingModal: React.FC<JobPostingModalProps> = ({
  jobPosting,
  mode,
  onSave,
  onClose,
  user
}) => {
  const [formData, setFormData] = useState<Partial<JobPosting>>(
    jobPosting || {
      jobType: 'fresh_sales',
      title: '',
      department: '',
      location: '',
      employmentType: 'full-time',
      salaryRange: { min: 0, max: 0, currency: 'JPY' },
      requirements: {
        education: [],
        experience: [],
        skills: [],
        qualifications: [],
        languages: []
      },
      essentialRequirements: [],
      preferredRequirements: [],
      idealCandidate: [],
      responsibilities: [],
      benefits: [],
      workingConditions: {
        workingHours: '',
        holidays: '',
        overtime: '',
        remoteWork: false,
        travelRequired: false
      },
      companyInfo: {
        mission: '',
        vision: '',
        values: [],
        culture: ''
      },
      careerPath: {
        initialRole: '',
        growthOpportunities: [],
        trainingPrograms: []
      },
      isActive: true
    }
  );

  const isReadOnly = mode === 'view';

  const handleSave = () => {
    const now = new Date();
    const savedJobPosting: JobPosting = {
      id: formData.id || `job_${Date.now()}`,
      jobType: formData.jobType!,
      title: formData.title!,
      department: formData.department!,
      location: formData.location!,
      employmentType: formData.employmentType!,
      salaryRange: formData.salaryRange!,
      requirements: formData.requirements!,
      essentialRequirements: formData.essentialRequirements!,
      preferredRequirements: formData.preferredRequirements!,
      idealCandidate: formData.idealCandidate!,
      responsibilities: formData.responsibilities!,
      benefits: formData.benefits!,
      workingConditions: formData.workingConditions!,
      companyInfo: formData.companyInfo!,
      careerPath: formData.careerPath!,
      applicationDeadline: formData.applicationDeadline,
      startDate: formData.startDate,
      isActive: formData.isActive!,
      createdAt: formData.createdAt || now,
      updatedAt: now,
      createdBy: formData.createdBy || user.id
    };

    onSave(savedJobPosting);
  };

  const updateArrayField = (value: string, arrayPath: string[]) => {
    if (!value.trim()) return;
    
    const newFormData = { ...formData };
    let target = newFormData as any;
    
    for (let i = 0; i < arrayPath.length - 1; i++) {
      target = target[arrayPath[i]];
    }
    
    const finalField = arrayPath[arrayPath.length - 1];
    if (!target[finalField]) target[finalField] = [];
    
    target[finalField] = [...target[finalField], value];
    setFormData(newFormData);
  };

  const removeArrayItem = (arrayPath: string[], index: number) => {
    const newFormData = { ...formData };
    let target = newFormData as any;
    
    for (let i = 0; i < arrayPath.length - 1; i++) {
      target = target[arrayPath[i]];
    }
    
    const finalField = arrayPath[arrayPath.length - 1];
    target[finalField] = target[finalField].filter((_: any, i: number) => i !== index);
    setFormData(newFormData);
  };

  const jobTypeLabels: Record<JobType, string> = {
    fresh_sales: '新卒営業',
    experienced_sales: '中途営業',
    specialist: '中途専門職',
    engineer: 'エンジニア',
    part_time_base: 'アルバイト（拠点）',
    part_time_sales: 'アルバイト（営業）'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {mode === 'create' ? '新規求人票作成' : 
               mode === 'edit' ? '求人票編集' : '求人票詳細'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 基本情報 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">基本情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">職種</label>
                <select
                  value={formData.jobType || ''}
                  onChange={(e) => setFormData({ ...formData, jobType: e.target.value as JobType })}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  {Object.entries(jobTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">求人タイトル</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">部署</label>
                <input
                  type="text"
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">勤務地</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* 給与・待遇 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">給与・待遇</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">最低給与</label>
                <input
                  type="number"
                  value={formData.salaryRange?.min || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    salaryRange: { 
                      ...formData.salaryRange!, 
                      min: parseInt(e.target.value) || 0 
                    } 
                  })}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">最高給与</label>
                <input
                  type="number"
                  value={formData.salaryRange?.max || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    salaryRange: { 
                      ...formData.salaryRange!, 
                      max: parseInt(e.target.value) || 0 
                    } 
                  })}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">雇用形態</label>
                <select
                  value={formData.employmentType || ''}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="full-time">正社員</option>
                  <option value="part-time">パート</option>
                  <option value="contract">契約社員</option>
                  <option value="internship">インターン</option>
                </select>
              </div>
            </div>
          </div>

          {/* 必須要件 */}
          <div className="bg-red-50 rounded-lg p-6 border border-red-200">
            <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
              <AlertTriangle className="mr-2" size={20} />
              必須要件
            </h3>
            
            {!isReadOnly && (
              <div className="mb-4 flex space-x-2">
                <input
                  type="text"
                  placeholder="必須要件を入力"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      updateArrayField(e.currentTarget.value, ['essentialRequirements']);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    updateArrayField(input.value, ['essentialRequirements']);
                    input.value = '';
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  追加
                </button>
              </div>
            )}

            <div className="space-y-2">
              {formData.essentialRequirements?.map((requirement, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded border border-red-200">
                  <span className="text-red-800">{requirement}</span>
                  {!isReadOnly && (
                    <button
                      onClick={() => removeArrayItem(['essentialRequirements'], index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              {(!formData.essentialRequirements || formData.essentialRequirements.length === 0) && (
                <p className="text-sm text-red-700 italic">必須要件を追加してください</p>
              )}
            </div>
          </div>

          {/* 歓迎要件 */}
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
              <CheckCircle className="mr-2" size={20} />
              歓迎要件
            </h3>
            
            {!isReadOnly && (
              <div className="mb-4 flex space-x-2">
                <input
                  type="text"
                  placeholder="歓迎要件を入力"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      updateArrayField(e.currentTarget.value, ['preferredRequirements']);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    updateArrayField(input.value, ['preferredRequirements']);
                    input.value = '';
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  追加
                </button>
              </div>
            )}

            <div className="space-y-2">
              {formData.preferredRequirements?.map((requirement, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded border border-green-200">
                  <span className="text-green-800">{requirement}</span>
                  {!isReadOnly && (
                    <button
                      onClick={() => removeArrayItem(['preferredRequirements'], index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              {(!formData.preferredRequirements || formData.preferredRequirements.length === 0) && (
                <p className="text-sm text-green-700 italic">歓迎要件を追加してください</p>
              )}
            </div>
          </div>

          {/* 求める人物像 */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <Star className="mr-2" size={20} />
              求める人物像
            </h3>
            
            {!isReadOnly && (
              <div className="mb-4 flex space-x-2">
                <input
                  type="text"
                  placeholder="求める人物像を入力"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      updateArrayField(e.currentTarget.value, ['idealCandidate']);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    updateArrayField(input.value, ['idealCandidate']);
                    input.value = '';
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  追加
                </button>
              </div>
            )}

            <div className="space-y-2">
              {formData.idealCandidate?.map((trait, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded border border-blue-200">
                  <span className="text-blue-800">{trait}</span>
                  {!isReadOnly && (
                    <button
                      onClick={() => removeArrayItem(['idealCandidate'], index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              {(!formData.idealCandidate || formData.idealCandidate.length === 0) && (
                <p className="text-sm text-blue-700 italic">求める人物像を追加してください</p>
              )}
            </div>
          </div>

          {/* 応募要件（従来） */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">その他の応募要件</h3>
            
            {/* 学歴要件 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">学歴要件</label>
              {!isReadOnly && (
                <div className="flex mb-2">
                  <input
                    type="text"
                    placeholder="学歴要件を入力"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        updateArrayField(e.currentTarget.value, ['requirements', 'education']);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      updateArrayField(input.value, ['requirements', 'education']);
                      input.value = '';
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  >
                    追加
                  </button>
                </div>
              )}
              <div className="space-y-1">
                {formData.requirements?.education?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                    <span className="text-sm">{item}</span>
                    {!isReadOnly && (
                      <button
                        onClick={() => removeArrayItem(['requirements', 'education'], index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 経験要件 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">経験要件</label>
              {!isReadOnly && (
                <div className="flex mb-2">
                  <input
                    type="text"
                    placeholder="経験要件を入力"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        updateArrayField(e.currentTarget.value, ['requirements', 'experience']);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      updateArrayField(input.value, ['requirements', 'experience']);
                      input.value = '';
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  >
                    追加
                  </button>
                </div>
              )}
              <div className="space-y-1">
                {formData.requirements?.experience?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                    <span className="text-sm">{item}</span>
                    {!isReadOnly && (
                      <button
                        onClick={() => removeArrayItem(['requirements', 'experience'], index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* スキル要件 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">スキル要件</label>
              {!isReadOnly && (
                <div className="flex mb-2">
                  <input
                    type="text"
                    placeholder="スキル要件を入力"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        updateArrayField(e.currentTarget.value, ['requirements', 'skills']);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      updateArrayField(input.value, ['requirements', 'skills']);
                      input.value = '';
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  >
                    追加
                  </button>
                </div>
              )}
              <div className="space-y-1">
                {formData.requirements?.skills?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                    <span className="text-sm">{item}</span>
                    {!isReadOnly && (
                      <button
                        onClick={() => removeArrayItem(['requirements', 'skills'], index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 業務内容 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">業務内容</h3>
            {!isReadOnly && (
              <div className="flex mb-2">
                <input
                  type="text"
                  placeholder="業務内容を入力"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      updateArrayField(e.currentTarget.value, ['responsibilities']);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    updateArrayField(input.value, ['responsibilities']);
                    input.value = '';
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                >
                  追加
                </button>
              </div>
            )}
            <div className="space-y-1">
              {formData.responsibilities?.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                  <span className="text-sm">{item}</span>
                  {!isReadOnly && (
                    <button
                      onClick={() => removeArrayItem(['responsibilities'], index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 会社情報 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">会社情報</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ミッション</label>
                <textarea
                  value={formData.companyInfo?.mission || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    companyInfo: { 
                      ...formData.companyInfo!, 
                      mission: e.target.value 
                    } 
                  })}
                  disabled={isReadOnly}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">企業文化</label>
                <textarea
                  value={formData.companyInfo?.culture || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    companyInfo: { 
                      ...formData.companyInfo!, 
                      culture: e.target.value 
                    } 
                  })}
                  disabled={isReadOnly}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* 公開設定 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">公開設定</h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive || false}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                disabled={isReadOnly}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">この求人票を公開する</span>
            </label>
          </div>
        </div>

        {/* フッター */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              {isReadOnly ? '閉じる' : 'キャンセル'}
            </button>
            {!isReadOnly && (
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Save className="mr-2" size={16} />
                保存
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};