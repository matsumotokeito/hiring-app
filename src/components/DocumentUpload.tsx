import React, { useState } from 'react';
import { CandidateDocuments, DocumentFile, ExtractedDocumentData } from '../types';
import { DocumentProcessor } from '../utils/documentProcessor';
import { Upload, FileText, X, Brain, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface DocumentUploadProps {
  documents: CandidateDocuments;
  onDocumentsChange: (documents: CandidateDocuments) => void;
  onExtractedDataChange?: (extractedData: ExtractedDocumentData) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  documents,
  onDocumentsChange,
  onExtractedDataChange
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [documentProcessor] = useState(new DocumentProcessor());

  const handleFileUpload = async (files: FileList, type: 'resume' | 'career_history' | 'cover_letter' | 'portfolio' | 'other') => {
    const file = files[0];
    if (!file) return;

    // ファイルサイズチェック（5MB制限）
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズは5MB以下にしてください');
      return;
    }

    setProcessing(true);
    
    try {
      // ファイルをテキストとして読み込み
      const content = await readFileAsText(file);
      
      const documentFile: DocumentFile = {
        id: `doc_${Date.now()}`,
        name: file.name,
        type,
        content,
        originalFileName: file.name,
        uploadedAt: new Date()
      };

      // 書類を保存
      const newDocuments = { ...documents };
      if (type === 'other') {
        newDocuments.others = [...(newDocuments.others || []), documentFile];
      } else {
        newDocuments[type] = documentFile;
      }
      onDocumentsChange(newDocuments);

      // ChatGPTで自動抽出
      if (documentProcessor.hasAPIKey()) {
        setExtractionStatus('processing');
        try {
          const extractedData = await documentProcessor.extractDataFromDocument(documentFile);
          
          // 抽出データを書類に追加
          documentFile.extractedData = extractedData;
          onDocumentsChange(newDocuments);
          
          // 抽出データをフォームに反映
          if (onExtractedDataChange) {
            onExtractedDataChange(extractedData);
          }
          
          setExtractionStatus('success');
        } catch (error) {
          console.error('Extraction error:', error);
          setExtractionStatus('error');
        }
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert('ファイルの読み込みに失敗しました');
    } finally {
      setProcessing(false);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file as text'));
        }
      };
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsText(file);
    });
  };

  const handleDrop = (e: React.DragEvent, type: 'resume' | 'career_history' | 'cover_letter' | 'portfolio' | 'other') => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files, type);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeDocument = (type: keyof CandidateDocuments, index?: number) => {
    const newDocuments = { ...documents };
    if (type === 'others' && typeof index === 'number') {
      newDocuments.others = newDocuments.others?.filter((_, i) => i !== index);
    } else {
      delete newDocuments[type];
    }
    onDocumentsChange(newDocuments);
  };

  const DocumentUploadArea = ({ 
    type, 
    title, 
    description 
  }: { 
    type: 'resume' | 'career_history' | 'cover_letter' | 'portfolio' | 'other';
    title: string;
    description: string;
  }) => {
    const hasDocument = type === 'other' ? 
      (documents.others && documents.others.length > 0) : 
      !!documents[type];

    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
        <div className="text-center">
          <FileText className="mx-auto mb-4 text-gray-400" size={48} />
          <h4 className="font-medium text-gray-800 mb-2">{title}</h4>
          <p className="text-sm text-gray-600 mb-4">{description}</p>
          
          {hasDocument ? (
            <div className="space-y-2">
              {type === 'other' ? (
                documents.others?.map((doc, index) => (
                  <div key={doc.id} className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="text-green-600 mr-2" size={16} />
                      <span className="text-sm font-medium text-green-800">{doc.name}</span>
                    </div>
                    <button
                      onClick={() => removeDocument('others', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="text-green-600 mr-2" size={16} />
                    <span className="text-sm font-medium text-green-800">
                      {documents[type]?.name}
                    </span>
                  </div>
                  <button
                    onClick={() => removeDocument(type)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
                dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDrop={(e) => handleDrop(e, type)}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-sm text-gray-600 mb-2">
                ファイルをドラッグ&ドロップまたは
              </p>
              <label className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-700 font-medium">
                  ファイルを選択
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files, type)}
                />
              </label>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">書類アップロード</h3>
        <p className="text-sm text-gray-600">
          履歴書や職務経歴書をアップロードすると、ChatGPTが自動で情報を抽出してフォームに入力します
        </p>
      </div>

      {/* ChatGPT設定状況 */}
      <div className={`p-4 rounded-lg border ${
        documentProcessor.hasAPIKey() 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center">
          <Brain className={`mr-2 ${
            documentProcessor.hasAPIKey() ? 'text-green-600' : 'text-yellow-600'
          }`} size={20} />
          <div>
            <p className={`font-medium ${
              documentProcessor.hasAPIKey() ? 'text-green-800' : 'text-yellow-800'
            }`}>
              ChatGPT自動抽出機能
            </p>
            <p className={`text-sm ${
              documentProcessor.hasAPIKey() ? 'text-green-700' : 'text-yellow-700'
            }`}>
              {documentProcessor.hasAPIKey() 
                ? '有効 - アップロードした書類から自動で情報を抽出します'
                : 'APIキーが未設定 - 手動で情報を入力する必要があります'
              }
            </p>
          </div>
        </div>
      </div>

      {/* 抽出ステータス */}
      {extractionStatus !== 'idle' && (
        <div className={`p-4 rounded-lg border ${
          extractionStatus === 'processing' ? 'bg-blue-50 border-blue-200' :
          extractionStatus === 'success' ? 'bg-green-50 border-green-200' :
          'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center">
            {extractionStatus === 'processing' && <Loader className="animate-spin text-blue-600 mr-2" size={16} />}
            {extractionStatus === 'success' && <CheckCircle className="text-green-600 mr-2" size={16} />}
            {extractionStatus === 'error' && <AlertCircle className="text-red-600 mr-2" size={16} />}
            <span className={`text-sm font-medium ${
              extractionStatus === 'processing' ? 'text-blue-800' :
              extractionStatus === 'success' ? 'text-green-800' :
              'text-red-800'
            }`}>
              {extractionStatus === 'processing' && 'ChatGPTが書類を解析中...'}
              {extractionStatus === 'success' && '情報の抽出が完了しました'}
              {extractionStatus === 'error' && '情報の抽出に失敗しました'}
            </span>
          </div>
        </div>
      )}

      {/* アップロードエリア */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DocumentUploadArea
          type="resume"
          title="履歴書"
          description="基本情報・学歴・職歴が記載された履歴書"
        />
        
        <DocumentUploadArea
          type="career_history"
          title="職務経歴書"
          description="詳細な職歴・実績・スキルが記載された職務経歴書"
        />
        
        <DocumentUploadArea
          type="cover_letter"
          title="志望動機書"
          description="志望動機・自己PRが記載された書類"
        />
        
        <DocumentUploadArea
          type="portfolio"
          title="ポートフォリオ"
          description="作品集・実績資料（エンジニア・デザイナー等）"
        />
      </div>

      {/* その他の書類 */}
      <div>
        <h4 className="font-medium text-gray-800 mb-4">その他の書類</h4>
        <DocumentUploadArea
          type="other"
          title="その他"
          description="推薦状・資格証明書・その他の関連書類"
        />
      </div>

      {/* 処理中インジケーター */}
      {processing && (
        <div className="text-center py-4">
          <Loader className="animate-spin mx-auto mb-2 text-blue-600" size={24} />
          <p className="text-sm text-gray-600">ファイルを処理中...</p>
        </div>
      )}

      {/* 注意事項 */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-medium text-blue-800 mb-2">ご注意</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• ファイルサイズは5MB以下にしてください</li>
          <li>• 対応形式: .txt, .pdf, .doc, .docx</li>
          <li>• ChatGPT APIキーが設定されている場合、自動で情報を抽出します</li>
          <li>• 抽出された情報は確認・修正してからご利用ください</li>
          <li>• 機密情報の取り扱いにご注意ください</li>
        </ul>
      </div>
    </div>
  );
};