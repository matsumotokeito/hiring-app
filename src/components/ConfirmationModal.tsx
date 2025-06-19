import React from 'react';
import { AlertTriangle, X, CheckCircle, Info } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'danger' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = '確認',
  cancelText = 'キャンセル',
  onConfirm,
  onCancel,
  type = 'warning',
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: AlertTriangle,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          confirmButton: 'bg-red-600 hover:bg-red-700',
        };
      case 'info':
        return {
          icon: Info,
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          confirmButton: 'bg-blue-600 hover:bg-blue-700',
        };
      default:
        return {
          icon: AlertTriangle,
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700',
        };
    }
  };

  const styles = getTypeStyles();
  const IconComponent = styles.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* ヘッダー */}
        <div className={`${styles.bgColor} ${styles.borderColor} border-b p-6`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${styles.bgColor} mr-4`}>
              <IconComponent className={styles.iconColor} size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
        </div>
        
        {/* コンテンツ */}
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed mb-6">{message}</p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-6 py-3 text-white rounded-lg transition-colors font-medium ${styles.confirmButton}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};