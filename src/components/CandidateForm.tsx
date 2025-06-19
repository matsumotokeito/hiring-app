import React, { useState, useEffect } from 'react';
import { Candidate, JobType, SavedDraft, SPIResults, InterviewPhase, CandidateDocuments, ExtractedDocumentData } from '../types';
import { saveCandidate, saveDraft } from '../utils/storage';
import { initializeInterviewProcess } from '../utils/interviewStorage';
import { ChatGPTEvaluator } from '../utils/chatGPTEvaluator';
import { DocumentProcessor } from '../utils/documentProcessor';
import { ChatGPTInsights } from './ChatGPTInsights';
import { SPIInput } from './SPIInput';
import { SPIDisplay } from './SPIDisplay';
import { DocumentUpload } from './DocumentUpload';
import { User, Mail, Phone, GraduationCap, Calendar, Save, CheckCircle, Star, AlertCircle, Brain, Edit, Plus, Clock, Lightbulb, Target, MessageSquare, Upload, FileText } from 'lucide-react';

interface CandidateFormProps {
  jobType: JobType;
  onCandidateSubmit: (candidate: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Partial<Candidate>;
}

export const CandidateForm: React.FC<CandidateFormProps> = ({
  jobType,
  onCandidateSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    age: initialData?.age?.toString() || '',
    education: initialData?.education || '',
    major: initialData?.major || '',
    experience: initialData?.experience || '',
    selfPr: initialData?.selfPr || '',
    interviewNotes: initialData?.interviewNotes || '',
  });

  const [documents, setDocuments] = useState<CandidateDocuments>(initialData?.documents || {});
  const [spiResults, setSpiResults] = useState<SPIResults | undefined>(initialData?.spiResults);
  const [showSPIInput, setShowSPIInput] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7; // 書類アップロードステップを追加

  // ChatGPT関連の状態
  const [showChatGPTAnalysis, setShowChatGPTAnalysis] = useState(false);
  const [chatGPTEvaluator] = useState(new ChatGPTEvaluator());
  const [documentProcessor] = useState(new DocumentProcessor());
  const [earlyAnalysisAvailable, setEarlyAnalysisAvailable] = useState(false);
  const [showInterviewQuestions, setShowInterviewQuestions] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // 面接関連の状態
  const [interviewPhase, setInterviewPhase] = useState<InterviewPhase>({
    currentPhase: 'casual_interview',
    status: 'scheduled',
    notes: '',
    result: 'pending'
  });

  // 自動保存
  useEffect(() => {
    if (!autoSaveEnabled || !formData.name) return;

    const timer = setTimeout(() => {
      handleAutoSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData, spiResults, interviewPhase, documents, autoSaveEnabled]);

  // 早期分析の可能性をチェック
  useEffect(() => {
    const hasBasicInfo = formData.name && formData.education && formData.experience && formData.selfPr;
    const hasDocuments = Object.values(documents).some(Boolean);
    setEarlyAnalysisAvailable(!!(hasBasicInfo || hasDocuments));
  }, [formData, documents]);

  const handleAutoSave = () => {
    if (!formData.name) return;

    setSaveStatus('saving');
    
    const draft: SavedDraft = {
      id: `candidate_${jobType}_${Date.now()}`,
      candidateData: {
        name: formData.name,
        email: formData.email || '',
        phone: formData.phone,
        age: formData.age ? parseInt(formData.age) : undefined,
        education: formData.education,
        major: formData.major,
        experience: formData.experience,
        selfPr: formData.selfPr,
        interviewNotes: formData.interviewNotes,
        appliedPosition: jobType,
        spiResults: spiResults,
        interviewPhase: interviewPhase,
        documents: documents,
      },
      jobType,
      stage: 'candidate_input',
      savedAt: new Date(),
      title: formData.name || '無題の候補者',
    };

    saveDraft(draft);
    setSaveStatus('saved');
    
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) errors.name = '氏名は必須です';
    // メールアドレスは任意に変更
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = '有効なメールアドレスを入力してください';
    }
    if (!formData.age || parseInt(formData.age) < 18 || parseInt(formData.age) > 70) {
      errors.age = '18歳から70歳の間で入力してください';
    }
    if (!formData.education.trim()) errors.education = '最終学歴は必須です';
    if (!formData.experience.trim()) errors.experience = '職歴・経験は必須です';
    if (!formData.selfPr.trim()) errors.selfPr = '自己PRは必須です';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // エラーがある最初のステップに移動
      if (validationErrors.name || validationErrors.email || validationErrors.phone || validationErrors.age) {
        setCurrentStep(2); // 基本情報ステップ
      } else if (validationErrors.education || validationErrors.major) {
        setCurrentStep(3); // 学歴情報ステップ
      } else {
        setCurrentStep(4); // 経験・PRステップ
      }
      return;
    }

    const candidate: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name,
      email: formData.email || '', // 空文字列をデフォルトに
      phone: formData.phone,
      age: parseInt(formData.age),
      education: formData.education,
      major: formData.major,
      experience: formData.experience,
      selfPr: formData.selfPr,
      interviewNotes: formData.interviewNotes,
      appliedPosition: jobType,
      spiResults: spiResults,
      interviewPhase: interviewPhase,
      documents: documents,
    };
    
    onCandidateSubmit(candidate);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // リアルタイムバリデーション
    if (validationErrors[name]) {
      const newErrors = { ...validationErrors };
      delete newErrors[name];
      setValidationErrors(newErrors);
    }
  };

  const handleSPISave = (spiData: SPIResults) => {
    setSpiResults(spiData);
    setShowSPIInput(false);
  };

  const handleDocumentsChange = (newDocuments: CandidateDocuments) => {
    setDocuments(newDocuments);
  };

  const handleExtractedDataChange = (extractedData: ExtractedDocumentData) => {
    // 抽出されたデータをフォームに適用
    const formDataFromExtracted = documentProcessor.generateFormData(extractedData);
    
    setFormData(prevData => ({
      ...prevData,
      ...formDataFromExtracted,
      // 既存のデータを上書きしないように、空の場合のみ更新
      name: prevData.name || formDataFromExtracted.name || '',
      email: prevData.email || formDataFromExtracted.email || '',
      phone: prevData.phone || formDataFromExtracted.phone || '',
      age: prevData.age || formDataFromExtracted.age || '',
      education: prevData.education || formDataFromExtracted.education || '',
      major: prevData.major || formDataFromExtracted.major || '',
      experience: prevData.experience || formDataFromExtracted.experience || '',
      selfPr: prevData.selfPr || formDataFromExtracted.selfPr || '',
    }));
  };

  const generateInterviewQuestions = async () => {
    if (!chatGPTEvaluator.hasAPIKey()) {
      alert('ChatGPT APIキーが設定されていません。設定画面からAPIキーを入力してください。');
      return;
    }

    setLoadingQuestions(true);
    try {
      const candidateData = getCurrentCandidateData();
      const questions = await chatGPTEvaluator.generateInterviewQuestions(candidateData);
      setInterviewQuestions(questions);
      setShowInterviewQuestions(true);
    } catch (error) {
      console.error('面接質問生成エラー:', error);
      alert('面接質問の生成に失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー'));
    } finally {
      setLoadingQuestions(false);
    }
  };

  const getCompletionPercentage = () => {
    const requiredFields = ['name', 'age', 'education', 'experience', 'selfPr']; // emailを削除
    const completedFields = requiredFields.filter(field => {
      const value = formData[field as keyof typeof formData];
      return value && value.toString().trim() !== '';
    });
    
    let percentage = (completedFields.length / requiredFields.length) * 40; // 基本情報で40%
    if (Object.keys(documents).length > 0) percentage += 20; // 書類で20%追加
    if (spiResults) percentage += 20; // SPI結果で20%追加
    if (interviewPhase.notes) percentage += 10; // 面接情報で10%追加
    if (earlyAnalysisAvailable) percentage += 10; // ChatGPT分析可能で10%追加
    
    return Math.round(percentage);
  };

  const canProceedToNextStep = (step: number) => {
    switch (step) {
      case 1:
        return true; // 書類アップロードは任意
      case 2:
        return formData.name && formData.age; // emailを削除
      case 3:
        return formData.education;
      case 4:
        return formData.experience && formData.selfPr;
      case 5:
        return true; // SPIは任意
      case 6:
        return true; // 面接情報は任意
      case 7:
        return true; // ChatGPT分析は任意
      default:
        return false;
    }
  };

  // 現在の候補者データを作成
  const getCurrentCandidateData = () => {
    return {
      id: 'temp',
      name: formData.name,
      email: formData.email || 'temp@example.com', // 一時的なメールアドレス
      phone: formData.phone,
      age: parseInt(formData.age) || 0,
      education: formData.education,
      major: formData.major,
      experience: formData.experience,
      selfPr: formData.selfPr,
      interviewNotes: formData.interviewNotes,
      appliedPosition: jobType,
      spiResults: spiResults,
      interviewPhase: interviewPhase,
      documents: documents,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">書類アップロード</h3>
              <p className="text-sm text-gray-600">履歴書や職務経歴書をアップロードすると、自動で情報を抽出できます（任意）</p>
            </div>

            <DocumentUpload
              documents={documents}
              onDocumentsChange={handleDocumentsChange}
              onExtractedDataChange={handleExtractedDataChange}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">基本情報</h3>
              <p className="text-sm text-gray-600">候補者の基本的な情報を入力してください</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline mr-1" size={16} />
                  氏名 *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    validationErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="山田 太郎"
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {validationErrors.name}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline mr-1" size={16} />
                  年齢 *
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="18"
                  max="70"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    validationErrors.age ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="25"
                />
                {validationErrors.age && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {validationErrors.age}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline mr-1" size={16} />
                  メールアドレス
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    validationErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="yamada@example.com（任意）"
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {validationErrors.email}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  メールアドレスは任意です。面接連絡等で使用します。
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline mr-1" size={16} />
                  電話番号
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="090-1234-5678（任意）"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">学歴情報</h3>
              <p className="text-sm text-gray-600">候補者の学歴・教育背景を入力してください</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <GraduationCap className="inline mr-1" size={16} />
                  最終学歴 *
                </label>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    validationErrors.education ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="○○大学 経済学部"
                />
                {validationErrors.education && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {validationErrors.education}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  専攻分野
                </label>
                <input
                  type="text"
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="経営学専攻"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">経験・PR情報</h3>
              <p className="text-sm text-gray-600">候補者の経験や強みを詳しく入力してください</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                職歴・経験 *
              </label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                rows={5}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  validationErrors.experience ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder={
                  jobType === 'fresh_sales'
                    ? 'アルバイト経験、インターンシップ、学生時代の活動など詳しく記載してください'
                    : '前職での業務内容、担当領域、実績など詳しく記載してください'
                }
              />
              {validationErrors.experience && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {validationErrors.experience}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                具体的な数字や成果があれば併せて記載してください
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                自己PR *
              </label>
              <textarea
                name="selfPr"
                value={formData.selfPr}
                onChange={handleChange}
                rows={5}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  validationErrors.selfPr ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="強み、特技、志望動機、今後の目標など"
              />
              {validationErrors.selfPr && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {validationErrors.selfPr}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                面接メモ
              </label>
              <textarea
                name="interviewNotes"
                value={formData.interviewNotes}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="面接での印象、回答内容、気になった点など"
              />
              <p className="mt-1 text-xs text-gray-500">
                面接後に追記することも可能です
              </p>
            </div>

            {/* 早期分析可能通知 */}
            {earlyAnalysisAvailable && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center">
                  <Lightbulb className="text-green-600 mr-3" size={20} />
                  <div>
                    <h4 className="font-medium text-green-800">ChatGPT早期分析が利用可能です</h4>
                    <p className="text-sm text-green-700 mt-1">
                      基本情報が入力されたため、ChatGPTによる初期分析と面接質問の生成が可能になりました。
                      次のステップで詳細な分析を確認できます。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6" data-section="spi">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">SPI適性検査結果</h3>
              <p className="text-sm text-gray-600">SPI適性検査の結果がある場合は入力してください（任意）</p>
            </div>

            {spiResults ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="text-green-600 mr-3" size={24} />
                    <div>
                      <h4 className="font-medium text-green-800">SPI結果が登録されています</h4>
                      <p className="text-sm text-green-600">
                        受検日: {spiResults.testDate.toLocaleDateString('ja-JP')} | 
                        総合スコア: {spiResults.totalScore} | 
                        パーセンタイル: {spiResults.percentile}%
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSPIInput(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="mr-2" size={16} />
                    編集
                  </button>
                </div>
                
                <SPIDisplay spiResults={spiResults} showAnalysis={false} />
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="mx-auto mb-4 text-gray-400" size={48} />
                <h4 className="text-lg font-medium text-gray-700 mb-2">SPI適性検査結果</h4>
                <p className="text-gray-600 mb-6">
                  SPI適性検査の結果を入力すると、より詳細な分析が可能になります
                </p>
                <button
                  onClick={() => setShowSPIInput(true)}
                  className="flex items-center mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="mr-2" size={16} />
                  SPI結果を入力
                </button>
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">面接情報</h3>
              <p className="text-sm text-gray-600">面接プロセスに関する初期情報を設定してください（任意）</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-4 flex items-center">
                <Clock className="mr-2" size={18} />
                面接プロセス設定
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    開始フェーズ
                  </label>
                  <select
                    value={interviewPhase.currentPhase}
                    onChange={(e) => setInterviewPhase({
                      ...interviewPhase,
                      currentPhase: e.target.value as any
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="casual_interview">カジュアル面談</option>
                    <option value="first_interview">1次面接</option>
                    <option value="second_interview">2次面接</option>
                    <option value="final_interview">最終面接</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    初期メモ
                  </label>
                  <textarea
                    value={interviewPhase.notes || ''}
                    onChange={(e) => setInterviewPhase({
                      ...interviewPhase,
                      notes: e.target.value
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="面接に関する特記事項や注意点があれば記載してください"
                  />
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>注意:</strong> 面接フェーズは後から変更可能です。候補者登録後に詳細な面接スケジュールを設定できます。
              </p>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6" data-section="chatgpt">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">ChatGPT早期分析</h3>
              <p className="text-sm text-gray-600">履歴書情報に基づくAI分析と面接質問の生成</p>
            </div>

            {earlyAnalysisAvailable ? (
              <div className="space-y-6">
                {/* 分析開始ボタン */}
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Brain className="text-green-600 mr-3" size={24} />
                      <div>
                        <h4 className="font-medium text-green-800">履歴書段階でのAI分析</h4>
                        <p className="text-sm text-green-700">
                          面接前に候補者の適性を事前評価し、効果的な面接質問を生成します
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowChatGPTAnalysis(!showChatGPTAnalysis)}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        showChatGPTAnalysis 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      <Target className="mr-2" size={16} />
                      {showChatGPTAnalysis ? '分析を非表示' : '分析を開始'}
                    </button>
                  </div>

                  {/* 早期分析の特徴説明 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <h5 className="font-medium text-green-800 mb-2 flex items-center">
                        <Lightbulb className="mr-2" size={16} />
                        履歴書段階の分析
                      </h5>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• 基本適性の事前評価</li>
                        <li>• 強み・懸念点の早期発見</li>
                        <li>• 面接での確認ポイント特定</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <h5 className="font-medium text-blue-800 mb-2 flex items-center">
                        <MessageSquare className="mr-2" size={16} />
                        面接質問生成
                      </h5>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• 候補者に特化した質問</li>
                        <li>• 深掘りすべきポイント</li>
                        <li>• 効果的な面接の進行</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* ChatGPT分析表示 */}
                {showChatGPTAnalysis && (
                  <ChatGPTInsights 
                    candidate={getCurrentCandidateData()}
                    evaluator={chatGPTEvaluator}
                  />
                )}

                {/* 面接質問生成ボタン */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <MessageSquare className="text-blue-600 mr-3" size={20} />
                      <div>
                        <h4 className="font-medium text-blue-800">面接質問生成</h4>
                        <p className="text-sm text-blue-700">
                          履歴書情報に基づいて効果的な面接質問を生成します
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={generateInterviewQuestions}
                      disabled={loadingQuestions || !chatGPTEvaluator.hasAPIKey()}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {loadingQuestions ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          生成中...
                        </>
                      ) : (
                        <>
                          <Target className="mr-2" size={16} />
                          質問生成
                        </>
                      )}
                    </button>
                  </div>

                  {/* 生成された質問の表示 */}
                  {showInterviewQuestions && interviewQuestions.length > 0 && (
                    <div className="mt-4 bg-white rounded-lg p-4 border border-blue-100">
                      <h5 className="font-medium text-blue-800 mb-3">推奨面接質問</h5>
                      <div className="space-y-4">
                        {interviewQuestions.map((item, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-start mb-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center mr-3 mt-0.5">
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

                {/* 面接後の精度向上について */}
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                    <Target className="mr-2" size={18} />
                    面接後の分析精度向上について
                  </h4>
                  <div className="text-sm text-blue-700 space-y-2">
                    <p>
                      <strong>現在の分析:</strong> 履歴書情報のみに基づく初期評価
                    </p>
                    <p>
                      <strong>面接後の分析:</strong> 面接での回答・印象を加えた詳細評価により、以下が向上します：
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>コミュニケーション能力の正確な評価</li>
                      <li>価値観・志向性の深い理解</li>
                      <li>実際の行動パターンの把握</li>
                      <li>文化適合性の精密な判定</li>
                      <li>より具体的な採用推奨事項</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="mx-auto mb-4 text-gray-400" size={48} />
                <h4 className="text-lg font-medium text-gray-700 mb-2">早期分析には基本情報が必要です</h4>
                <p className="text-gray-600 mb-4">
                  氏名、学歴、職歴・経験、自己PRを入力するか、書類をアップロードすると、ChatGPTによる早期分析が利用可能になります
                </p>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  基本情報を入力
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              候補者情報入力
            </h2>
            <p className="text-gray-600">
              評価を開始するために候補者の情報を入力してください
            </p>
          </div>
          
          <div className="flex items-center space-x-4 ml-6">
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">入力進捗</div>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getCompletionPercentage()}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-blue-600">
                  {getCompletionPercentage()}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoSave"
                checked={autoSaveEnabled}
                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="autoSave" className="text-sm text-gray-600">
                自動保存
              </label>
            </div>
            
            <button
              type="button"
              onClick={handleAutoSave}
              disabled={!formData.name}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
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

        {/* ステップインジケーター */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4, 5, 6, 7].map((step) => (
            <React.Fragment key={step}>
              <div className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step)}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-medium transition-all ${
                    currentStep === step
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : canProceedToNextStep(step - 1) || step === 1
                        ? 'border-blue-500 text-blue-500 hover:bg-blue-50'
                        : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {step === 1 ? <Upload size={16} /> :
                   step === 5 && spiResults ? <Brain size={16} /> : 
                   step === 6 ? <Clock size={16} /> :
                   step === 7 ? <Brain size={16} /> : step - 1}
                </button>
                <div className="ml-2 text-sm">
                  <div className={`font-medium ${
                    currentStep === step ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step === 1 ? '書類' : 
                     step === 2 ? '基本情報' : 
                     step === 3 ? '学歴情報' : 
                     step === 4 ? '経験・PR' : 
                     step === 5 ? 'SPI検査' : 
                     step === 6 ? '面接情報' : 'AI分析'}
                  </div>
                  {step === 7 && earlyAnalysisAvailable && (
                    <div className="text-xs text-green-600">利用可能</div>
                  )}
                </div>
              </div>
              {step < 7 && (
                <div className={`mx-4 w-16 h-0.5 ${
                  canProceedToNextStep(step) ? 'bg-blue-500' : 'bg-gray-300'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* ステップコンテンツ */}
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>

          {/* ナビゲーションボタン */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              前へ
            </button>

            <div className="flex space-x-3">
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canProceedToNextStep(currentStep)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  次へ
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  評価を開始
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* SPI入力モーダル */}
      {showSPIInput && (
        <SPIInput
          initialData={spiResults}
          onSave={handleSPISave}
          onCancel={() => setShowSPIInput(false)}
        />
      )}
    </>
  );
};