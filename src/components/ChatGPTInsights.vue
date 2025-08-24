<template>
  <div>
    <v-alert
      v-if="!hasAPIKey"
      type="warning"
      variant="tonal"
      class="mb-6"
    >
      <template #prepend>
        <v-icon>mdi-alert-triangle</v-icon>
      </template>
      <div>
        <div class="font-weight-medium">ChatGPT AI機能を利用するには</div>
        <div class="text-body-2">
          OpenAI APIキーを設定してください。設定画面でAPIキーを入力できます。
        </div>
      </div>
    </v-alert>

    <div v-else>
      <!-- 総合適性度スコア分析 -->
      <v-card class="mb-6" color="blue-lighten-5" variant="flat">
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="d-flex align-center">
            <v-icon color="blue-darken-2" class="mr-2">mdi-trophy</v-icon>
            <span class="text-h6">ChatGPT 総合適性度スコア</span>
          </div>
          <v-btn
            :disabled="loading.evaluation"
            :loading="loading.evaluation"
            color="blue-darken-1"
            @click="runEvaluation"
          >
            <v-icon start>mdi-refresh</v-icon>
            {{ loading.evaluation ? 'スコア算出中...' : 'スコア算出' }}
          </v-btn>
        </v-card-title>

        <v-card-text v-if="aiAnalysis">
          <!-- メインスコア表示 -->
          <v-card variant="outlined" class="pa-6 mb-4">
            <div class="d-flex justify-space-between align-center">
              <div class="d-flex align-center">
                <v-avatar size="64" color="blue-lighten-4" class="mr-4">
                  <v-icon size="32" color="blue-darken-2">mdi-star</v-icon>
                </v-avatar>
                <div>
                  <h4 class="text-h5 font-weight-bold">総合適性度スコア</h4>
                  <p class="text-body-2 text-grey-darken-1">ChatGPT AIによる包括的評価</p>
                </div>
              </div>
              <div class="text-right">
                <div :class="`text-h2 font-weight-bold ${getScoreColor(aiAnalysis.recommendedScore)}`">
                  {{ aiAnalysis.recommendedScore }}
                </div>
                <div class="text-h6 text-grey-darken-1">/5.0</div>
                <v-chip
                  :color="getScoreChipColor(aiAnalysis.recommendedScore)"
                  size="small"
                  class="mt-2"
                >
                  {{ getScoreLabel(aiAnalysis.recommendedScore) }}
                </v-chip>
              </div>
            </div>
            
            <v-progress-linear
              :model-value="(aiAnalysis.recommendedScore / 5) * 100"
              :color="getScoreProgressColor(aiAnalysis.recommendedScore)"
              height="16"
              rounded
              class="my-4"
            />
            
            <div class="d-flex justify-space-between text-body-2 text-grey-darken-1">
              <span>信頼度: {{ Math.round(aiAnalysis.confidence * 100) }}%</span>
              <span>求人票要件との適合度を総合評価</span>
            </div>
          </v-card>

          <!-- スコア理由の詳細説明 -->
          <v-card variant="outlined" class="pa-4 mb-4">
            <h4 class="text-subtitle-1 font-weight-medium text-grey-darken-2 mb-3 d-flex align-center">
              <v-icon class="mr-2" color="orange">mdi-lightbulb</v-icon>
              スコア算出理由
            </h4>
            <v-card color="blue-lighten-5" variant="flat" class="pa-4">
              <p class="text-body-1">{{ aiAnalysis.reasoning }}</p>
            </v-card>
          </v-card>

          <!-- 詳細分析結果 -->
          <v-row>
            <v-col v-if="aiAnalysis.strengths.length > 0" cols="12" md="6">
              <v-card color="green-lighten-5" variant="flat" class="pa-4">
                <h4 class="text-subtitle-1 font-weight-medium text-green-darken-2 mb-3 d-flex align-center">
                  <v-icon class="mr-2">mdi-check-circle</v-icon>
                  検出された強み
                </h4>
                <v-list density="compact" class="bg-transparent">
                  <v-list-item
                    v-for="(strength, index) in aiAnalysis.strengths"
                    :key="index"
                    class="pa-0 mb-2"
                  >
                    <template #prepend>
                      <v-icon size="8" color="green-darken-1" class="mr-3">mdi-circle</v-icon>
                    </template>
                    <v-list-item-title class="text-body-2 text-green-darken-1">
                      {{ strength }}
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>

            <v-col v-if="aiAnalysis.riskFactors.length > 0" cols="12" md="6">
              <v-card color="red-lighten-5" variant="flat" class="pa-4">
                <h4 class="text-subtitle-1 font-weight-medium text-red-darken-2 mb-3 d-flex align-center">
                  <v-icon class="mr-2">mdi-alert-triangle</v-icon>
                  注意すべき要因
                </h4>
                <v-list density="compact" class="bg-transparent">
                  <v-list-item
                    v-for="(risk, index) in aiAnalysis.riskFactors"
                    :key="index"
                    class="pa-0 mb-2"
                  >
                    <template #prepend>
                      <v-icon size="8" color="red-darken-1" class="mr-3">mdi-circle</v-icon>
                    </template>
                    <v-list-item-title class="text-body-2 text-red-darken-1">
                      {{ risk }}
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Candidate } from '../types';

interface Props {
  candidate: Candidate;
}

const props = defineProps<Props>();

const hasAPIKey = ref(!!localStorage.getItem('openai_api_key'));
const loading = ref({
  evaluation: false,
  matching: false,
  turnover: false,
  questions: false
});
const aiAnalysis = ref<any>(null);
const showChatGPTAnalysis = ref(false);
const showInterviewQuestions = ref(false);
const interviewQuestions = ref<any[]>([]);
const loadingQuestions = ref(false);

const runEvaluation = async () => {
  if (!hasAPIKey.value) {
    return;
  }

  loading.value.evaluation = true;
  
  try {
    // Mock AI analysis result
    aiAnalysis.value = {
      recommendedScore: 3.8,
      confidence: 0.85,
      reasoning: 'この候補者は営業職に必要な基本的な素養を備えており、特にコミュニケーション能力と学習意欲が高く評価されます。',
      strengths: [
        '優れたコミュニケーション能力',
        '高い学習意欲と成長志向',
        'チームワークを重視する姿勢'
      ],
      riskFactors: [
        '営業経験の不足',
        '論理的思考力の更なる向上が必要'
      ]
    };
  } catch (error) {
    console.error('AI評価エラー:', error);
  } finally {
    loading.value.evaluation = false;
  }
};

const getScoreColor = (score: number) => {
  if (score >= 4.0) return 'text-green-darken-1';
  if (score >= 3.0) return 'text-blue-darken-1';
  if (score >= 2.0) return 'text-orange-darken-1';
  return 'text-red-darken-1';
};

const getScoreChipColor = (score: number) => {
  if (score >= 4.0) return 'success';
  if (score >= 3.0) return 'primary';
  if (score >= 2.0) return 'warning';
  return 'error';
};

const getScoreProgressColor = (score: number) => {
  if (score >= 4.0) return 'success';
  if (score >= 3.0) return 'primary';
  if (score >= 2.0) return 'warning';
  return 'error';
};

const getScoreLabel = (score: number) => {
  if (score >= 4.5) return '優秀';
  if (score >= 4.0) return '良好';
  if (score >= 3.0) return '標準';
  if (score >= 2.0) return 'やや低い';
  return '要改善';
};
</script>