<template>
  <div>
    <div class="text-center mb-6">
      <h3 class="text-h5 font-weight-medium text-grey-darken-2 mb-2">SPI適性検査結果</h3>
      <p class="text-body-2 text-grey-darken-1">SPI適性検査の結果がある場合は入力してください（任意）</p>
    </div>

    <div v-if="spiResults">
      <v-alert
        type="success"
        variant="tonal"
        class="mb-4"
      >
        <template #prepend>
          <v-icon>mdi-check-circle</v-icon>
        </template>
        <div>
          <div class="font-weight-medium">SPI結果が登録されています</div>
          <div class="text-body-2">
            受検日: {{ spiResults.testDate.toLocaleDateString('ja-JP') }} | 
            総合スコア: {{ spiResults.totalScore }} | 
            パーセンタイル: {{ spiResults.percentile }}%
          </div>
        </div>
        <template #append>
          <v-btn
            color="primary"
            variant="outlined"
            @click="showSPIInput = true"
          >
            <v-icon start>mdi-pencil</v-icon>
            編集
          </v-btn>
        </template>
      </v-alert>
      
      <SPIDisplay :spi-results="spiResults" :show-analysis="false" />
    </div>

    <div v-else class="text-center py-8">
      <v-avatar size="80" color="grey-lighten-3" class="mb-4">
        <v-icon size="48" color="grey">mdi-brain</v-icon>
      </v-avatar>
      <h4 class="text-h6 font-weight-medium text-grey-darken-1 mb-2">SPI適性検査結果</h4>
      <p class="text-body-1 text-grey-darken-1 mb-6">
        SPI適性検査の結果を入力すると、より詳細な分析が可能になります
      </p>
      <v-btn
        color="primary"
        size="large"
        @click="showSPIInput = true"
      >
        <v-icon start>mdi-plus</v-icon>
        SPI結果を入力
      </v-btn>
    </div>

    <!-- SPI入力モーダル -->
    <SPIInput
      v-if="showSPIInput"
      :initial-data="spiResults"
      @save="handleSPISave"
      @cancel="showSPIInput = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { SPIResults } from '../../types';
import SPIDisplay from '../SPIDisplay.vue';
import SPIInput from '../SPIInput.vue';

interface Props {
  spiResults?: SPIResults;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:spiResults': [spiResults: SPIResults | undefined];
}>();

const showSPIInput = ref(false);

const handleSPISave = (spiData: SPIResults) => {
  emit('update:spiResults', spiData);
  showSPIInput.value = false;
};
</script>