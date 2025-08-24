<template>
  <div>
    <!-- ヘッダーセクション -->
    <div class="text-center mb-12">
      <v-avatar size="80" color="primary" class="mb-6">
        <v-icon size="40" color="white">mdi-target</v-icon>
      </v-avatar>
      <h2 class="text-h3 font-weight-bold text-grey-darken-3 mb-4">
        評価対象の職種を選択
      </h2>
      <p class="text-h6 text-grey-darken-1 mx-auto" style="max-width: 600px;">
        候補者が応募している職種に応じて、最適化された評価項目で科学的な判定を行います
      </p>
    </div>

    <!-- 職種選択カード -->
    <v-row>
      <v-col
        v-for="jobType in jobTypes"
        :key="jobType.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card
          :class="[
            'job-type-card',
            { 'job-type-card--selected': selectedJobType === jobType.id }
          ]"
          :color="selectedJobType === jobType.id ? getJobTypeColor(jobType.id) : undefined"
          :variant="selectedJobType === jobType.id ? 'flat' : 'outlined'"
          height="320"
          @click="$emit('job-type-change', jobType.id)"
          hover
        >
          <v-card-text class="pa-6">
            <!-- 選択インジケーター -->
            <div class="d-flex justify-end mb-2">
              <v-icon
                v-if="selectedJobType === jobType.id"
                color="white"
                size="24"
              >
                mdi-check-circle
              </v-icon>
            </div>

            <!-- アイコンとタイトル -->
            <div class="text-center mb-4">
              <v-avatar
                :color="selectedJobType === jobType.id ? 'white' : getJobTypeColor(jobType.id)"
                size="64"
                class="mb-4"
              >
                <v-icon
                  :color="selectedJobType === jobType.id ? getJobTypeColor(jobType.id) : 'white'"
                  size="32"
                >
                  {{ getJobTypeIcon(jobType.id) }}
                </v-icon>
              </v-avatar>
              <h3
                :class="[
                  'text-h6 font-weight-bold',
                  selectedJobType === jobType.id ? 'text-white' : 'text-grey-darken-3'
                ]"
              >
                {{ jobType.name }}
              </h3>
            </div>
            
            <p
              :class="[
                'text-body-2 mb-6',
                selectedJobType === jobType.id ? 'text-white' : 'text-grey-darken-1'
              ]"
            >
              {{ jobType.description }}
            </p>
            
            <!-- 統計情報 -->
            <div class="mb-4">
              <div class="d-flex justify-space-between align-center mb-2">
                <span
                  :class="[
                    'text-caption',
                    selectedJobType === jobType.id ? 'text-white' : 'text-grey'
                  ]"
                >
                  評価項目
                </span>
                <span
                  :class="[
                    'text-caption font-weight-bold',
                    selectedJobType === jobType.id ? 'text-white' : 'text-grey-darken-2'
                  ]"
                >
                  {{ getActualEvaluationCriteria(jobType.id).length }}項目
                </span>
              </div>
              
              <div class="d-flex justify-space-between align-center">
                <span
                  :class="[
                    'text-caption',
                    selectedJobType === jobType.id ? 'text-white' : 'text-grey'
                  ]"
                >
                  評価時間
                </span>
                <span
                  :class="[
                    'text-caption font-weight-bold',
                    selectedJobType === jobType.id ? 'text-white' : 'text-grey-darken-2'
                  ]"
                >
                  約10-15分
                </span>
              </div>
            </div>

            <!-- カテゴリ別項目数 -->
            <div class="mt-4 pt-4" style="border-top: 1px solid rgba(255,255,255,0.3);">
              <p
                :class="[
                  'text-caption font-weight-medium mb-3',
                  selectedJobType === jobType.id ? 'text-white' : 'text-grey'
                ]"
              >
                カテゴリ別評価項目:
              </p>
              <v-row dense>
                <v-col
                  v-for="category in groupCriteriaByCategory(getActualEvaluationCriteria(jobType.id))"
                  :key="category.name"
                  cols="4"
                  class="text-center"
                >
                  <div
                    :class="[
                      'text-h6 font-weight-bold',
                      selectedJobType === jobType.id ? 'text-white' : 'text-grey-darken-1'
                    ]"
                  >
                    {{ category.criteria.length }}
                  </div>
                  <div
                    :class="[
                      'text-caption',
                      selectedJobType === jobType.id ? 'text-white' : 'text-grey'
                    ]"
                  >
                    {{ category.name }}
                  </div>
                </v-col>
              </v-row>
            </div>

            <!-- 選択状態 -->
            <v-card
              v-if="selectedJobType === jobType.id"
              color="white"
              class="mt-4 pa-3"
              variant="flat"
            >
              <div class="text-center">
                <v-icon :color="getJobTypeColor(jobType.id)" class="mr-2">
                  mdi-star
                </v-icon>
                <span :class="`text-${getJobTypeColor(jobType.id)} font-weight-medium`">
                  選択中 - 候補者情報の入力に進んでください
                </span>
              </div>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { JobType, JobTypeConfig } from '../types';
import { getAllJobTypesSync } from '../config/jobTypes';
import { getEvaluationCriteria } from '../utils/evaluationCriteriaStorage';

interface Props {
  selectedJobType: JobType;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'job-type-change': [jobType: JobType];
}>();

const jobTypes = getAllJobTypesSync();

const getJobTypeIcon = (jobTypeId: JobType) => {
  const icons: Record<JobType, string> = {
    fresh_sales: 'mdi-account-group',
    experienced_sales: 'mdi-briefcase',
    specialist: 'mdi-trophy',
    engineer: 'mdi-code-tags',
    part_time_base: 'mdi-store',
    part_time_sales: 'mdi-phone',
    finance_accounting: 'mdi-calculator',
    human_resources: 'mdi-account-check',
    business_development: 'mdi-trending-up',
    marketing: 'mdi-chart-bar'
  };
  return icons[jobTypeId] || 'mdi-account-group';
};

const getJobTypeColor = (jobTypeId: JobType) => {
  const colors: Record<JobType, string> = {
    fresh_sales: 'blue',
    experienced_sales: 'green',
    specialist: 'purple',
    engineer: 'orange',
    part_time_base: 'pink',
    part_time_sales: 'indigo',
    finance_accounting: 'teal',
    human_resources: 'red',
    business_development: 'amber',
    marketing: 'cyan'
  };
  return colors[jobTypeId] || 'blue';
};

const getActualEvaluationCriteria = (jobType: JobType) => {
  const managedCriteria = getEvaluationCriteria(jobType);
  if (managedCriteria && managedCriteria.length > 0) {
    return managedCriteria;
  }
  const jobConfig = jobTypes.find(jt => jt.id === jobType);
  return jobConfig?.evaluationCriteria || [];
};

const groupCriteriaByCategory = (criteria: any[]) => {
  const categories = ['能力経験', '価値観', '志向性'];
  return categories.map(category => ({
    name: category,
    criteria: criteria.filter(c => c.category === category)
  }));
};
</script>

<style scoped>
.job-type-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.job-type-card:hover {
  transform: translateY(-4px);
}

.job-type-card--selected {
  transform: translateY(-4px) scale(1.02);
}
</style>