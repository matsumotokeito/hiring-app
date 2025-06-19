import React, { useState } from 'react';
import { SPIResults } from '../types';
import { 
  Brain, 
  Calculator, 
  BookOpen, 
  Users, 
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Save,
  Upload
} from 'lucide-react';

interface SPIInputProps {
  initialData?: SPIResults;
  onSave: (spiResults: SPIResults) => void;
  onCancel: () => void;
}

export const SPIInput: React.FC<SPIInputProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [spiData, setSpiData] = useState<Partial<SPIResults>>(initialData || {
    testDate: new Date(),
    testVersion: 'SPI3',
    testDuration: 65,
    reliability: 'high'
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 1: // 基本情報
        if (!spiData.testDate) errors.testDate = '受検日は必須です';
        if (!spiData.testVersion) errors.testVersion = 'テスト版本は必須です';
        if (!spiData.testDuration || spiData.testDuration < 30 || spiData.testDuration > 120) {
          errors.testDuration = '受検時間は30-120分の範囲で入力してください';
        }
        break;

      case 2: // 能力検査
        if (!spiData.language?.totalScore || spiData.language.totalScore < 20 || spiData.language.totalScore > 80) {
          errors.languageTotal = '言語総合スコアは20-80の範囲で入力してください';
        }
        if (!spiData.nonVerbal?.totalScore || spiData.nonVerbal.totalScore < 20 || spiData.nonVerbal.totalScore > 80) {
          errors.nonVerbalTotal = '非言語総合スコアは20-80の範囲で入力してください';
        }
        break;

      case 3: // 性格検査
        const behavioral = spiData.personality?.behavioral;
        if (!behavioral || Object.values(behavioral).some(v => v < 0 || v > 100)) {
          errors.behavioral = '行動特性は0-100の範囲で入力してください';
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSave = () => {
    if (validateStep(currentStep) && isFormComplete()) {
      // 総合スコアとパーセンタイルを計算
      const totalScore = (spiData.language!.totalScore + spiData.nonVerbal!.totalScore) / 2;
      const percentile = calculatePercentile(totalScore);

      const completeData: SPIResults = {
        ...spiData as SPIResults,
        totalScore,
        percentile
      };

      onSave(completeData);
    }
  };

  const calculatePercentile = (totalScore: number): number => {
    // 偏差値からパーセンタイルへの変換（簡易版）
    if (totalScore >= 60) return 84;
    if (totalScore >= 55) return 69;
    if (totalScore >= 50) return 50;
    if (totalScore >= 45) return 31;
    if (totalScore >= 40) return 16;
    return 5;
  };

  const isFormComplete = (): boolean => {
    return !!(
      spiData.testDate &&
      spiData.language?.totalScore &&
      spiData.nonVerbal?.totalScore &&
      spiData.personality?.behavioral &&
      spiData.personality?.cognitive &&
      spiData.personality?.emotional &&
      spiData.personality?.jobFit
    );
  };

  const updateLanguageScore = (field: keyof SPIResults['language'], value: number) => {
    setSpiData({
      ...spiData,
      language: {
        ...spiData.language!,
        [field]: value
      }
    });
  };

  const updateNonVerbalScore = (field: keyof SPIResults['nonVerbal'], value: number) => {
    setSpiData({
      ...spiData,
      nonVerbal: {
        ...spiData.nonVerbal!,
        [field]: value
      }
    });
  };

  const updatePersonalityScore = (
    category: 'behavioral' | 'cognitive' | 'emotional' | 'jobFit',
    field: string,
    value: number
  ) => {
    setSpiData({
      ...spiData,
      personality: {
        ...spiData.personality!,
        [category]: {
          ...spiData.personality?.[category],
          [field]: value
        }
      }
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">基本情報</h3>
              <p className="text-sm text-gray-600">SPI適性検査の基本情報を入力してください</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline mr-1" size={16} />
                  受検日 *
                </label>
                <input
                  type="date"
                  value={spiData.testDate ? spiData.testDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setSpiData({ ...spiData, testDate: new Date(e.target.value) })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    validationErrors.testDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {validationErrors.testDate && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.testDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Brain className="inline mr-1" size={16} />
                  テスト版本 *
                </label>
                <select
                  value={spiData.testVersion || ''}
                  onChange={(e) => setSpiData({ ...spiData, testVersion: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="SPI3">SPI3</option>
                  <option value="SPI-U">SPI-U</option>
                  <option value="SPI-N">SPI-N</option>
                  <option value="SPI-R">SPI-R</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  受検時間（分） *
                </label>
                <input
                  type="number"
                  min="30"
                  max="120"
                  value={spiData.testDuration || ''}
                  onChange={(e) => setSpiData({ ...spiData, testDuration: parseInt(e.target.value) })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    validationErrors.testDuration ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="65"
                />
                {validationErrors.testDuration && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.testDuration}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  回答の信頼性
                </label>
                <select
                  value={spiData.reliability || 'high'}
                  onChange={(e) => setSpiData({ ...spiData, reliability: e.target.value as 'high' | 'medium' | 'low' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="high">高い</option>
                  <option value="medium">普通</option>
                  <option value="low">低い</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">能力検査結果</h3>
              <p className="text-sm text-gray-600">言語能力と非言語能力の検査結果を入力してください</p>
            </div>

            {/* 言語能力 */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
                <BookOpen className="mr-2" size={20} />
                言語能力
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    総合スコア（偏差値） *
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="80"
                    value={spiData.language?.totalScore || ''}
                    onChange={(e) => updateLanguageScore('totalScore', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.languageTotal ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">語彙力</label>
                  <input
                    type="number"
                    min="20"
                    max="80"
                    value={spiData.language?.vocabulary || ''}
                    onChange={(e) => updateLanguageScore('vocabulary', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">読解力</label>
                  <input
                    type="number"
                    min="20"
                    max="80"
                    value={spiData.language?.reading || ''}
                    onChange={(e) => updateLanguageScore('reading', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">文法・語法</label>
                  <input
                    type="number"
                    min="20"
                    max="80"
                    value={spiData.language?.grammar || ''}
                    onChange={(e) => updateLanguageScore('grammar', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">パーセンタイル</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={spiData.language?.percentile || ''}
                    onChange={(e) => updateLanguageScore('percentile', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 非言語能力 */}
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-4 flex items-center">
                <Calculator className="mr-2" size={20} />
                非言語能力
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    総合スコア（偏差値） *
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="80"
                    value={spiData.nonVerbal?.totalScore || ''}
                    onChange={(e) => updateNonVerbalScore('totalScore', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.nonVerbalTotal ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">計算力</label>
                  <input
                    type="number"
                    min="20"
                    max="80"
                    value={spiData.nonVerbal?.calculation || ''}
                    onChange={(e) => updateNonVerbalScore('calculation', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">論理的思考</label>
                  <input
                    type="number"
                    min="20"
                    max="80"
                    value={spiData.nonVerbal?.logic || ''}
                    onChange={(e) => updateNonVerbalScore('logic', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">空間把握</label>
                  <input
                    type="number"
                    min="20"
                    max="80"
                    value={spiData.nonVerbal?.spatial || ''}
                    onChange={(e) => updateNonVerbalScore('spatial', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">データ分析</label>
                  <input
                    type="number"
                    min="20"
                    max="80"
                    value={spiData.nonVerbal?.dataAnalysis || ''}
                    onChange={(e) => updateNonVerbalScore('dataAnalysis', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">パーセンタイル</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={spiData.nonVerbal?.percentile || ''}
                    onChange={(e) => updateNonVerbalScore('percentile', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">性格検査結果</h3>
              <p className="text-sm text-gray-600">性格特性の検査結果を入力してください（0-100の範囲）</p>
            </div>

            {/* 行動特性 */}
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-4 flex items-center">
                <Users className="mr-2" size={20} />
                行動特性
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { key: 'leadership', label: 'リーダーシップ' },
                  { key: 'teamwork', label: 'チームワーク' },
                  { key: 'initiative', label: '積極性' },
                  { key: 'persistence', label: '粘り強さ' },
                  { key: 'adaptability', label: '適応性' },
                  { key: 'communication', label: 'コミュニケーション' }
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={spiData.personality?.behavioral?.[key as keyof typeof spiData.personality.behavioral] || ''}
                      onChange={(e) => updatePersonalityScore('behavioral', key, parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="50"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 思考特性 */}
            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-4 flex items-center">
                <Brain className="mr-2" size={20} />
                思考特性
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'analytical', label: '分析的思考' },
                  { key: 'creative', label: '創造的思考' },
                  { key: 'practical', label: '実践的思考' },
                  { key: 'strategic', label: '戦略的思考' }
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={spiData.personality?.cognitive?.[key as keyof typeof spiData.personality.cognitive] || ''}
                      onChange={(e) => updatePersonalityScore('cognitive', key, parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="50"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 情緒特性 */}
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-4">情緒特性</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'stability', label: '情緒安定性' },
                  { key: 'stress', label: 'ストレス耐性' },
                  { key: 'optimism', label: '楽観性' },
                  { key: 'empathy', label: '共感性' }
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={spiData.personality?.emotional?.[key as keyof typeof spiData.personality.emotional] || ''}
                      onChange={(e) => updatePersonalityScore('emotional', key, parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="50"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 職務適性 */}
            <div className="bg-red-50 rounded-lg p-6 border border-red-200">
              <h4 className="font-semibold text-red-800 mb-4 flex items-center">
                <Target className="mr-2" size={20} />
                職務適性
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { key: 'sales', label: '営業適性' },
                  { key: 'management', label: '管理適性' },
                  { key: 'technical', label: '技術適性' },
                  { key: 'creative', label: '創造適性' },
                  { key: 'service', label: 'サービス適性' }
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={spiData.personality?.jobFit?.[key as keyof typeof spiData.personality.jobFit] || ''}
                      onChange={(e) => updatePersonalityScore('jobFit', key, parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="50"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Brain className="mr-3 text-blue-600" size={28} />
                SPI適性検査結果入力
              </h2>
              <p className="text-gray-600 mt-1">
                リクルートSPI適性検査の結果を入力してください
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ステップインジケーター */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step
                    ? 'bg-blue-600 text-white'
                    : currentStep > step
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                }`}>
                  {currentStep > step ? <CheckCircle size={16} /> : step}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep === step ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step === 1 ? '基本情報' : step === 2 ? '能力検査' : '性格検査'}
                </span>
                {step < 3 && (
                  <div className={`mx-4 w-8 h-0.5 ${
                    currentStep > step ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          {renderStepContent()}
        </div>

        {/* フッター */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl">
          <div className="flex justify-between">
            <button
              onClick={currentStep === 1 ? onCancel : handlePrevious}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {currentStep === 1 ? 'キャンセル' : '前へ'}
            </button>

            <div className="flex space-x-3">
              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  次へ
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={!isFormComplete()}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Save className="mr-2" size={16} />
                  保存
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};