<template>
  <div>
    <!-- 基本情報 -->
    <v-card class="mb-6" variant="outlined">
      <v-card-title class="d-flex align-center">
        <v-icon color="blue-darken-2" class="mr-2">mdi-brain</v-icon>
        <span>SPI適性検査結果概要</span>
      </v-card-title>
      
      <v-card-text>
        <v-row>
          <v-col cols="6" md="3">
            <div class="text-center pa-4 bg-blue-lighten-5 rounded">
              <div class="text-caption text-grey-darken-1 mb-1">総合スコア</div>
              <div :class="`text-h5 font-weight-bold ${getScoreColor(spiResults.totalScore)}`">
                {{ spiResults.totalScore }}
              </div>
              <div class="text-caption text-grey">偏差値</div>
            </div>
          </v-col>
          
          <v-col cols="6" md="3">
            <div class="text-center pa-4 bg-green-lighten-5 rounded">
              <div class="text-caption text-grey-darken-1 mb-1">パーセンタイル</div>
              <div :class="`text-h5 font-weight-bold ${getScoreColor(spiResults.percentile, true)}`">
                {{ spiResults.percentile }}%
              </div>
              <div class="text-caption text-grey">上位からの順位</div>
            </div>
          </v-col>
          
          <v-col cols="6" md="3">
            <div class="text-center pa-4 bg-yellow-lighten-5 rounded">
              <div class="text-caption text-grey-darken-1 mb-1">受検時間</div>
              <div class="text-h5 font-weight-bold text-grey-darken-2">
                {{ spiResults.testDuration }}分
              </div>
              <div class="text-caption text-grey">{{ spiResults.testVersion }}</div>
            </div>
          </v-col>
          
          <v-col cols="6" md="3">
            <div class="text-center pa-4 bg-purple-lighten-5 rounded">
              <div class="text-caption text-grey-darken-1 mb-1">回答信頼性</div>
              <div :class="`text-h6 font-weight-bold ${getReliabilityColor(spiResults.reliability)} d-flex align-center justify-center`">
                <v-icon :color="getReliabilityIconColor(spiResults.reliability)" class="mr-1" size="16">
                  {{ getReliabilityIcon(spiResults.reliability) }}
                </v-icon>
                {{ getReliabilityLabel(spiResults.reliability) }}
              </div>
              <div class="text-caption text-grey">
                {{ spiResults.testDate.toLocaleDateString('ja-JP') }}
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 能力検査結果 -->
    <v-row class="mb-6">
      <!-- 言語能力 -->
      <v-col cols="12" lg="6">
        <v-card variant="outlined">
          <v-card-title class="d-flex align-center">
            <v-icon color="blue-darken-2" class="mr-2">mdi-book-open</v-icon>
            <span>言語能力</span>
          </v-card-title>
          
          <v-card-text>
            <v-card color="blue-lighten-5" variant="flat" class="pa-3 mb-4">
              <div class="d-flex justify-space-between align-center">
                <span class="font-weight-medium">総合スコア</span>
                <div class="text-right">
                  <span :class="`text-h5 font-weight-bold ${getScoreColor(spiResults.language.totalScore)}`">
                    {{ spiResults.language.totalScore }}
                  </span>
                  <div class="text-caption text-grey">
                    {{ getScoreLabel(spiResults.language.totalScore) }}
                  </div>
                </div>
              </div>
            </v-card>
            
            <div class="space-y-3">
              <div
                v-for="item in [
                  { label: '語彙力', value: spiResults.language.vocabulary },
                  { label: '読解力', value: spiResults.language.reading },
                  { label: '文法・語法', value: spiResults.language.grammar }
                ]"
                :key="item.label"
                class="d-flex justify-space-between align-center"
              >
                <span class="text-grey-darken-1">{{ item.label }}</span>
                <span :class="`font-weight-medium ${getScoreColor(item.value)}`">
                  {{ item.value }}
                </span>
              </div>
            </div>
            
            <v-divider class="my-3" />
            <div class="d-flex justify-space-between align-center">
              <span class="text-grey-darken-1">パーセンタイル</span>
              <span :class="`font-weight-medium ${getScoreColor(spiResults.language.percentile, true)}`">
                {{ spiResults.language.percentile }}%
              </span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 非言語能力 -->
      <v-col cols="12" lg="6">
        <v-card variant="outlined">
          <v-card-title class="d-flex align-center">
            <v-icon color="green-darken-2" class="mr-2">mdi-calculator</v-icon>
            <span>非言語能力</span>
          </v-card-title>
          
          <v-card-text>
            <v-card color="green-lighten-5" variant="flat" class="pa-3 mb-4">
              <div class="d-flex justify-space-between align-center">
                <span class="font-weight-medium">総合スコア</span>
                <div class="text-right">
                  <span :class="`text-h5 font-weight-bold ${getScoreColor(spiResults.nonVerbal.totalScore)}`">
                    {{ spiResults.nonVerbal.totalScore }}
                  </span>
                  <div class="text-caption text-grey">
                    {{ getScoreLabel(spiResults.nonVerbal.totalScore) }}
                  </div>
                </div>
              </div>
            </v-card>
            
            <div class="space-y-3">
              <div
                v-for="item in [
                  { label: '計算力', value: spiResults.nonVerbal.calculation },
                  { label: '論理的思考', value: spiResults.nonVerbal.logic },
                  { label: '空間把握', value: spiResults.nonVerbal.spatial },
                  { label: 'データ分析', value: spiResults.nonVerbal.dataAnalysis }
                ]"
                :key="item.label"
                class="d-flex justify-space-between align-center"
              >
                <span class="text-grey-darken-1">{{ item.label }}</span>
                <span :class="`font-weight-medium ${getScoreColor(item.value)}`">
                  {{ item.value }}
                </span>
              </div>
            </div>
            
            <v-divider class="my-3" />
            <div class="d-flex justify-space-between align-center">
              <span class="text-grey-darken-1">パーセンタイル</span>
              <span :class="`font-weight-medium ${getScoreColor(spiResults.nonVerbal.percentile, true)}`">
                {{ spiResults.nonVerbal.percentile }}%
              </span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 性格検査結果 -->
    <v-card variant="outlined">
      <v-card-title class="d-flex align-center">
        <v-icon color="purple-darken-2" class="mr-2">mdi-account-group</v-icon>
        <span>性格検査結果</span>
      </v-card-title>
      
      <v-card-text>
        <v-row>
          <!-- 行動特性 -->
          <v-col cols="12" lg="3">
            <h5 class="text-subtitle-1 font-weight-medium text-purple-darken-2 mb-3">行動特性</h5>
            <div class="space-y-3">
              <div
                v-for="item in [
                  { label: 'リーダーシップ', value: spiResults.personality.behavioral.leadership },
                  { label: 'チームワーク', value: spiResults.personality.behavioral.teamwork },
                  { label: '積極性', value: spiResults.personality.behavioral.initiative },
                  { label: '粘り強さ', value: spiResults.personality.behavioral.persistence },
                  { label: '適応性', value: spiResults.personality.behavioral.adaptability },
                  { label: 'コミュニケーション', value: spiResults.personality.behavioral.communication }
                ]"
                :key="item.label"
                class="d-flex justify-space-between align-center"
              >
                <span class="text-body-2 text-grey-darken-1">{{ item.label }}</span>
                <div class="text-right">
                  <span :class="`font-weight-medium ${getPersonalityScoreColor(item.value)}`">
                    {{ item.value }}
                  </span>
                  <div class="text-caption text-grey">
                    {{ getPersonalityScoreLabel(item.value) }}
                  </div>
                </div>
              </div>
            </div>
          </v-col>

          <!-- 思考特性 -->
          <v-col cols="12" lg="3">
            <h5 class="text-subtitle-1 font-weight-medium text-yellow-darken-2 mb-3">思考特性</h5>
            <div class="space-y-3">
              <div
                v-for="item in [
                  { label: '分析的思考', value: spiResults.personality.cognitive.analytical },
                  { label: '創造的思考', value: spiResults.personality.cognitive.creative },
                  { label: '実践的思考', value: spiResults.personality.cognitive.practical },
                  { label: '戦略的思考', value: spiResults.personality.cognitive.strategic }
                ]"
                :key="item.label"
                class="d-flex justify-space-between align-center"
              >
                <span class="text-body-2 text-grey-darken-1">{{ item.label }}</span>
                <div class="text-right">
                  <span :class="`font-weight-medium ${getPersonalityScoreColor(item.value)}`">
                    {{ item.value }}
                  </span>
                  <div class="text-caption text-grey">
                    {{ getPersonalityScoreLabel(item.value) }}
                  </div>
                </div>
              </div>
            </div>
          </v-col>

          <!-- 情緒特性 -->
          <v-col cols="12" lg="3">
            <h5 class="text-subtitle-1 font-weight-medium text-green-darken-2 mb-3">情緒特性</h5>
            <div class="space-y-3">
              <div
                v-for="item in [
                  { label: '情緒安定性', value: spiResults.personality.emotional.stability },
                  { label: 'ストレス耐性', value: spiResults.personality.emotional.stress },
                  { label: '楽観性', value: spiResults.personality.emotional.optimism },
                  { label: '共感性', value: spiResults.personality.emotional.empathy }
                ]"
                :key="item.label"
                class="d-flex justify-space-between align-center"
              >
                <span class="text-body-2 text-grey-darken-1">{{ item.label }}</span>
                <div class="text-right">
                  <span :class="`font-weight-medium ${getPersonalityScoreColor(item.value)}`">
                    {{ item.value }}
                  </span>
                  <div class="text-caption text-grey">
                    {{ getPersonalityScoreLabel(item.value) }}
                  </div>
                </div>
              </div>
            </div>
          </v-col>

          <!-- 職務適性 -->
          <v-col cols="12" lg="3">
            <h5 class="text-subtitle-1 font-weight-medium text-red-darken-2 mb-3">職務適性</h5>
            <div class="space-y-3">
              <div
                v-for="item in [
                  { label: '営業適性', value: spiResults.personality.jobFit.sales },
                  { label: '管理適性', value: spiResults.personality.jobFit.management },
                  { label: '技術適性', value: spiResults.personality.jobFit.technical },
                  { label: '創造適性', value: spiResults.personality.jobFit.creative },
                  { label: 'サービス適性', value: spiResults.personality.jobFit.service }
                ]"
                :key="item.label"
                class="d-flex justify-space-between align-center"
              >
                <span class="text-body-2 text-grey-darken-1">{{ item.label }}</span>
                <div class="text-right">
                  <span :class="`font-weight-medium ${getPersonalityScoreColor(item.value)}`">
                    {{ item.value }}
                  </span>
                  <div class="text-caption text-grey">
                    {{ getPersonalityScoreLabel(item.value) }}
                  </div>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { SPIResults } from '../types';

interface Props {
  spiResults: SPIResults;
  showAnalysis?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showAnalysis: true
});

const getScoreColor = (score: number, isPercentile = false) => {
  const threshold = isPercentile ? [84, 69, 31, 16] : [60, 55, 45, 40];
  if (score >= threshold[0]) return 'text-green-darken-1';
  if (score >= threshold[1]) return 'text-blue-darken-1';
  if (score >= threshold[2]) return 'text-orange-darken-1';
  if (score >= threshold[3]) return 'text-orange-darken-2';
  return 'text-red-darken-1';
};

const getScoreLabel = (score: number, isPercentile = false) => {
  const threshold = isPercentile ? [84, 69, 31, 16] : [60, 55, 45, 40];
  if (score >= threshold[0]) return '優秀';
  if (score >= threshold[1]) return '良好';
  if (score >= threshold[2]) return '標準';
  if (score >= threshold[3]) return 'やや低い';
  return '要改善';
};

const getPersonalityScoreColor = (score: number) => {
  if (score >= 70) return 'text-green-darken-1';
  if (score >= 50) return 'text-blue-darken-1';
  if (score >= 30) return 'text-orange-darken-1';
  return 'text-red-darken-1';
};

const getPersonalityScoreLabel = (score: number) => {
  if (score >= 70) return '高い';
  if (score >= 50) return '標準';
  if (score >= 30) return 'やや低い';
  return '低い';
};

const getReliabilityColor = (reliability: string) => {
  switch (reliability) {
    case 'high': return 'text-green-darken-1';
    case 'medium': return 'text-orange-darken-1';
    case 'low': return 'text-red-darken-1';
    default: return 'text-grey-darken-1';
  }
};

const getReliabilityIcon = (reliability: string) => {
  switch (reliability) {
    case 'high': return 'mdi-check-circle';
    case 'medium': return 'mdi-alert-triangle';
    case 'low': return 'mdi-alert-triangle';
    default: return 'mdi-alert-triangle';
  }
};

const getReliabilityIconColor = (reliability: string) => {
  switch (reliability) {
    case 'high': return 'green-darken-1';
    case 'medium': return 'orange-darken-1';
    case 'low': return 'red-darken-1';
    default: return 'grey-darken-1';
  }
};

const getReliabilityLabel = (reliability: string) => {
  switch (reliability) {
    case 'high': return '高い';
    case 'medium': return '普通';
    case 'low': return '低い';
    default: return '不明';
  }
};
</script>