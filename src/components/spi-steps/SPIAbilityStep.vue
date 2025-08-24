<template>
  <div>
    <div class="text-center mb-6">
      <h3 class="text-h5 font-weight-medium text-grey-darken-2 mb-2">能力検査結果</h3>
      <p class="text-body-2 text-grey-darken-1">言語能力と非言語能力の検査結果を入力してください</p>
    </div>

    <!-- 言語能力 -->
    <v-card color="blue-lighten-5" variant="flat" class="pa-6 mb-6">
      <h4 class="text-h6 font-weight-medium text-blue-darken-2 mb-4 d-flex align-center">
        <v-icon class="mr-2">mdi-book-open</v-icon>
        言語能力
      </h4>
      <v-row>
        <v-col
          v-for="field in languageFields"
          :key="field.key"
          cols="12"
          md="6"
          lg="3"
        >
          <v-text-field
            :model-value="spiData.language?.[field.key]"
            :label="field.label"
            type="number"
            min="20"
            max="80"
            placeholder="50"
            variant="outlined"
            density="comfortable"
            :error-messages="field.key === 'totalScore' ? validationErrors.languageTotal : undefined"
            :required="field.key === 'totalScore'"
            @update:model-value="updateLanguageScore(field.key, parseInt($event))"
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- 非言語能力 -->
    <v-card color="green-lighten-5" variant="flat" class="pa-6">
      <h4 class="text-h6 font-weight-medium text-green-darken-2 mb-4 d-flex align-center">
        <v-icon class="mr-2">mdi-calculator</v-icon>
        非言語能力
      </h4>
      <v-row>
        <v-col
          v-for="field in nonVerbalFields"
          :key="field.key"
          cols="12"
          md="6"
          lg="3"
        >
          <v-text-field
            :model-value="spiData.nonVerbal?.[field.key]"
            :label="field.label"
            type="number"
            min="20"
            max="80"
            placeholder="50"
            variant="outlined"
            density="comfortable"
            :error-messages="field.key === 'totalScore' ? validationErrors.nonVerbalTotal : undefined"
            :required="field.key === 'totalScore'"
            @update:model-value="updateNonVerbalScore(field.key, parseInt($event))"
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

const languageFields = [
  { key: 'totalScore' as const, label: '総合スコア（偏差値） *' },
  { key: 'vocabulary' as const, label: '語彙力' },
  { key: 'reading' as const, label: '読解力' },
  { key: 'grammar' as const, label: '文法・語法' },
  { key: 'percentile' as const, label: 'パーセンタイル' }
];

const nonVerbalFields = [
  { key: 'totalScore' as const, label: '総合スコア（偏差値） *' },
  { key: 'calculation' as const, label: '計算力' },
  { key: 'logic' as const, label: '論理的思考' },
  { key: 'spatial' as const, label: '空間把握' },
  { key: 'dataAnalysis' as const, label: 'データ分析' },
  { key: 'percentile' as const, label: 'パーセンタイル' }
];

const updateLanguageScore = (field: keyof SPIResults['language'], value: number) => {
  emit('update:spiData', {
    ...props.spiData,
    language: {
      ...props.spiData.language!,
      [field]: value
    }
  });
};

const updateNonVerbalScore = (field: keyof SPIResults['nonVerbal'], value: number) => {
  emit('update:spiData', {
    ...props.spiData,
    nonVerbal: {
      ...props.spiData.nonVerbal!,
      [field]: value
    }
  });
};
</script>