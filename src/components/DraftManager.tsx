import React from 'react';
import { SavedDraft } from '../types';
import { getDrafts, deleteDraft } from '../utils/storage';
import { Save, Trash2, Clock, User } from 'lucide-react';

interface DraftManagerProps {
  onLoadDraft: (draft: SavedDraft) => void;
  currentJobType?: string;
}

export const DraftManager: React.FC<DraftManagerProps> = ({
  onLoadDraft,
  currentJobType,
}) => {
  const [drafts, setDrafts] = React.useState<SavedDraft[]>([]);
  const [showDrafts, setShowDrafts] = React.useState(false);

  React.useEffect(() => {
    setDrafts(getDrafts());
  }, []);

  const handleDeleteDraft = (draftId: string) => {
    if (confirm('この下書きを削除しますか？')) {
      deleteDraft(draftId);
      setDrafts(getDrafts());
    }
  };

  const handleLoadDraft = (draft: SavedDraft) => {
    onLoadDraft(draft);
    setShowDrafts(false);
  };

  const filteredDrafts = currentJobType 
    ? drafts.filter(d => d.jobType === currentJobType)
    : drafts;

  if (filteredDrafts.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <button
        onClick={() => setShowDrafts(!showDrafts)}
        className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
      >
        <Save className="mr-2" size={16} />
        保存済み下書き ({filteredDrafts.length})
      </button>

      {showDrafts && (
        <div className="mt-3 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-800">保存済み下書き</h3>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredDrafts.map((draft) => (
              <div
                key={draft.id}
                className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 flex items-center">
                      <User className="mr-2" size={16} />
                      {draft.title}
                    </h4>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Clock className="mr-1" size={14} />
                      {draft.savedAt.toLocaleString('ja-JP')}
                      <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {draft.stage === 'candidate_input' ? '候補者情報' : '評価入力'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleLoadDraft(draft)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      読み込み
                    </button>
                    <button
                      onClick={() => handleDeleteDraft(draft.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};