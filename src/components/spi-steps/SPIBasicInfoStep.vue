<template>
  <div>
    <div class="text-center mb-6">
      <h3 class="text-h5 font-weight-medium text-grey-darken-2 mb-2">基本情報</h3>
      <p class="text-body-2 text-grey-darken-1">SPI適性検査の基本情報を入力してください</p>
    </div>

    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          :model-value="spiData.testDate ? spiData.testDate.toISOString().split('T')[0] : ''"
          label="受検日"
          type="date"
          variant="outlined"
          density="comfortable"
          :error-messages="validationErrors.testDate"
          required
          @update:model-value="updateTestDate"
        >
          <template #prepend-inner>
            <v-icon>mdi-clock</v-icon>
          </template>
        </v-text-field>
      </v-col>

      <v-col cols="12" md="6">
        <v-select
          :model-value="spiData.testVersion"
          label="テスト版本"
          :items="testVersions"
          variant="outlined"
          density="comfortable"
          @update:model-value="updateSpiData('testVersion', $event)"
        >
          <template #prepend-inner>
            <v-icon>mdi-brain</v-icon>
          </template>
        </v-select>
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          :model-value="spiData.testDuration"
          label="受検時間（分）"
          type="number"
          min="30"
          max="120"
          placeholder="65"
          variant="outlined"
          density="comfortable"
          :error-messages="validationErrors.testDuration"
          required
          @update:model-value="updateSpiData('testDuration', parseInt($event))"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-select
          :model-value="spiData.reliability"
          label="回答の信頼性"
          :items="reliabilityOptions"
          variant="outlined"
          density="comfortable"
          @update:model-value="updateSpiData('reliability', $event)"
        />
      </v-col>
    </v-row>
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

const testVersions = [
  { title: 'SPI3', value: 'SPI3' },
  { title: 'SPI-U', value: 'SPI-U' },
  { title: 'SPI-N', value: 'SPI-N' },
  { title: 'SPI-R', value: 'SPI-R' }
];

const reliabilityOptions = [
  { title: '高い', value: 'high' },
  { title: '普通', value: 'medium' },
  { title: '低い', value: 'low' }
];

const updateTestDate = (value: string) => {
  updateSpiData('testDate', new Date(value));
};

const updateSpiData = (field: keyof SPIResults, value: any) => {
  emit('update:spiData', {
    ...props.spiData,
    [field]: value
  });
};
</script>