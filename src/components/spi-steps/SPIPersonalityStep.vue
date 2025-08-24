<template>
  <div>
    <div class="text-center mb-6">
      <h3 class="text-h5 font-weight-medium text-grey-darken-2 mb-2">性格検査結果</h3>
      <p class="text-body-2 text-grey-darken-1">性格特性の検査結果を入力してください（0-100の範囲）</p>
    </div>

    <!-- 行動特性 -->
    <v-card color="purple-lighten-5" variant="flat" class="pa-6 mb-6">
      <h4 class="text-h6 font-weight-medium text-purple-darken-2 mb-4 d-flex align-center">
        <v-icon class="mr-2">mdi-account-group</v-icon>
        行動特性
      </h4>
      <v-row>
        <v-col
          v-for="field in behavioralFields"
          :key="field.key"
          cols="12"
          md="6"
          lg="4"
        >
          <v-text-field
            :model-value="spiData.personality?.behavioral?.[field.key]"
            :label="field.label"
            type="number"
            min="0"
            max="100"
            placeholder="50"
            variant="outlined"
            density="comfortable"
            @update:model-value="updatePersonalityScore('behavioral', field.key, parseInt($event))"
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- 思考特性 -->
    <v-card color="yellow-lighten-5" variant="flat" class="pa-6 mb-6">
      <h4 class="text-h6 font-weight-medium text-yellow-darken-3 mb-4 d-flex align-center">
        <v-icon class="mr-2">mdi-brain</v-icon>
        思考特性
      </h4>
      <v-row>
        <v-col
          v-for="field in cognitiveFields"
          :key="field.key"
          cols="12"
          md="6"
        >
          <v-text-field
            :model-value="spiData.personality?.cognitive?.[field.key]"
            :label="field.label"
            type="number"
            min="0"
            max="100"
            placeholder="50"
            variant="outlined"
            density="comfortable"
            @update:model-value="updatePersonalityScore('cognitive', field.key, parseInt($event))"
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- 情緒特性 -->
    <v-card color="green-lighten-5" variant="flat" class="pa-6 mb-6">
      <h4 class="text-h6 font-weight-medium text-green-darken-2 mb-4">情緒特性</h4>
      <v-row>
        <v-col
          v-for="field in emotionalFields"
          :key="field.key"
          cols="12"
          md="6"
        >
          <v-text-field
            :model-value="spiData.personality?.emotional?.[field.key]"
            :label="field.label"
            type="number"
            min="0"
            max="100"
            placeholder="50"
            variant="outlined"
            density="comfortable"
            @update:model-value="updatePersonalityScore('emotional', field.key, parseInt($event))"
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- 職務適性 -->
    <v-card color="red-lighten-5" variant="flat" class="pa-6">
      <h4 class="text-h6 font-weight-medium text-red-darken-2 mb-4 d-flex align-center">
        <v-icon class="mr-2">mdi-target</v-icon>
        職務適性
      </h4>
      <v-row>
        <v-col
          v-for="field in jobFitFields"
          :key="field.key"
          cols="12"
          md="6"
          lg="4"
        >
          <v-text-field
            :model-value="spiData.personality?.jobFit?.[field.key]"
            :label="field.label"
            type="number"
            min="0"
            max="100"
            placeholder="50"
            variant="outlined"
            density="comfortable"
            @update:model-value="updatePersonalityScore('jobFit', field.key, parseInt($event))"
          />
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { SPIResults } from '../../types';

interface Props {
  spiData: Partial<SPIResults>;
  validationErrors: Record<string, string>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:spiData': [spiData: Partial<SPIResults>];
}>();

const behavioralFields = [
  { key: 'leadership', label: 'リーダーシップ' },
  { key: 'teamwork', label: 'チームワーク' },
  { key: 'initiative', label: '積極性' },
  { key: 'persistence', label: '粘り強さ' },
  { key: 'adaptability', label: '適応性' },
  { key: 'communication', label: 'コミュニケーション' }
];

const cognitiveFields = [
  { key: 'analytical', label: '分析的思考' },
  { key: 'creative', label: '創造的思考' },
  { key: 'practical', label: '実践的思考' },
  { key: 'strategic', label: '戦略的思考' }
];

const emotionalFields = [
  { key: 'stability', label: '情緒安定性' },
  { key: 'stress', label: 'ストレス耐性' },
  { key: 'optimism', label: '楽観性' },
  { key: 'empathy', label: '共感性' }
];

const jobFitFields = [
  { key: 'sales', label: '営業適性' },
  { key: 'management', label: '管理適性' },
  { key: 'technical', label: '技術適性' },
  { key: 'creative', label: '創造適性' },
  { key: 'service', label: 'サービス適性' }
];

const updatePersonalityScore = (
  category: 'behavioral' | 'cognitive' | 'emotional' | 'jobFit',
  field: string,
  value: number
) => {
  emit('update:spiData', {
    ...props.spiData,
    personality: {
      ...props.spiData.personality!,
      [category]: {
        ...props.spiData.personality?.[category],
        [field]: value
      }
    }
  });
};
</script>