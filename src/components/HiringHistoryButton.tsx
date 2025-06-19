import React, { useState } from 'react';
import { PastHiringDecisions } from './PastHiringDecisions';
import { User, History } from 'lucide-react';

interface HiringHistoryButtonProps {
  user: User;
}

export const HiringHistoryButton: React.FC<HiringHistoryButtonProps> = ({ user }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <History className="mr-2" size={16} />
        採用履歴
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <User className="mr-3 text-indigo-600" size={28} />
                  過去の採用履歴
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <PastHiringDecisions user={user} />
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};