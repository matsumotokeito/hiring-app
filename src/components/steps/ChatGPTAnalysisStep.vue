<template>
  <div>
    <div class="text-center mb-6">
      <h3 class="text-h5 font-weight-medium text-grey-darken-2 mb-2">ChatGPT早期分析</h3>
      <p class="text-body-2 text-grey-darken-1">履歴書情報に基づくAI分析と面接質問の生成</p>
    </div>

    <div v-if="earlyAnalysisAvailable">
      <!-- 分析開始ボタン -->
      <v-card
        color="green-lighten-5"
        variant="flat"
        class="pa-6 mb-6"
      >
        <div class="d-flex justify-space-between align-center mb-4">
          <div class="d-flex align-center">
            <v-icon color="green-darken-2" size="24" class="mr-3">mdi-brain</v-icon>
            <div>
              <h4 class="text-h6 font-weight-medium text-green-darken-2">履歴書段階でのAI分析</h4>
              <p class="text-body-2 text-green-darken-1">
                面接前に候補者の適性を事前評価し、効果的な面接質問を生成します
              </p>
            </div>
          </div>
          <v-btn
            :color="showChatGPTAnalysis ? 'green-darken-1' : 'green'"
            :variant="showChatGPTAnalysis ? 'flat' : 'outlined'"
            @click="showChatGPTAnalysis = !showChatGPTAnalysis"
          >
            <v-icon start>mdi-target</v-icon>
            {{ showChatGPTAnalysis ? '分析を非表示' : '分析を開始' }}
          </v-btn>
        </div>

        <!-- 早期分析の特徴説明 -->
        <v-row>
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="pa-4">
              <h5 class="text-subtitle-1 font-weight-medium text-green-darken-2 mb-2 d-flex align-center">
                <v-icon class="mr-2">mdi-lightbulb</v-icon>
                履歴書段階の分析
              </h5>
              <ul class="text-body-2 text-green-darken-1">
                <li>基本適性の事前評価</li>
                <li>強み・懸念点の早期発見</li>
                <li>面接での確認ポイント特定</li>
              </ul>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="pa-4">
              <h5 class="text-subtitle-1 font-weight-medium text-blue-darken-2 mb-2 d-flex align-center">
                <v-icon class="mr-2">mdi-message-question</v-icon>
                面接質問生成
              </h5>
              <ul class="text-body-2 text-blue-darken-1">
                <li>候補者に特化した質問</li>
                <li>深掘りすべきポイント</li>
                <li>効果的な面接の進行</li>
              </ul>
            </v-card>
          </v-col>
        </v-row>
      </v-card>

      <!-- ChatGPT分析表示 -->
      <ChatGPTInsights
        v-if="showChatGPTAnalysis"
        :candidate="getCurrentCandidateData()"
      />

      <!-- 面接質問生成 -->
      <v-card color="blue-lighten-5" variant="flat" class="pa-4 mt-6">
        <div class="d-flex justify-space-between align-center mb-3">
          <div class="d-flex align-center">
            <v-icon color="blue-darken-2" size="20" class="mr-3">mdi-message-question</v-icon>
            <div>
              <h4 class="text-subtitle-1 font-weight-medium text-blue-darken-2">面接質問生成</h4>
              <p class="text-body-2 text-blue-darken-1">
                履歴書情報に基づいて効果的な面接質問を生成します
              </p>
            </div>
          </div>
          <v-btn
            :disabled="loadingQuestions || !hasAPIKey"
            :loading="loadingQuestions"
            color="blue-darken-1"
            @click="generateInterviewQuestions"
          >
            <v-icon start>mdi-target</v-icon>
            {{ loadingQuestions ? '生成中...' : '質問生成' }}
          </v-btn>
        </div>

        <!-- 生成された質問の表示 -->
        <div v-if="showInterviewQuestions && interviewQuestions.length > 0" class="mt-4">
          <v-card variant="outlined" class="pa-4">
            <h5 class="text-subtitle-1 font-weight-medium text-blue-darken-2 mb-3">推奨面接質問</h5>
            <div class="space-y-4">
              <v-card
                v-for="(item, index) in interviewQuestions"
                :key="index"
                variant="outlined"
                class="pa-4 mb-4"
              >
                <div class="d-flex align-start mb-3">
                  <v-avatar
                    size="24"
                    color="blue-darken-1"
                    class="mr-3 mt-1"
                  >
                    <span class="text-caption text-white font-weight-bold">{{ index + 1 }}</span>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <p class="text-body-1 font-weight-medium mb-2">{{ item.question }}</p>
                    <v-card color="blue-lighten-5" variant="flat" class="pa-3">
                      <p class="text-body-2 font-weight-medium text-blue-darken-2 mb-1">質問の目的:</p>
                      <p class="text-body-2 text-blue-darken-1">{{ item.purpose }}</p>
                    </v-card>
                  </div>
                </div>
                
                <v-row class="ml-9">
                  <v-col cols="12" md="6">
                    <p class="text-body-2 font-weight-medium text-grey-darken-2 mb-1">評価対象:</p>
                    <ul class="text-body-2 text-grey-darken-1">
                      <li v-for="(criteria, i) in item.targetCriteria" :key="i">{{ criteria }}</li>
                    </ul>
                  </v-col>
                  <v-col cols="12" md="6">
                    <p class="text-body-2 font-weight-medium text-grey-darken-2 mb-1">期待される洞察:</p>
                    <ul class="text-body-2 text-grey-darken-1">
                      <li v-for="(insight, i) in item.expectedInsights" :key="i">{{ insight }}</li>
                    </ul>
                  </v-col>
                </v-row>
              </v-card>
            </div>
          </v-card>
        </div>
      </v-card>

      <!-- 面接後の精度向上について -->
      <v-alert
        type="info"
        variant="tonal"
        class="mt-6"
      >
        <template #prepend>
          <v-icon>mdi-target</v-icon>
        </template>
        <div>
          <div class="font-weight-medium mb-2">面接後の分析精度向上について</div>
          <div class="text-body-2">
            <p><strong>現在の分析:</strong> 履歴書情報のみに基づく初期評価</p>
            <p><strong>面接後の分析:</strong> 面接での回答・印象を加えた詳細評価により、以下が向上します：</p>
            <ul class="mt-2">
              <li>コミュニケーション能力の正確な評価</li>
              <li>価値観・志向性の深い理解</li>
              <li>実際の行動パターンの把握</li>
              <li>文化適合性の精密な判定</li>
              <li>より具体的な採用推奨事項</li>
            </ul>
          </div>
        </div>
      </v-alert>
    </div>

    <div v-else class="text-center py-8">
      <v-avatar size="80" color="grey-lighten-3" class="mb-4">
        <v-icon size="48" color="grey">mdi-brain</v-icon>
      </v-avatar>
      <h4 class="text-h6 font-weight-medium text-grey-darken-1 mb-2">早期分析には基本情報が必要です</h4>
      <p class="text-body-1 text-grey-darken-1 mb-4">
        氏名、学歴、職歴・経験、自己PRを入力するか、書類をアップロードすると、ChatGPTによる早期分析が利用可能になります
      </p>
      <v-btn
        color="primary"
        @click="$emit('navigate-to-step', 2)"
      >
        基本情報を入力
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Candidate } from '../../types';
import ChatGPTInsights from '../ChatGPTInsights.vue';
import SPIDisplay from '../SPIDisplay.vue';
import SPIInput from '../SPIInput.vue';

interface Props {
  formData: Record<string, string>;
  earlyAnalysisAvailable: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'navigate-to-step': [step: number];
}>();

const showChatGPTAnalysis = ref(false);
const showInterviewQuestions = ref(false);
const interviewQuestions = ref<any[]>([]);
const loadingQuestions = ref(false);
const hasAPIKey = ref(!!localStorage.getItem('openai_api_key'));

const getCurrentCandidateData = (): Candidate => {
  return {
    id: 'temp',
    name: props.formData.name,
    email: props.formData.email || 'temp@example.com',
    phone: props.formData.phone,
    age: parseInt(props.formData.age) || 0,
    education: props.formData.education,
    major: props.formData.major,
    experience: props.formData.experience,
    selfPr: props.formData.selfPr,
    interviewNotes: props.formData.interviewNotes,
    appliedPosition: 'fresh_sales', // Default value
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

const generateInterviewQuestions = async () => {
  if (!hasAPIKey.value) {
    alert('ChatGPT APIキーが設定されていません。設定画面からAPIキーを入力してください。');
    return;
  }

  loadingQuestions.value = true;
  try {
    // ChatGPT API call would go here
    // For now, mock data
    interviewQuestions.value = [
      {
        question: "これまでの経験で最も困難だった課題と、それをどのように解決したか教えてください。",
        purpose: "問題解決能力と困難に対する取り組み姿勢を評価する",
        targetCriteria: ["問題解決力", "やり切り力"],
        expectedInsights: ["具体的な解決プロセス", "困難への対処法"]
      }
    ];
    showInterviewQuestions.value = true;
  } catch (error) {
    console.error('面接質問生成エラー:', error);
    alert('面接質問の生成に失敗しました');
  } finally {
    loadingQuestions.value = false;
  }
};
</script>