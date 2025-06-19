import React from 'react';
import { Home, ArrowLeft, Users, LogOut } from 'lucide-react';
import { User } from '../types';

type AppState = 'job_selection' | 'candidate_input' | 'evaluation' | 'result' | 'database' | 'analytics' | 'monthly_dashboard' | 'job_posting_management' | 'company_info_management' | 'interview_management';

interface NavigationHeaderProps {
  currentState: AppState;
  onNavigateHome: () => void;
  onNavigateBack: () => void;
  candidateName?: string;
  user?: User;
  onLogout?: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentState,
  onNavigateHome,
  onNavigateBack,
  candidateName,
  user,
  onLogout,
}) => {
  const getPageTitle = () => {
    switch (currentState) {
      case 'job_selection':
        return 'ホーム';
      case 'candidate_input':
        return '候補者情報入力';
      case 'evaluation':
        return `評価入力${candidateName ? ` - ${candidateName}` : ''}`;
      case 'result':
        return `評価結果${candidateName ? ` - ${candidateName}` : ''}`;
      case 'database':
        return '候補者データベース';
      case 'analytics':
        return '分析ダッシュボード';
      case 'monthly_dashboard':
        return '月別ダッシュボード';
      case 'job_posting_management':
        return '求人票管理';
      case 'company_info_management':
        return '会社情報管理';
      case 'interview_management':
        return '面接管理';
      default:
        return '';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'recruiter':
        return '採用担当者';
      case 'hr_strategy':
        return '人事戦略運用担当者';
      case 'admin':
        return 'システム管理者';
      default: 
        return role;
    }
  };

  const canGoBack = currentState !== 'job_selection';
  const canGoHome = currentState !== 'job_selection';

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-4">
              <Users className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                採用マッチング判定システム
              </h1>
              <p className="text-blue-100 text-sm">
                AI支援による科学的人材評価プラットフォーム
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="text-right mr-4">
                <p className="text-sm font-medium text-white">
                  {user.name}
                </p>
                <p className="text-xs text-blue-200">
                  {getRoleDisplayName(user.role)} | {user.department}
                </p>
              </div>
            )}

            {canGoBack && (
              <button
                onClick={onNavigateBack}
                className="flex items-center px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm"
              >
                <ArrowLeft className="mr-2" size={16} />
                戻る
              </button>
            )}
            
            {canGoHome && (
              <button
                onClick={onNavigateHome}
                className="flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium"
              >
                <Home className="mr-2" size={16} />
                ホーム
              </button>
            )}

            {user && onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center px-4 py-2 bg-red-500 bg-opacity-80 text-white rounded-lg hover:bg-opacity-100 transition-all duration-200"
              >
                <LogOut className="mr-2" size={16} />
                ログアウト
              </button>
            )}
          </div>
        </div>

        {currentState !== 'job_selection' && (
          <div className="mt-4 pt-4 border-t border-blue-400 border-opacity-30">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-white">
                {getPageTitle()}
              </h2>
              <div className="text-xs text-blue-200">
                {new Date().toLocaleDateString('ja-JP', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'long'
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};