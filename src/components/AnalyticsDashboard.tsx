import React, { useState, useEffect } from 'react';
import { HiringMetrics, JobType, User } from '../types';
import { getCandidates, getEvaluations } from '../utils/storage';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Target,
  Brain,
  DollarSign,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface AnalyticsDashboardProps {
  user: User;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ user }) => {
  const [metrics, setMetrics] = useState<HiringMetrics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [selectedPeriod]);

  const loadMetrics = async () => {
    setLoading(true);
    
    const candidates = getCandidates();
    const evaluations = getEvaluations();
    
    // 期間フィルタリング
    const now = new Date();
    const periodStart = getPeriodStart(now, selectedPeriod);
    
    const filteredCandidates = candidates.filter(c => c.createdAt >= periodStart);
    const filteredEvaluations = evaluations.filter(e => e.evaluatedAt >= periodStart);
    
    // メトリクス計算
    const hiredCount = filteredEvaluations.filter(e => e.finalDecision === 'hired').length;
    const rejectedCount = filteredEvaluations.filter(e => e.finalDecision === 'rejected').length;
    const pendingCount = filteredEvaluations.filter(e => !e.finalDecision).length;
    
    const totalScores = filteredEvaluations
      .map(e => Object.values(e.scores).reduce((sum, score) => sum + score, 0) / Object.values(e.scores).length)
      .filter(score => !isNaN(score));
    
    const averageEvaluationScore = totalScores.length > 0 
      ? totalScores.reduce((sum, score) => sum + score, 0) / totalScores.length 
      : 0;

    // 職種別分析
    const jobTypeBreakdown: Record<JobType, any> = {
      fresh_sales: { applications: 0, hires: 0, averageScore: 0, timeToHire: 0 },
      experienced_sales: { applications: 0, hires: 0, averageScore: 0, timeToHire: 0 },
      specialist: { applications: 0, hires: 0, averageScore: 0, timeToHire: 0 },
      engineer: { applications: 0, hires: 0, averageScore: 0, timeToHire: 0 }
    };

    filteredCandidates.forEach(candidate => {
      const jobType = candidate.appliedPosition;
      jobTypeBreakdown[jobType].applications++;
      
      const evaluation = filteredEvaluations.find(e => e.candidateId === candidate.id);
      if (evaluation) {
        if (evaluation.finalDecision === 'hired') {
          jobTypeBreakdown[jobType].hires++;
        }
        
        const scores = Object.values(evaluation.scores);
        if (scores.length > 0) {
          const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
          jobTypeBreakdown[jobType].averageScore = 
            (jobTypeBreakdown[jobType].averageScore + avgScore) / 2;
        }
      }
    });

    const calculatedMetrics: HiringMetrics = {
      period: selectedPeriod,
      totalApplications: filteredCandidates.length,
      totalEvaluations: filteredEvaluations.length,
      hiredCount,
      rejectedCount,
      pendingCount,
      averageTimeToHire: 14, // 仮の値
      averageEvaluationScore,
      aiAccuracy: 0, // AI機能削除により0に設定
      costPerHire: 150000, // 仮の値
      sourceEffectiveness: {
        '求人サイト': { applications: Math.floor(filteredCandidates.length * 0.4), hires: Math.floor(hiredCount * 0.3), conversionRate: 0.3 },
        '紹介': { applications: Math.floor(filteredCandidates.length * 0.3), hires: Math.floor(hiredCount * 0.5), conversionRate: 0.5 },
        '大学推薦': { applications: Math.floor(filteredCandidates.length * 0.2), hires: Math.floor(hiredCount * 0.15), conversionRate: 0.25 },
        'その他': { applications: Math.floor(filteredCandidates.length * 0.1), hires: Math.floor(hiredCount * 0.05), conversionRate: 0.2 }
      },
      jobTypeBreakdown,
      overallTurnoverRate: 0.15, // 仮の値
      turnoverByReason: {
        'voluntary': 0.08,
        'involuntary': 0.03,
        'performance': 0.02,
        'culture_fit': 0.02
      }
    };

    setMetrics(calculatedMetrics);
    setLoading(false);
  };

  const getPeriodStart = (now: Date, period: string): Date => {
    const start = new Date(now);
    switch (period) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
    return start;
  };

  const exportReport = () => {
    if (!metrics) return;
    
    const reportData = {
      生成日時: new Date().toLocaleString('ja-JP'),
      期間: selectedPeriod,
      生成者: user.name,
      メトリクス: metrics,
      インサイト: generateInsights(metrics),
      推奨事項: generateRecommendations(metrics)
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `採用分析レポート_${selectedPeriod}_${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateInsights = (metrics: HiringMetrics): string[] => {
    const insights = [];
    
    if (metrics.totalApplications > 0) {
      const conversionRate = (metrics.hiredCount / metrics.totalApplications) * 100;
      insights.push(`採用率: ${conversionRate.toFixed(1)}%`);
    }
    
    const bestSource = Object.entries(metrics.sourceEffectiveness)
      .sort((a, b) => b[1].conversionRate - a[1].conversionRate)[0];
    insights.push(`最も効果的な採用チャネル: ${bestSource[0]} (転換率: ${(bestSource[1].conversionRate * 100).toFixed(1)}%)`);
    
    return insights;
  };

  const generateRecommendations = (metrics: HiringMetrics): string[] => {
    const recommendations = [];
    
    if (metrics.averageTimeToHire > 21) {
      recommendations.push('採用プロセスの効率化を検討してください');
    }
    
    if (metrics.pendingCount > metrics.hiredCount + metrics.rejectedCount) {
      recommendations.push('未決定の候補者が多いため、判定プロセスの迅速化が必要です');
    }
    
    return recommendations;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">データの読み込みに失敗しました</p>
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
              <BarChart3 className="mr-3" size={28} />
              採用分析ダッシュボード
            </h2>
            <p className="text-gray-600 mt-1">
              データドリブンな採用戦略の立案・改善をサポート
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">過去1週間</option>
              <option value="month">過去1ヶ月</option>
              <option value="quarter">過去3ヶ月</option>
              <option value="year">過去1年</option>
            </select>
            
            <button
              onClick={loadMetrics}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="mr-2" size={16} />
              更新
            </button>
            
            <button
              onClick={exportReport}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="mr-2" size={16} />
              レポート出力
            </button>
          </div>
        </div>
      </div>

      {/* KPIカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Users className="text-blue-600 mr-3" size={24} />
            <div>
              <h3 className="text-sm font-medium text-gray-600">総応募者数</h3>
              <p className="text-2xl font-bold text-gray-800">{metrics.totalApplications}</p>
              <p className="text-xs text-gray-500 mt-1">
                評価完了: {metrics.totalEvaluations}名
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Target className="text-green-600 mr-3" size={24} />
            <div>
              <h3 className="text-sm font-medium text-gray-600">採用率</h3>
              <p className="text-2xl font-bold text-gray-800">
                {metrics.totalApplications > 0 
                  ? ((metrics.hiredCount / metrics.totalApplications) * 100).toFixed(1)
                  : 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                採用: {metrics.hiredCount}名 / 不採用: {metrics.rejectedCount}名
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Clock className="text-orange-600 mr-3" size={24} />
            <div>
              <h3 className="text-sm font-medium text-gray-600">平均採用期間</h3>
              <p className="text-2xl font-bold text-gray-800">{metrics.averageTimeToHire}日</p>
              <p className="text-xs text-gray-500 mt-1">
                未決定: {metrics.pendingCount}名
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <BarChart3 className="text-purple-600 mr-3" size={24} />
            <div>
              <h3 className="text-sm font-medium text-gray-600">平均評価スコア</h3>
              <p className="text-2xl font-bold text-gray-800">{metrics.averageEvaluationScore.toFixed(1)}/5.0</p>
              <p className="text-xs text-gray-500 mt-1">
                全体平均
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 職種別分析 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">職種別採用状況</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(metrics.jobTypeBreakdown).map(([jobType, data]) => {
            const jobTypeNames = {
              fresh_sales: '新卒営業',
              experienced_sales: '中途営業',
              specialist: '中途専門職',
              engineer: 'エンジニア'
            };
            
            const conversionRate = data.applications > 0 ? (data.hires / data.applications) * 100 : 0;
            
            return (
              <div key={jobType} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">
                  {jobTypeNames[jobType as JobType]}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">応募者:</span>
                    <span className="font-medium">{data.applications}名</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">採用:</span>
                    <span className="font-medium text-green-600">{data.hires}名</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">採用率:</span>
                    <span className="font-medium">{conversionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">平均評価:</span>
                    <span className="font-medium">{data.averageScore.toFixed(1)}/5</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 採用チャネル効果 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">採用チャネル効果分析</h3>
        <div className="space-y-4">
          {Object.entries(metrics.sourceEffectiveness).map(([source, data]) => (
            <div key={source} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{source}</h4>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                  <span>応募: {data.applications}名</span>
                  <span>採用: {data.hires}名</span>
                  <span className="font-medium text-blue-600">
                    転換率: {(data.conversionRate * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${data.conversionRate * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* インサイトと推奨事項 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="mr-2" size={20} />
            データインサイト
          </h3>
          <div className="space-y-3">
            {generateInsights(metrics).map((insight, index) => (
              <div key={index} className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Target className="mr-2" size={20} />
            改善推奨事項
          </h3>
          <div className="space-y-3">
            {generateRecommendations(metrics).map((recommendation, index) => (
              <div key={index} className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};