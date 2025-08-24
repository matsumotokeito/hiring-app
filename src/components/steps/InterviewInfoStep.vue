<template>
  <div>
    <div class="text-center mb-6">
      <h3 class="text-h5 font-weight-medium text-grey-darken-2 mb-2">面接情報</h3>
      <p class="text-body-2 text-grey-darken-1">面接プロセスに関する初期情報を設定してください（任意）</p>
    </div>

    <v-card color="blue-lighten-5" variant="flat" class="pa-6">
      <h4 class="text-h6 font-weight-medium text-blue-darken-2 mb-4 d-flex align-center">
        <v-icon class="mr-2">mdi-clock</v-icon>
        面接プロセス設定
      </h4>
      
      <v-row>
        <v-col cols="12" md="6">
          <v-select
            v-model="localInterviewPhase.currentPhase"
            label="開始フェーズ"
            :items="phaseOptions"
            variant="outlined"
            density="comfortable"
            @update:model-value="updateInterviewPhase"
          />
        </v-col>

        <v-col cols="12">
          <v-textarea
            v-model="localInterviewPhase.notes"
            label="初期メモ"
            placeholder="面接に関する特記事項や注意点があれば記載してください"
            variant="outlined"
            rows="3"
            @input="updateInterviewPhase"
          />
        </v-col>
      </v-row>
    </v-card>

    <v-alert
      type="warning"
      variant="tonal"
      class="mt-4"
    >
      <template #prepend>
        <v-icon>mdi-information</v-icon>
      </template>
      <div>
        <strong>注意:</strong> 面接フェーズは後から変更可能です。候補者登録後に詳細な面接スケジュールを設定できます。
      </div>
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { InterviewPhase } from '../../types';

interface Props {
  interviewPhase: InterviewPhase;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:interviewPhase': [interviewPhase: InterviewPhase];
}>();

const localInterviewPhase = ref({ ...props.interviewPhase });

const phaseOptions = [
  { title: 'カジュアル面談', value: 'casual_interview' },
  { title: '1次面接', value: 'first_interview' },
  { title: '2次面接', value: 'second_interview' },
  { title: '最終面接', value: 'final_interview' }
];

const updateInterviewPhase = () => {
  emit('update:interviewPhase', { ...localInterviewPhase.value });
};

watch(() => props.interviewPhase, (newData) => {
  localInterviewPhase.value = { ...newData };
}, { deep: true });
</script>