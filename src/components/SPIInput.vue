<template>
  <v-dialog
    :model-value="true"
    max-width="1200"
    persistent
    scrollable
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon color="blue-darken-2" class="mr-3" size="28">mdi-brain</v-icon>
        <div>
          <h2 class="text-h5 font-weight-bold">SPI適性検査結果入力</h2>
          <p class="text-body-2 text-grey-darken-1 ma-0">
            リクルートSPI適性検査の結果を入力してください
          </p>
        </div>
        <v-spacer />
        <v-btn
          icon
          variant="text"
          @click="$emit('cancel')"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- ステップインジケーター -->
      <v-card-text class="pa-0">
        <v-stepper
          v-model="currentStep"
          :items="stepItems"
          hide-actions
          class="elevation-0"
        />
      </v-card-text>

      <!-- コンテンツ -->
      <v-card-text class="pa-6">
        <component
          :is="getCurrentStepComponent()"
          v-model:spi-data="spiData"
          :validation-errors="validationErrors"
        />
      </v-card-text>

      <!-- フッター -->
      <v-card-actions class="pa-6">
        <v-btn
          @click="currentStep === 1 ? $emit('cancel') : handlePrevious()"
        >
          {{ currentStep === 1 ? 'キャンセル' : '前へ' }}
        </v-btn>

        <v-spacer />

        <v-btn
          v-if="currentStep < 3"
          color="primary"
          @click="handleNext"
        >
          次へ
        </v-btn>
        <v-btn
          v-else
          :disabled="!isFormComplete()"
          color="success"
          @click="handleSave"
        >
          <v-icon start>mdi-content-save</v-icon>
          保存
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { SPIResults } from '../types';

// Step components
import SPIBasicInfoStep from './spi-steps/SPIBasicInfoStep.vue';
import SPIAbilityStep from './spi-steps/SPIAbilityStep.vue';
import SPIPersonalityStep from './spi-steps/SPIPersonalityStep.vue';

interface Props {
  initialData?: SPIResults;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'save': [spiResults: SPIResults];
  'cancel': [];
}>();

const currentStep = ref(1);
const validationErrors = ref<Record<string, string>>({});

const spiData = ref<Partial<SPIResults>>(props.initialData || {
  testDate: new Date(),
  testVersion: 'SPI3',
  testDuration: 65,
  reliability: 'high'
});

const stepItems = [
  { title: '基本情報', value: 1 },
  { title: '能力検査', value: 2 },
  { title: '性格検査', value: 3 }
];

const getCurrentStepComponent = () => {
  const components = [
    null,
    SPIBasicInfoStep,
    SPIAbilityStep,
    SPIPersonalityStep
  ];
  return components[currentStep.value];
};

const validateStep = (step: number): boolean => {
  const errors: Record<string, string> = {};

  switch (step) {
    case 1:
      if (!spiData.value.testDate) errors.testDate = '受検日は必須です';
      if (!spiData.value.testVersion) errors.testVersion = 'テスト版本は必須です';
      if (!spiData.value.testDuration || spiData.value.testDuration < 30 || spiData.value.testDuration > 120) {
        errors.testDuration = '受検時間は30-120分の範囲で入力してください';
      }
      break;

    case 2:
      if (!spiData.value.language?.totalScore || spiData.value.language.totalScore < 20 || spiData.value.language.totalScore > 80) {
        errors.languageTotal = '言語総合スコアは20-80の範囲で入力してください';
      }
      if (!spiData.value.nonVerbal?.totalScore || spiData.value.nonVerbal.totalScore < 20 || spiData.value.nonVerbal.totalScore > 80) {
        errors.nonVerbalTotal = '非言語総合スコアは20-80の範囲で入力してください';
      }
      break;

    case 3:
      const behavioral = spiData.value.personality?.behavioral;
      if (!behavioral || Object.values(behavioral).some(v => v < 0 || v > 100)) {
        errors.behavioral = '行動特性は0-100の範囲で入力してください';
      }
      break;
  }

  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const handleNext = () => {
  if (validateStep(currentStep.value)) {
    currentStep.value++;
  }
};

const handlePrevious = () => {
  currentStep.value--;
};

const handleSave = () => {
  if (validateStep(currentStep.value) && isFormComplete()) {
    const totalScore = (spiData.value.language!.totalScore + spiData.value.nonVerbal!.totalScore) / 2;
    const percentile = calculatePercentile(totalScore);

    const completeData: SPIResults = {
      ...spiData.value as SPIResults,
      totalScore,
      percentile
    };

    emit('save', completeData);
  }
};

const calculatePercentile = (totalScore: number): number => {
  if (totalScore >= 60) return 84;
  if (totalScore >= 55) return 69;
  if (totalScore >= 50) return 50;
  if (totalScore >= 45) return 31;
  if (totalScore >= 40) return 16;
  return 5;
};

const isFormComplete = (): boolean => {
  return !!(
    spiData.value.testDate &&
    spiData.value.language?.totalScore &&
    spiData.value.nonVerbal?.totalScore &&
    spiData.value.personality?.behavioral &&
    spiData.value.personality?.cognitive &&
    spiData.value.personality?.emotional &&
    spiData.value.personality?.jobFit
  );
};
</script>