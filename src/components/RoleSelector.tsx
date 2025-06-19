import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Users, Shield, BarChart3, UserCheck, Star, Zap, Award } from 'lucide-react';

interface RoleSelectorProps {
  onRoleSelect: (user: User) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onRoleSelect }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState('');

  const roles = [
    {
      id: 'recruiter' as UserRole,
      name: '採用担当者',
      description: '候補者の評価・面接・採用判定を行う',
      icon: UserCheck,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      permissions: [
        '候補者情報の入力・編集',
        '評価の実施・保存',
        '採用判定の実行',
        '面接スケジュール管理',
        'ChatGPT AI予測の参照',
        '個別レポートの出力'
      ]
    },
    {
      id: 'hr_strategy' as UserRole,
      name: '人事戦略運用担当者',
      description: '採用戦略の分析・改善・求人票管理を行う',
      icon: BarChart3,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      permissions: [
        '全体データの分析・閲覧',
        '採用メトリクスの監視',
        '求人票の管理・編集',
        '会社情報の管理・設定',
        '面接プロセス設計',
        '戦略レポートの作成',
        'システム設定の変更'
      ]
    },
    {
      id: 'admin' as UserRole,
      name: 'システム管理者',
      description: 'システム全体の管理・設定を行う',
      icon: Shield,
      color: 'red',
      gradient: 'from-red-500 to-red-600',
      permissions: [
        'ユーザー管理',
        'システム設定',
        'データバックアップ',
        'セキュリティ管理',
        '全機能へのアクセス'
      ]
    }
  ];

  const handleLogin = () => {
    if (!selectedRole || !userName.trim()) return;

    const user: User = {
      id: Date.now().toString(),
      name: userName,
      email: `${userName.toLowerCase()}@company.com`,
      role: selectedRole,
      department: selectedRole === 'recruiter' ? '人事部採用課' : '人事部戦略企画課',
      permissions: getPermissionsForRole(selectedRole)
    };

    onRoleSelect(user);
  };

  const getPermissionsForRole = (role: UserRole) => {
    switch (role) {
      case 'recruiter':
        return [
          { action: 'view' as const, resource: 'candidates' as const },
          { action: 'create' as const, resource: 'candidates' as const },
          { action: 'edit' as const, resource: 'candidates' as const },
          { action: 'view' as const, resource: 'evaluations' as const },
          { action: 'create' as const, resource: 'evaluations' as const },
          { action: 'edit' as const, resource: 'evaluations' as const },
          { action: 'export' as const, resource: 'reports' as const },
          { action: 'view' as const, resource: 'job_postings' as const },
          { action: 'view' as const, resource: 'interviews' as const },
          { action: 'create' as const, resource: 'interviews' as const },
          { action: 'edit' as const, resource: 'interviews' as const }
        ];
      case 'hr_strategy':
        return [
          { action: 'view' as const, resource: 'candidates' as const },
          { action: 'view' as const, resource: 'evaluations' as const },
          { action: 'view_analytics' as const, resource: 'reports' as const },
          { action: 'export' as const, resource: 'reports' as const },
          { action: 'view' as const, resource: 'job_postings' as const },
          { action: 'create' as const, resource: 'job_postings' as const },
          { action: 'edit' as const, resource: 'job_postings' as const },
          { action: 'delete' as const, resource: 'job_postings' as const },
          { action: 'view' as const, resource: 'company_info' as const },
          { action: 'edit' as const, resource: 'company_info' as const },
          { action: 'view' as const, resource: 'interviews' as const },
          { action: 'view_analytics' as const, resource: 'interviews' as const }
        ];
      case 'admin':
        return [
          { action: 'view' as const, resource: 'candidates' as const },
          { action: 'create' as const, resource: 'candidates' as const },
          { action: 'edit' as const, resource: 'candidates' as const },
          { action: 'delete' as const, resource: 'candidates' as const },
          { action: 'view' as const, resource: 'evaluations' as const },
          { action: 'create' as const, resource: 'evaluations' as const },
          { action: 'edit' as const, resource: 'evaluations' as const },
          { action: 'delete' as const, resource: 'evaluations' as const },
          { action: 'view_analytics' as const, resource: 'reports' as const },
          { action: 'export' as const, resource: 'reports' as const },
          { action: 'view' as const, resource: 'job_postings' as const },
          { action: 'create' as const, resource: 'job_postings' as const },
          { action: 'edit' as const, resource: 'job_postings' as const },
          { action: 'delete' as const, resource: 'job_postings' as const },
          { action: 'view' as const, resource: 'company_info' as const },
          { action: 'edit' as const, resource: 'company_info' as const },
          { action: 'view' as const, resource: 'interviews' as const },
          { action: 'create' as const, resource: 'interviews' as const },
          { action: 'edit' as const, resource: 'interviews' as const },
          { action: 'delete' as const, resource: 'interviews' as const }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full p-8 border border-gray-100">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-6 shadow-lg">
            <Users className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            採用マッチング判定システム
          </h1>
          <p className="text-gray-600 text-lg">
            AI支援による科学的人材評価プラットフォーム
          </p>
          <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Star className="mr-1 text-yellow-500" size={16} />
              <span>AI評価機能</span>
            </div>
            <div className="flex items-center">
              <Zap className="mr-1 text-blue-500" size={16} />
              <span>面接管理</span>
            </div>
            <div className="flex items-center">
              <Award className="mr-1 text-green-500" size={16} />
              <span>科学的判定</span>
            </div>
          </div>
        </div>

        {/* 役割選択 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 text-left hover:shadow-xl hover:scale-105 transform ${
                  isSelected
                    ? `border-${role.color}-500 bg-gradient-to-br from-${role.color}-50 to-${role.color}-100 shadow-xl scale-105`
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {/* 選択インジケーター */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className={`w-6 h-6 bg-gradient-to-r ${role.gradient} rounded-full flex items-center justify-center`}>
                      <Star className="text-white" size={14} />
                    </div>
                  </div>
                )}

                {/* アイコンとタイトル */}
                <div className="flex items-center mb-6">
                  <div className={`p-4 rounded-xl ${
                    isSelected 
                      ? `bg-gradient-to-r ${role.gradient} shadow-lg` 
                      : `bg-${role.color}-100 group-hover:bg-${role.color}-200`
                  } transition-all duration-300`}>
                    <Icon 
                      className={`${
                        isSelected 
                          ? 'text-white' 
                          : `text-${role.color}-600`
                      }`} 
                      size={28} 
                    />
                  </div>
                  <div className="ml-4">
                    <h3 className={`font-bold text-xl ${
                      isSelected ? `text-${role.color}-800` : 'text-gray-800'
                    }`}>
                      {role.name}
                    </h3>
                  </div>
                </div>
                
                <p className={`text-sm mb-6 leading-relaxed ${
                  isSelected ? `text-${role.color}-700` : 'text-gray-600'
                }`}>
                  {role.description}
                </p>
                
                {/* 権限リスト */}
                <div className="space-y-2">
                  <p className={`text-xs font-semibold ${
                    isSelected ? `text-${role.color}-700` : 'text-gray-500'
                  }`}>
                    主な権限:
                  </p>
                  {role.permissions.slice(0, 4).map((permission, index) => (
                    <p key={index} className={`text-xs flex items-start ${
                      isSelected ? `text-${role.color}-600` : 'text-gray-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 ${
                        isSelected ? `bg-${role.color}-500` : 'bg-gray-400'
                      } rounded-full mr-2 mt-1.5`}></span>
                      {permission}
                    </p>
                  ))}
                  {role.permissions.length > 4 && (
                    <p className={`text-xs ${
                      isSelected ? `text-${role.color}-600` : 'text-gray-500'
                    }`}>
                      他 {role.permissions.length - 4} 項目...
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* ユーザー情報入力 */}
        {selectedRole && (
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-6 text-lg">ユーザー情報を入力</h4>
            <div className="flex items-center space-x-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  お名前
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  placeholder="山田 太郎"
                />
              </div>
              <button
                onClick={handleLogin}
                disabled={!userName.trim()}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                ログイン
              </button>
            </div>
          </div>
        )}

        {/* フッター */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500 mb-2">
            © 2025 採用マッチング判定システム - 機密情報の取り扱いにご注意ください
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
            <span>セキュア認証</span>
            <span>•</span>
            <span>データ暗号化</span>
            <span>•</span>
            <span>プライバシー保護</span>
          </div>
        </div>
      </div>
    </div>
  );
};