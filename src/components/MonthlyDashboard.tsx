import React, { useState, useEffect } from 'react';
import { User, JobType } from '../types';
import { getCandidates, getEvaluations } from '../utils/storage';
import { 
  Calendar, 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Target,
  Award,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface MonthlyDashboardProps {
  user: User;
}

interface MonthlyMetrics {
  month: string;
  year: number;
  totalApplications: number;
  totalInterviews: number;
  totalOffers: number;
  totalHires: number;
  totalRejections: number;
  pending: number;
  conversionRate: number;
  jobTypeBreakdown: Record<JobType, {
    applications: number;
    interviews: number;
    offers: number;
    hires: number;
  }>;
}

export const MonthlyDashboard: React.FC<MonthlyDashboardProps> = ({ user }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthlyMetrics, setMonthlyMetrics] = useState<MonthlyMetrics[]>([]);
  const [selectedJobType, setSelectedJobType] = useState<JobType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'current' | 'comparison'>('current');

  useEffect(() => {
    loadMonthlyMetrics();
  }, []);

  const loadMonthlyMetrics = () => {
    const candidates = getCandidates();
    const evaluations = getEvaluations();
    
    // 過去12ヶ月のデータを生成
    const metrics: MonthlyMetrics[] = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      
      // その月の候補者をフィルタリング
      const monthCandidates = candidates.filter(c => {
        const candidateDate = new Date(c.createdAt);
        return candidateDate.getFullYear() === year && candidateDate.getMonth() === month;
      });
      
      // その月の評価をフィルタリング
      const monthEvaluations = evaluations.filter(e => {
        const evalDate = new Date(e.evaluatedAt);
        return evalDate.getFullYear() === year && evalDate.getMonth() === month;
      });
      
      // 職種別の集計
      const jobTypeBreakdown: Record<JobType, any> = {
        fresh_sales: { applications: 0, interviews: 0, offers: 0, hires: 0 },
        experienced_sales: { applications: 0, interviews: 0, offers: 0, hires: 0 },
        specialist: { applications: 0, interviews: 0, offers: 0, hires: 0 },
        engineer: { applications: 0, interviews: 0, offers: 0, hires: 0 }
      };
      
      monthCandidates.forEach(candidate => {
        const jobType = candidate.appliedPosition;
        jobTypeBreakdown[jobType].applications++;
        
        const evaluation = monthEvaluations.find(e => e.candidateId === candidate.id);
        if (evaluation) {
          jobTypeBreakdown[jobType].interviews++;
          
          if (evaluation.recommendation === 'hire') {
            jobTypeBreakdown[jobType].offers++;
          }
          
          if (evaluation.finalDecision === 'hired') {
            jobTypeBreakdown[jobType].hires++;
          }
        }
      });
      
      const totalOffers = monthEvaluations.filter(e => e.recommendation === 'hire').length;
      const totalHires = monthEvaluations.filter(e => e.finalDecision === 'hired').length;
      const totalRejections = monthEvaluations.filter(e => e.finalDecision === 'rejected').length;
      const pending = monthEvaluations.filter(e => !e.finalDecision).length;
      
      metrics.push({
        month: targetDate.toLocaleDateString('ja-JP', { month: 'long' }),
        year,
        totalApplications: monthCandidates.length,
        totalInterviews: monthEvaluations.length,
        totalOffers,
        totalHires,
        totalRejections,
        pending,
        conversionRate: monthCandidates.length > 0 ? (totalHires / monthCandidates.length) * 100 : 0,
        jobTypeBreakdown
      });
    }
    
    setMonthlyMetrics(metrics);
  };

  const getCurrentMonthMetrics = () => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    return monthlyMetrics.find(m => 
      m.year === currentYear && 
      new Date(`${m.month} 1, ${m.year}`).getMonth() === currentMonth
    ) || {
      month: currentDate.toLocaleDateString('ja-JP', { month: 'long' }),
      year: currentYear,
      totalApplications: 0,
      totalInterviews: 0,
      totalOffers: 0,
      totalHires: 0,
      totalRejections: 0,
      pending: 0,
      conversionRate: 0,
      jobTypeBreakdown: {
        fresh_sales: { applications: 0, interviews: 0, offers: 0, hires: 0 },
        experienced_sales: { applications: 0, interviews: 0, offers: 0, hires: 0 },
        specialist: { applications: 0, interviews: 0, offers: 0, hires: 0 },
        engineer: { applications: 0, interviews: 0, offers: 0, hires: 0 }
      }
    };
  };

  const getPreviousMonthMetrics = () => {
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    return monthlyMetrics.find(m => 
      m.year === prevMonth.getFullYear() && 
      new Date(`${m.month} 1, ${m.year}`).getMonth() === prevMonth.getMonth()
    );
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const currentMetrics = getCurrentMonthMetrics();
  const previousMetrics = getPreviousMonthMetrics();

  const jobTypeLabels: Record<JobType, string> = {
    fresh_sales: '新卒営業',
    experienced_sales: '中途営業',
    specialist: '中途専門職',
    engineer: 'エンジニア'
  };

  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    trend, 
    suffix = '' 
  }: { 
    title: string; 
    value: number; 
    icon: any; 
    color: string; 
    trend?: number; 
    suffix?: string; 
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value}{suffix}
          </p>
          {trend !== undefined && (
            <div className="flex items-center mt-1">
              {trend >= 0 ? (
                <TrendingUp className="text-green-500 mr-1\" size={16} />
              ) : (
                <TrendingDown className="text-red-500 mr-1" size={16} />
              )}
              <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(trend).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">前月比</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <Icon style={{ color }} size={24} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Calendar className="mr-3" size={28} />
              月別採用ダッシュボード
            </h2>
            <p className="text-gray-600 mt-1">
              採用活動の月次進捗と実績を管理
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value as JobType | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全職種</option>
              {Object.entries(jobTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('current')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'current' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                当月詳細
              </button>
              <button
                onClick={() => setViewMode('comparison')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'comparison' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                月次推移
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 月選択 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <h3 className="text-xl font-semibold text-gray-800">
            {currentMetrics.year}年 {currentMetrics.month}
          </h3>
          
          <button
            onClick={() => navigateMonth('next')}
            disabled={currentDate >= new Date()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {viewMode === 'current' ? (
        <>
          {/* KPIカード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="応募者数"
              value={currentMetrics.totalApplications}
              icon={Users}
              color="#3B82F6"
              trend={previousMetrics ? calculateTrend(currentMetrics.totalApplications, previousMetrics.totalApplications) : undefined}
              suffix="名"
            />
            
            <MetricCard
              title="面接実施数"
              value={currentMetrics.totalInterviews}
              icon={Clock}
              color="#8B5CF6"
              trend={previousMetrics ? calculateTrend(currentMetrics.totalInterviews, previousMetrics.totalInterviews) : undefined}
              suffix="件"
            />
            
            <MetricCard
              title="内定数"
              value={currentMetrics.totalOffers}
              icon={Award}
              color="#F59E0B"
              trend={previousMetrics ? calculateTrend(currentMetrics.totalOffers, previousMetrics.totalOffers) : undefined}
              suffix="名"
            />
            
            <MetricCard
              title="採用数"
              value={currentMetrics.totalHires}
              icon={UserCheck}
              color="#10B981"
              trend={previousMetrics ? calculateTrend(currentMetrics.totalHires, previousMetrics.totalHires) : undefined}
              suffix="名"
            />
          </div>

          {/* 採用ファネル */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">採用ファネル</h3>
            <div className="space-y-4">
              {[
                { label: '応募', value: currentMetrics.totalApplications, color: 'bg-blue-500', percentage: 100 },
                { label: '面接', value: currentMetrics.totalInterviews, color: 'bg-purple-500', percentage: currentMetrics.totalApplications > 0 ? (currentMetrics.totalInterviews / currentMetrics.totalApplications) * 100 : 0 },
                { label: '内定', value: currentMetrics.totalOffers, color: 'bg-yellow-500', percentage: currentMetrics.totalApplications > 0 ? (currentMetrics.totalOffers / currentMetrics.totalApplications) * 100 : 0 },
                { label: '採用', value: currentMetrics.totalHires, color: 'bg-green-500', percentage: currentMetrics.totalApplications > 0 ? (currentMetrics.totalHires / currentMetrics.totalApplications) * 100 : 0 }
              ].map((stage, index) => (
                <div key={stage.label} className="flex items-center">
                  <div className="w-20 text-sm font-medium text-gray-700">{stage.label}</div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-8 relative overflow-hidden">
                      <div
                        className={`${stage.color} h-full transition-all duration-500 flex items-center justify-center`}
                        style={{ width: `${Math.max(stage.percentage, 5)}%` }}
                      >
                        <span className="text-white text-sm font-medium">
                          {stage.value}名
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-16 text-right text-sm text-gray-600">
                    {stage.percentage.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 職種別詳細 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">職種別実績</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(currentMetrics.jobTypeBreakdown).map(([jobType, data]) => {
                if (selectedJobType !== 'all' && selectedJobType !== jobType) return null;
                
                const conversionRate = data.applications > 0 ? (data.hires / data.applications) * 100 : 0;
                
                return (
                  <div key={jobType} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-3">
                      {jobTypeLabels[jobType as JobType]}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">応募:</span>
                        <span className="font-medium">{data.applications}名</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">面接:</span>
                        <span className="font-medium">{data.interviews}件</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">内定:</span>
                        <span className="font-medium text-yellow-600">{data.offers}名</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">採用:</span>
                        <span className="font-medium text-green-600">{data.hires}名</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex justify-between">
                          <span className="text-gray-600">採用率:</span>
                          <span className="font-medium text-blue-600">{conversionRate.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* 月次推移グラフ */
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">過去12ヶ月の推移</h3>
          <div className="space-y-8">
            {/* 応募者数推移 */}
            <div>
              <h4 className="font-medium text-gray-700 mb-4">応募者数推移</h4>
              <div className="flex items-end space-x-2 h-40">
                {monthlyMetrics.slice(-12).map((metric, index) => {
                  const maxValue = Math.max(...monthlyMetrics.slice(-12).map(m => m.totalApplications));
                  const height = maxValue > 0 ? (metric.totalApplications / maxValue) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-blue-500 rounded-t transition-all duration-500 flex items-end justify-center pb-1" style={{ height: `${Math.max(height, 5)}%` }}>
                        <span className="text-white text-xs font-medium">
                          {metric.totalApplications}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-2 text-center">
                        {metric.month.slice(0, 3)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 採用率推移 */}
            <div>
              <h4 className="font-medium text-gray-700 mb-4">採用率推移</h4>
              <div className="flex items-end space-x-2 h-32">
                {monthlyMetrics.slice(-12).map((metric, index) => {
                  const maxRate = Math.max(...monthlyMetrics.slice(-12).map(m => m.conversionRate));
                  const height = maxRate > 0 ? (metric.conversionRate / maxRate) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-green-500 rounded-t transition-all duration-500 flex items-end justify-center pb-1" style={{ height: `${Math.max(height, 5)}%` }}>
                        <span className="text-white text-xs font-medium">
                          {metric.conversionRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-2 text-center">
                        {metric.month.slice(0, 3)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};