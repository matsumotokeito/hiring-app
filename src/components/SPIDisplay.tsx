import React from 'react';
import { SPIResults, SPIAnalysis } from '../types';
import { SPIAnalyzer } from '../utils/spiAnalyzer';
import { 
  Brain, 
  BookOpen, 
  Calculator, 
  Users, 
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Star,
  Award,
  Lightbulb
} from 'lucide-react';

interface SPIDisplayProps {
  spiResults: SPIResults;
  spiAnalysis?: SPIAnalysis;
  showAnalysis?: boolean;
}

export const SPIDisplay: React.FC<SPIDisplayProps> = ({
  spiResults,
  spiAnalysis,
  showAnalysis = true,
}) => {
  const getScoreColor = (score: number, isPercentile = false) => {
    const threshold = isPercentile ? [84, 69, 31, 16] : [60, 55, 45, 40];
    if (score >= threshold[0]) return 'text-green-600';
    if (score >= threshold[1]) return 'text-blue-600';
    if (score >= threshold[2]) return 'text-yellow-600';
    if (score >= threshold[3]) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number, isPercentile = false) => {
    const threshold = isPercentile ? [84, 69, 31, 16] : [60, 55, 45, 40];
    if (score >= threshold[0]) return '優秀';
    if (score >= threshold[1]) return '良好';
    if (score >= threshold[2]) return '標準';
    if (score >= threshold[3]) return 'やや低い';
    return '要改善';
  };

  const getPersonalityScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-blue-600';
    if (score >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPersonalityScoreLabel = (score: number) => {
    if (score >= 70) return '高い';
    if (score >= 50) return '標準';
    if (score >= 30) return 'やや低い';
    return '低い';
  };

  const getReliabilityDisplay = (reliability: string) => {
    switch (reliability) {
      case 'high':
        return { label: '高い', color: 'text-green-600', icon: CheckCircle };
      case 'medium':
        return { label: '普通', color: 'text-yellow-600', icon: AlertTriangle };
      case 'low':
        return { label: '低い', color: 'text-red-600', icon: AlertTriangle };
      default:
        return { label: '不明', color: 'text-gray-600', icon: AlertTriangle };
    }
  };

  const reliability = getReliabilityDisplay(spiResults.reliability);
  const ReliabilityIcon = reliability.icon;

  return (
    <div className="space-y-6">
      {/* 基本情報 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Brain className="mr-2 text-blue-600" size={20} />
          SPI適性検査結果概要
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">総合スコア</div>
            <div className={`text-2xl font-bold ${getScoreColor(spiResults.totalScore)}`}>
              {spiResults.totalScore}
            </div>
            <div className="text-xs text-gray-500">偏差値</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">パーセンタイル</div>
            <div className={`text-2xl font-bold ${getScoreColor(spiResults.percentile, true)}`}>
              {spiResults.percentile}%
            </div>
            <div className="text-xs text-gray-500">上位からの順位</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">受検時間</div>
            <div className="text-2xl font-bold text-gray-800">
              {spiResults.testDuration}分
            </div>
            <div className="text-xs text-gray-500">{spiResults.testVersion}</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">回答信頼性</div>
            <div className={`text-lg font-bold ${reliability.color} flex items-center justify-center`}>
              <ReliabilityIcon className="mr-1" size={16} />
              {reliability.label}
            </div>
            <div className="text-xs text-gray-500">
              {spiResults.testDate.toLocaleDateString('ja-JP')}
            </div>
          </div>
        </div>
      </div>

      {/* 能力検査結果 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 言語能力 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
            <BookOpen className="mr-2 text-blue-600" size={20} />
            言語能力
          </h4>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="font-medium text-gray-700">総合スコア</span>
              <div className="text-right">
                <span className={`text-xl font-bold ${getScoreColor(spiResults.language.totalScore)}`}>
                  {spiResults.language.totalScore}
                </span>
                <div className="text-xs text-gray-500">
                  {getScoreLabel(spiResults.language.totalScore)}
                </div>
              </div>
            </div>
            
            {[
              { label: '語彙力', value: spiResults.language.vocabulary },
              { label: '読解力', value: spiResults.language.reading },
              { label: '文法・語法', value: spiResults.language.grammar }
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-gray-600">{label}</span>
                <span className={`font-medium ${getScoreColor(value)}`}>
                  {value}
                </span>
              </div>
            ))}
            
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">パーセンタイル</span>
                <span className={`font-medium ${getScoreColor(spiResults.language.percentile, true)}`}>
                  {spiResults.language.percentile}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 非言語能力 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
            <Calculator className="mr-2 text-green-600" size={20} />
            非言語能力
          </h4>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-gray-700">総合スコア</span>
              <div className="text-right">
                <span className={`text-xl font-bold ${getScoreColor(spiResults.nonVerbal.totalScore)}`}>
                  {spiResults.nonVerbal.totalScore}
                </span>
                <div className="text-xs text-gray-500">
                  {getScoreLabel(spiResults.nonVerbal.totalScore)}
                </div>
              </div>
            </div>
            
            {[
              { label: '計算力', value: spiResults.nonVerbal.calculation },
              { label: '論理的思考', value: spiResults.nonVerbal.logic },
              { label: '空間把握', value: spiResults.nonVerbal.spatial },
              { label: 'データ分析', value: spiResults.nonVerbal.dataAnalysis }
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-gray-600">{label}</span>
                <span className={`font-medium ${getScoreColor(value)}`}>
                  {value}
                </span>
              </div>
            ))}
            
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">パーセンタイル</span>
                <span className={`font-medium ${getScoreColor(spiResults.nonVerbal.percentile, true)}`}>
                  {spiResults.nonVerbal.percentile}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 性格検査結果 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="font-semibold text-gray-800 mb-6 flex items-center">
          <Users className="mr-2 text-purple-600" size={20} />
          性格検査結果
        </h4>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* 行動特性 */}
          <div className="space-y-3">
            <h5 className="font-medium text-purple-800 mb-3">行動特性</h5>
            {[
              { label: 'リーダーシップ', value: spiResults.personality.behavioral.leadership },
              { label: 'チームワーク', value: spiResults.personality.behavioral.teamwork },
              { label: '積極性', value: spiResults.personality.behavioral.initiative },
              { label: '粘り強さ', value: spiResults.personality.behavioral.persistence },
              { label: '適応性', value: spiResults.personality.behavioral.adaptability },
              { label: 'コミュニケーション', value: spiResults.personality.behavioral.communication }
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{label}</span>
                <div className="text-right">
                  <span className={`font-medium ${getPersonalityScoreColor(value)}`}>
                    {value}
                  </span>
                  <div className="text-xs text-gray-500">
                    {getPersonalityScoreLabel(value)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 思考特性 */}
          <div className="space-y-3">
            <h5 className="font-medium text-yellow-800 mb-3">思考特性</h5>
            {[
              { label: '分析的思考', value: spiResults.personality.cognitive.analytical },
              { label: '創造的思考', value: spiResults.personality.cognitive.creative },
              { label: '実践的思考', value: spiResults.personality.cognitive.practical },
              { label: '戦略的思考', value: spiResults.personality.cognitive.strategic }
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{label}</span>
                <div className="text-right">
                  <span className={`font-medium ${getPersonalityScoreColor(value)}`}>
                    {value}
                  </span>
                  <div className="text-xs text-gray-500">
                    {getPersonalityScoreLabel(value)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 情緒特性 */}
          <div className="space-y-3">
            <h5 className="font-medium text-green-800 mb-3">情緒特性</h5>
            {[
              { label: '情緒安定性', value: spiResults.personality.emotional.stability },
              { label: 'ストレス耐性', value: spiResults.personality.emotional.stress },
              { label: '楽観性', value: spiResults.personality.emotional.optimism },
              { label: '共感性', value: spiResults.personality.emotional.empathy }
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{label}</span>
                <div className="text-right">
                  <span className={`font-medium ${getPersonalityScoreColor(value)}`}>
                    {value}
                  </span>
                  <div className="text-xs text-gray-500">
                    {getPersonalityScoreLabel(value)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 職務適性 */}
          <div className="space-y-3">
            <h5 className="font-medium text-red-800 mb-3">職務適性</h5>
            {[
              { label: '営業適性', value: spiResults.personality.jobFit.sales },
              { label: '管理適性', value: spiResults.personality.jobFit.management },
              { label: '技術適性', value: spiResults.personality.jobFit.technical },
              { label: '創造適性', value: spiResults.personality.jobFit.creative },
              { label: 'サービス適性', value: spiResults.personality.jobFit.service }
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{label}</span>
                <div className="text-right">
                  <span className={`font-medium ${getPersonalityScoreColor(value)}`}>
                    {value}
                  </span>
                  <div className="text-xs text-gray-500">
                    {getPersonalityScoreLabel(value)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SPI分析結果 */}
      {showAnalysis && spiAnalysis && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <h4 className="font-semibold text-gray-800 mb-6 flex items-center">
            <Lightbulb className="mr-2 text-yellow-600" size={20} />
            SPI分析結果
          </h4>

          {/* 職種適合度 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <Target className="text-blue-600 mr-2" size={20} />
                <div>
                  <p className="text-sm text-gray-600">職種適合度</p>
                  <p className={`text-2xl font-bold ${getPersonalityScoreColor(spiAnalysis.jobFitScore)}`}>
                    {spiAnalysis.jobFitScore}/100
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <Award className="text-purple-600 mr-2" size={20} />
                <div>
                  <p className="text-sm text-gray-600">管理職適性</p>
                  <p className={`text-2xl font-bold ${getPersonalityScoreColor(spiAnalysis.managementPotential)}`}>
                    {spiAnalysis.managementPotential}/100
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <Users className="text-green-600 mr-2" size={20} />
                <div>
                  <p className="text-sm text-gray-600">チーム適合度</p>
                  <p className={`text-2xl font-bold ${
                    spiAnalysis.teamFit === 'high' ? 'text-green-600' :
                    spiAnalysis.teamFit === 'medium' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {spiAnalysis.teamFit === 'high' ? '高い' :
                     spiAnalysis.teamFit === 'medium' ? '普通' : '低い'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 推奨役割 */}
          <div className="bg-white rounded-lg p-4 mb-4">
            <h5 className="font-medium text-gray-800 mb-2 flex items-center">
              <Star className="mr-2 text-yellow-600" size={16} />
              推奨役割
            </h5>
            <p className="text-gray-700">{spiAnalysis.recommendedRole}</p>
          </div>

          {/* 強みと改善領域 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {spiAnalysis.strengthAreas.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4">
                <h5 className="font-medium text-green-800 mb-2 flex items-center">
                  <CheckCircle className="mr-2\" size={16} />
                  強み領域
                </h5>
                <ul className="space-y-1">
                  {spiAnalysis.strengthAreas.map((strength, index) => (
                    <li key={index} className="text-sm text-green-700 flex items-center">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {spiAnalysis.developmentAreas.length > 0 && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <h5 className="font-medium text-yellow-800 mb-2 flex items-center">
                  <TrendingUp className="mr-2" size={16} />
                  改善領域
                </h5>
                <ul className="space-y-1">
                  {spiAnalysis.developmentAreas.map((area, index) => (
                    <li key={index} className="text-sm text-yellow-700 flex items-center">
                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2"></span>
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 性格特性の洞察 */}
          {spiAnalysis.personalityInsights.length > 0 && (
            <div className="bg-white rounded-lg p-4 mb-4">
              <h5 className="font-medium text-gray-800 mb-2">性格特性の洞察</h5>
              <ul className="space-y-2">
                {spiAnalysis.personalityInsights.map((insight, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2"></span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* リスク要因と推奨事項 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spiAnalysis.riskFactors.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4">
                <h5 className="font-medium text-red-800 mb-2 flex items-center">
                  <AlertTriangle className="mr-2\" size={16} />
                  注意点
                </h5>
                <ul className="space-y-1">
                  {spiAnalysis.riskFactors.map((risk, index) => (
                    <li key={index} className="text-sm text-red-700 flex items-center">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {spiAnalysis.recommendations.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h5 className="font-medium text-blue-800 mb-2 flex items-center">
                  <Target className="mr-2" size={16} />
                  推奨事項
                </h5>
                <ul className="space-y-1">
                  {spiAnalysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm text-blue-700 flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};