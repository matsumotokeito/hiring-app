<template>
  <v-card class="mb-6" variant="flat">
    <v-container>
      <v-stepper
        :model-value="currentStepIndex"
        :items="steps"
        hide-actions
        class="elevation-0"
      >
        <template #item.icon="{ item, step }">
          <v-avatar
            :color="getStepColor(step)"
            size="48"
          >
            <v-icon
              :color="getStepIconColor(step)"
              size="24"
            >
              {{ item.raw.icon }}
            </v-icon>
          </v-avatar>
        </template>

        <template #item.title="{ item, step }">
          <div class="text-center">
            <div
              :class="[
                'text-body-1 font-weight-medium',
                getStepTextColor(step)
              ]"
            >
              {{ item.title }}
            </div>
          </div>
        </template>
      </v-stepper>
    </v-container>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type AppState = 'job_selection' | 'candidate_input' | 'evaluation' | 'result' | 'database' | 'analytics' | 'monthly_dashboard' | 'job_posting_management' | 'company_info_management' | 'interview_management';

interface Props {
  currentState: AppState;
}

const props = defineProps<Props>();

const steps = [
  { title: '職種選択', value: 'job_selection', icon: 'mdi-target' },
  { title: '候補者情報', value: 'candidate_input', icon: 'mdi-account' },
  { title: '評価入力', value: 'evaluation', icon: 'mdi-chart-bar' },
  { title: '結果表示', value: 'result', icon: 'mdi-trophy' },
];

const currentStepIndex = computed(() => {
  return steps.findIndex(step => step.value === props.currentState) + 1;
});

const getStepColor = (step: number) => {
  const current = currentStepIndex.value;
  if (step === current) return 'primary';
  if (step < current) return 'success';
  return 'grey-lighten-2';
};

const getStepIconColor = (step: number) => {
  const current = currentStepIndex.value;
  if (step === current) return 'white';
  if (step < current) return 'white';
  return 'grey-darken-1';
};

const getStepTextColor = (step: number) => {
  const current = currentStepIndex.value;
  if (step === current) return 'text-primary';
  if (step < current) return 'text-success';
  return 'text-grey';
};
</script>