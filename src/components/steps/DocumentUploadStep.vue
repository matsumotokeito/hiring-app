<template>
  <div>
    <div class="text-center mb-6">
      <h3 class="text-h5 font-weight-medium text-grey-darken-2 mb-2">書類アップロード</h3>
      <p class="text-body-2 text-grey-darken-1">
        履歴書や職務経歴書をアップロードすると、自動で情報を抽出できます（任意）
      </p>
    </div>

    <!-- ChatGPT設定状況 -->
    <v-alert
      :type="hasAPIKey ? 'success' : 'warning'"
      variant="tonal"
      class="mb-6"
    >
      <template #prepend>
        <v-icon>mdi-brain</v-icon>
      </template>
      <div>
        <div class="font-weight-medium">ChatGPT自動抽出機能</div>
        <div class="text-body-2">
          {{ hasAPIKey 
            ? '有効 - アップロードした書類から自動で情報を抽出します'
            : 'APIキーが未設定 - 手動で情報を入力する必要があります'
          }}
        </div>
      </div>
    </v-alert>

    <!-- アップロードエリア -->
    <v-row>
      <v-col
        v-for="uploadType in uploadTypes"
        :key="uploadType.type"
        cols="12"
        md="6"
      >
        <DocumentUploadArea
          :type="uploadType.type"
          :title="uploadType.title"
          :description="uploadType.description"
          :documents="documents"
          @upload="handleFileUpload"
          @remove="handleRemoveDocument"
        />
      </v-col>
    </v-row>

    <!-- 注意事項 -->
    <v-alert
      type="info"
      variant="tonal"
      class="mt-6"
    >
      <template #prepend>
        <v-icon>mdi-information</v-icon>
      </template>
      <div>
        <div class="font-weight-medium mb-2">ご注意</div>
        <ul class="text-body-2">
          <li>ファイルサイズは5MB以下にしてください</li>
          <li>対応形式: .txt, .pdf, .doc, .docx</li>
          <li>ChatGPT APIキーが設定されている場合、自動で情報を抽出します</li>
          <li>抽出された情報は確認・修正してからご利用ください</li>
          <li>機密情報の取り扱いにご注意ください</li>
        </ul>
      </div>
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CandidateDocuments, DocumentFile, ExtractedDocumentData } from '../../types';
import DocumentUploadArea from '../DocumentUploadArea.vue';

interface Props {
  documents: CandidateDocuments;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:documents': [documents: CandidateDocuments];
  'extracted-data-change': [extractedData: ExtractedDocumentData];
}>();

const hasAPIKey = ref(!!localStorage.getItem('openai_api_key'));

const uploadTypes = [
  {
    type: 'resume',
    title: '履歴書',
    description: '基本情報・学歴・職歴が記載された履歴書'
  },
  {
    type: 'career_history',
    title: '職務経歴書',
    description: '詳細な職歴・実績・スキルが記載された職務経歴書'
  },
  {
    type: 'cover_letter',
    title: '志望動機書',
    description: '志望動機・自己PRが記載された書類'
  },
  {
    type: 'portfolio',
    title: 'ポートフォリオ',
    description: '作品集・実績資料（エンジニア・デザイナー等）'
  }
];

const handleFileUpload = (file: File, type: string) => {
  // ファイルアップロード処理
  console.log('File upload:', file, type);
};

const handleRemoveDocument = (type: string, index?: number) => {
  const newDocuments = { ...props.documents };
  if (type === 'others' && typeof index === 'number') {
    newDocuments.others = newDocuments.others?.filter((_, i) => i !== index);
  } else {
    delete newDocuments[type as keyof CandidateDocuments];
  }
  emit('update:documents', newDocuments);
};
</script>